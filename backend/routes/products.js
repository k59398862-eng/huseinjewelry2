'use strict';

const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');

// GET /api/products
router.get('/', async (_req, res) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
    });
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'خطأ في الخادم' });
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: parseInt(req.params.id) },
    });
    if (!product) return res.status(404).json({ error: 'المنتج غير موجود' });
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'خطأ في الخادم' });
  }
});

module.exports = router;
