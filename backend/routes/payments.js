'use strict';

const express = require('express');
const router = express.Router();
const axios = require('axios');
const prisma = require('../lib/prisma');
const telegramService = require('../services/telegram');

const TAMARA_API_URL = process.env.TAMARA_API_URL || 'https://api-sandbox.tamara.co';
const TAMARA_API_KEY = process.env.TAMARA_API_KEY || '';

const tamaraClient = axios.create({
  baseURL: TAMARA_API_URL,
  headers: {
    Authorization: `Bearer ${TAMARA_API_KEY}`,
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// ───────── TAMARA ─────────

// POST /api/payments/tamara/checkout
router.post('/tamara/checkout', async (req, res) => {
  const { orderId } = req.body;
  if (!orderId) return res.status(400).json({ error: 'orderId مطلوب' });

  try {
    const order = await prisma.order.findUnique({
      where: { id: parseInt(orderId) },
      include: { user: true, product: true },
    });
    if (!order) return res.status(404).json({ error: 'الطلب غير موجود' });

    const payload = {
      order_reference_id: `ORDER-${order.id}`,
      order_number: `ORDER-${order.id}`,
      total_amount: { amount: String(order.amount), currency: 'SAR' },
      description: order.product.name,
      country_code: 'SA',
      payment_type: 'PAY_BY_INSTALMENTS',
      instalments: order.installments === 1 ? null : order.installments,
      locale: 'ar_SA',
      items: [
        {
          reference_id: String(order.product.id),
          type: 'Physical',
          name: order.product.name,
          sku: String(order.product.id),
          quantity: 1,
          unit_price: { amount: String(order.amount), currency: 'SAR' },
          total_amount: { amount: String(order.amount), currency: 'SAR' },
        },
      ],
      consumer: {
        first_name: order.user.name,
        last_name: '',
        phone_number: order.user.phone || '',
        email: order.user.email,
      },
      billing_address: {
        first_name: order.user.name,
        last_name: '',
        line1: 'Saudi Arabia',
        city: 'Riyadh',
        country_code: 'SA',
      },
      shipping_address: {
        first_name: order.user.name,
        last_name: '',
        line1: 'Saudi Arabia',
        city: 'Riyadh',
        country_code: 'SA',
      },
      merchant_url: {
        success: `${process.env.FRONTEND_URL}/checkout/success?order=${order.id}`,
        failure: `${process.env.FRONTEND_URL}/checkout/failure?order=${order.id}`,
        cancel: `${process.env.FRONTEND_URL}/checkout/${order.productId}`,
        notification: `${process.env.BACKEND_URL}/api/payments/tamara/callback`,
      },
    };

    const response = await tamaraClient.post('/checkout', payload);
    const tamaraOrderId = response.data.order_id;

    await prisma.order.update({
      where: { id: order.id },
      data: { tamaraOrderId },
    });

    res.json({ checkoutUrl: response.data.checkout_url, tamaraOrderId });
  } catch (err) {
    console.error('[Tamara checkout]', err.response?.data || err.message);
    res.status(500).json({ error: 'خطأ في إنشاء جلسة تمارا', details: err.response?.data });
  }
});

// POST /api/payments/tamara/callback (webhook)
router.post('/tamara/callback', async (req, res) => {
  res.status(200).send('OK');
  const { order_id, order_status, order_reference_id } = req.body;

  try {
    const internalId = parseInt(order_reference_id?.replace('ORDER-', '') || '0');
    if (!internalId) return;

    const statusMap = {
      approved: 'paid',
      declined: 'failed',
      cancelled: 'failed',
    };

    const paymentStatus = statusMap[order_status] || 'pending';

    await prisma.order.update({
      where: { tamaraOrderId: order_id },
      data: { paymentStatus, ...(paymentStatus === 'paid' ? { status: 'approved' } : {}) },
    });

    telegramService.sendPaymentStatusNotification(internalId, paymentStatus).catch(console.error);

    if (paymentStatus === 'paid') {
      await tamaraClient.post(`/orders/${order_id}/authorise`);
    }
  } catch (err) {
    console.error('[Tamara callback]', err.message);
  }
});

// POST /api/payments/tamara/authorize
router.post('/tamara/authorize', async (req, res) => {
  const { tamaraOrderId } = req.body;
  try {
    const response = await tamaraClient.post(`/orders/${tamaraOrderId}/authorise`);
    res.json(response.data);
  } catch (err) {
    console.error('[Tamara authorize]', err.response?.data || err.message);
    res.status(500).json({ error: 'خطأ في التفويض', details: err.response?.data });
  }
});

// POST /api/payments/tamara/capture
router.post('/tamara/capture', async (req, res) => {
  const { tamaraOrderId, amount } = req.body;
  try {
    const response = await tamaraClient.post(`/payments/capture`, {
      order_id: tamaraOrderId,
      total_amount: { amount: String(amount), currency: 'SAR' },
      shipping_info: { shipped_at: new Date().toISOString(), shipping_company: 'direct' },
      items: [],
    });
    res.json(response.data);
  } catch (err) {
    console.error('[Tamara capture]', err.response?.data || err.message);
    res.status(500).json({ error: 'خطأ في الصرف', details: err.response?.data });
  }
});



module.exports = router;
