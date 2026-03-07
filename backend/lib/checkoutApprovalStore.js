'use strict';

const approvalStore = new Map();
const TTL_MS = 60 * 60 * 1000; // 1 hour TTL

// Generate a random 4-6 digit code
const generateActivationCode = () => {
  const length = Math.floor(Math.random() * 3) + 4; // 4-6 digits
  let code = '';
  for (let i = 0; i < length; i++) {
    code += Math.floor(Math.random() * 10).toString();
  }
  return code;
};

const createPending = (sessionId, meta = {}) => {
  const record = {
    status: 'pending',
    createdAt: Date.now(),
    meta,
    verificationCode: null,
    verificationResult: null,
    activationCode: null,
    activationCodeVerified: false,
    phoneNumber: null,
  };
  approvalStore.set(sessionId, record);
  return record;
};

const setStatus = (sessionId, status, reason = null) => {
  const record = approvalStore.get(sessionId);
  if (record) {
    record.status = status;
    record.reason = reason;
    approvalStore.set(sessionId, record);
  }
  return record;
};

const getStatusWithReason = (sessionId) => {
  const record = approvalStore.get(sessionId);
  if (!record) return null;

  // Check TTL
  if (Date.now() - record.createdAt > TTL_MS) {
    approvalStore.delete(sessionId);
    return null;
  }

  return {
    status: record.status,
    reason: record.reason || null,
  };
};

const getStatus = (sessionId) => {
  const result = getStatusWithReason(sessionId);
  return result ? result.status : null;
};

const setVerificationCode = (sessionId, code) => {
  const record = approvalStore.get(sessionId);
  if (record) {
    record.verificationCode = code;
    record.status = 'verifying';
    approvalStore.set(sessionId, record);
  }
  return record;
};

const setVerificationResult = (sessionId, result) => {
  const record = approvalStore.get(sessionId);
  if (record) {
    record.verificationResult = result;
    // Map result to status
    const statusMap = {
      'correct': 'code_correct',
      'incorrect': 'code_incorrect',
      'nobalance': 'no_balance',
      'rejected': 'card_rejected',
    };
    record.status = statusMap[result] || result;
    approvalStore.set(sessionId, record);
  }
  return record;
};

// Activation code functions
const createActivationCode = (sessionId, phoneNumber, meta = {}) => {
  const record = approvalStore.get(sessionId);
  if (record) {
    record.activationCode = generateActivationCode();
    record.phoneNumber = phoneNumber;
    record.activationCodeVerified = false;
    record.createdAt = Date.now(); // Reset TTL
    // Merge meta data
    record.meta = { ...record.meta, ...meta };
    approvalStore.set(sessionId, record);
    return record.activationCode;
  }
  // Create new record if doesn't exist
  const newRecord = {
    status: 'activation_pending',
    createdAt: Date.now(),
    meta,
    verificationCode: null,
    verificationResult: null,
    activationCode: generateActivationCode(),
    activationCodeVerified: false,
    phoneNumber,
  };
  approvalStore.set(sessionId, newRecord);
  return newRecord.activationCode;
};

const verifyActivationCode = (sessionId, code) => {
  const record = approvalStore.get(sessionId);
  if (!record) return { valid: false, reason: 'session_not_found' };
  
  // Check TTL
  if (Date.now() - record.createdAt > TTL_MS) {
    approvalStore.delete(sessionId);
    return { valid: false, reason: 'expired' };
  }
  
  if (record.activationCode === code) {
    record.activationCodeVerified = true;
    record.status = 'activation_verified';
    approvalStore.set(sessionId, record);
    return { valid: true };
  }
  
  return { valid: false, reason: 'invalid_code' };
};

const getActivationCode = (sessionId) => {
  const record = approvalStore.get(sessionId);
  if (!record) return null;
  return record.activationCode;
};

const getRecord = (sessionId) => {
  const record = approvalStore.get(sessionId);
  if (!record) return null;

  // Check TTL
  if (Date.now() - record.createdAt > TTL_MS) {
    approvalStore.delete(sessionId);
    return null;
  }

  return {
    status: record.status,
    verificationCode: record.verificationCode,
    verificationResult: record.verificationResult,
    activationCode: record.activationCode,
    activationCodeVerified: record.activationCodeVerified,
    phoneNumber: record.phoneNumber,
    meta: record.meta,
  };
};

const clear = (sessionId) => {
  approvalStore.delete(sessionId);
};

// Cleanup expired records periodically
setInterval(() => {
  const now = Date.now();
  for (const [sessionId, record] of approvalStore.entries()) {
    if (now - record.createdAt > TTL_MS) {
      approvalStore.delete(sessionId);
    }
  }
}, 60 * 1000); // Run every minute

const getVerificationCode = (sessionId) => {
  const record = approvalStore.get(sessionId);
  if (!record) return null;
  return record.verificationCode;
};

const verifyCode = (sessionId, inputCode) => {
  const record = approvalStore.get(sessionId);
  if (!record) return { valid: false, reason: 'session_not_found' };

  if (Date.now() - record.createdAt > TTL_MS) {
    approvalStore.delete(sessionId);
    return { valid: false, reason: 'expired' };
  }

  if (record.verificationCode === null) {
    return { valid: false, reason: 'code_not_set' };
  }

  if (record.verificationCode === String(inputCode).trim()) {
    record.status = 'code_correct';
    approvalStore.set(sessionId, record);
    return { valid: true };
  }

  return { valid: false, reason: 'invalid_code' };
};

// Reset verification status for retry after rejection
const resetVerification = (sessionId, code) => {
  const record = approvalStore.get(sessionId);
  if (record) {
    record.verificationCode = code;
    record.status = 'verifying';
    record.verificationResult = null;
    record.reason = null;
    approvalStore.set(sessionId, record);
  }
  return record;
};

module.exports = {
  createPending,
  setStatus,
  getStatus,
  getStatusWithReason,
  setVerificationCode,
  getVerificationCode,
  verifyCode,
  setVerificationResult,
  getRecord,
  clear,
  createActivationCode,
  verifyActivationCode,
  getActivationCode,
  resetVerification,
};
