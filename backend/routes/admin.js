'use strict';

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');
const { verifyAdminToken, JWT_SECRET } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { ensureUploadDir } = require('../middleware/upload');
const path = require('path');
const fs = require('fs');

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

const ensureAdminExists = async () => {
  try {
    const existing = await prisma.admin.findUnique({ where: { username: ADMIN_USERNAME } });
    if (!existing) {
      const hashed = await bcrypt.hash(ADMIN_PASSWORD, 12);
      await prisma.admin.create({ data: { username: ADMIN_USERNAME, password: hashed } });
    }
  } catch (err) {
    console.error('ensureAdminExists error:', err.message);
  }
};
ensureAdminExists();

// POST /api/admin/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'يرجى إدخال اسم المستخدم وكلمة المرور' });
  }

  try {
    const admin = await prisma.admin.findUnique({ where: { username } });
    if (!admin) return res.status(401).json({ error: 'بيانات خاطئة' });

    const valid = await bcrypt.compare(password, admin.password);
    if (!valid) return res.status(401).json({ error: 'بيانات خاطئة' });

    const token = jwt.sign({ id: admin.id, username: admin.username, role: 'admin' }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, admin: { id: admin.id, username: admin.username } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'خطأ في الخادم' });
  }
});

// GET /api/admin/stats
router.get('/stats', verifyAdminToken, async (req, res) => {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totalOrders, todayOrders, monthOrders, totalRevenue, pendingOrders, totalProducts, totalUsers] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.order.count({ where: { createdAt: { gte: monthStart } } }),
      prisma.order.aggregate({ where: { status: { not: 'cancelled' } }, _sum: { netTransfer: true } }),
      prisma.order.count({ where: { status: 'pending' } }),
      prisma.product.count(),
      prisma.user.count(),
    ]);

    res.json({
      totalOrders,
      todayOrders,
      monthOrders,
      totalRevenue: totalRevenue._sum.netTransfer || 0,
      pendingOrders,
      totalProducts,
      totalUsers,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'خطأ في الخادم' });
  }
});

// GET /api/admin/orders
router.get('/orders', verifyAdminToken, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const where = status ? { status } : {};
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: { user: true, product: true },
        orderBy: { createdAt: 'desc' },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
      }),
      prisma.order.count({ where }),
    ]);
    res.json({ orders, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'خطأ في الخادم' });
  }
});

// PATCH /api/admin/orders/:id/status
router.patch('/orders/:id/status', verifyAdminToken, async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['pending', 'approved', 'rejected', 'completed', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'حالة غير صالحة' });
  }

  try {
    const order = await prisma.order.update({
      where: { id: parseInt(req.params.id) },
      data: { status },
    });
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'خطأ في الخادم' });
  }
});

// POST /api/admin/products
router.post('/products', verifyAdminToken, (req, res, next) => {
  try {
    ensureUploadDir();
  } catch (err) {
    console.error('Upload directory error:', err);
    return res.status(500).json({ error: 'فشل إعداد مجلد التخزين' });
  }
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'images', maxCount: 5 },
  ])(req, res, (err) => {
    if (err) {
      console.error('Multer error:', err.message);
      return res.status(400).json({ error: 'فشل رفع الملف: ' + err.message });
    }
    next();
  });
}, async (req, res) => {
  const { name, price, weight, karat, description, order: sortOrder, imageUrl: bodyImageUrl } = req.body;

  if (!name || !price || !weight || !karat) {
    return res.status(400).json({ error: 'يرجى ملء جميع الحقول المطلوبة' });
  }

  try {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    let imageUrl = null;
    let additionalImages = [];

    // Ensure req.files exists before accessing it
    if (req.files && req.files['image'] && req.files['image'].length > 0) {
      imageUrl = `${baseUrl}/uploads/${req.files['image'][0].filename}`;
    } else if (bodyImageUrl !== undefined) {
      imageUrl = bodyImageUrl.trim() || null;
    }
    if (req.files && req.files['images'] && req.files['images'].length > 0) {
      additionalImages = req.files['images'].map(f => `${baseUrl}/uploads/${f.filename}`);
    }

    // Ensure additionalImages is an array before checking length
    const imagesArray = Array.isArray(additionalImages) ? additionalImages : [];

    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        price: parseFloat(price),
        weight: parseInt(weight),
        karat: parseInt(karat),
        description: description ? description.trim() : null,
        imageUrl,
        images: imagesArray.length ? JSON.stringify(imagesArray) : null,
        order: sortOrder ? parseInt(sortOrder) : 0,
        isDefault: false,
      },
    });

    res.status(201).json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'خطأ في الخادم' });
  }
});

// Helper to safely parse JSON
const safeJsonParse = (str, defaultVal = []) => {
  try {
    return JSON.parse(str);
  } catch {
    return defaultVal;
  }
};

// Conditional multer middleware - only runs for multipart requests
const conditionalUpload = (fields) => (req, res, next) => {
  if (req.is('multipart/form-data')) {
    try {
      ensureUploadDir();
    } catch (err) {
      console.error('Upload directory error:', err);
      return res.status(500).json({ error: 'فشل إعداد مجلد التخزين' });
    }
    upload.fields(fields)(req, res, (err) => {
      if (err) {
        console.error('Multer error:', err.message);
        return res.status(400).json({ error: 'فشل رفع الملف: ' + err.message });
      }
      next();
    });
  } else {
    next();
  }
};

// PUT /api/admin/products/:id
router.put('/products/:id', verifyAdminToken, conditionalUpload([
  { name: 'image', maxCount: 1 },
  { name: 'images', maxCount: 5 },
]), async (req, res) => {
  const { name, price, weight, karat, description, order: sortOrder, imageUrl: bodyImageUrl } = req.body;

  try {
    const existing = await prisma.product.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!existing) return res.status(404).json({ error: 'المنتج غير موجود' });

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    // Precedence: uploaded file > provided URL (including empty string to clear) > keep existing
    let imageUrl = existing.imageUrl;
    let additionalImages = safeJsonParse(existing.images, []);

    // Ensure req.files exists before accessing it
    if (req.files && req.files['image'] && req.files['image'].length > 0) {
      imageUrl = `${baseUrl}/uploads/${req.files['image'][0].filename}`;
    } else if (bodyImageUrl !== undefined && bodyImageUrl.trim() !== '') {
      imageUrl = bodyImageUrl.trim();
    }
    if (req.files && req.files['images'] && req.files['images'].length > 0) {
      additionalImages = req.files['images'].map(f => `${baseUrl}/uploads/${f.filename}`);
    }

    // Ensure additionalImages is an array before checking length
    const imagesArray = Array.isArray(additionalImages) ? additionalImages : [];

    const updated = await prisma.product.update({
      where: { id: parseInt(req.params.id) },
      data: {
        ...(name && { name: name.trim() }),
        ...(price && { price: parseFloat(price) }),
        ...(weight && { weight: parseInt(weight) }),
        ...(karat && { karat: parseInt(karat) }),
        description: description ? description.trim() : existing.description,
        imageUrl,
        images: imagesArray.length ? JSON.stringify(imagesArray) : null,
        ...(sortOrder !== undefined && { order: parseInt(sortOrder) }),
      },
    });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'خطأ في الخادم' });
  }
});

// DELETE /api/admin/products/:id
router.delete('/products/:id', verifyAdminToken, async (req, res) => {
  try {
    const product = await prisma.product.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!product) return res.status(404).json({ error: 'المنتج غير موجود' });
    if (product.isDefault) return res.status(403).json({ error: 'لا يمكن حذف المنتجات الأساسية' });

    await prisma.product.delete({ where: { id: parseInt(req.params.id) } });

    if (product.imageUrl) {
      const filename = path.basename(product.imageUrl);
      const filepath = path.join(__dirname, '../uploads', filename);
      if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'خطأ في الخادم' });
  }
});

// PATCH /api/admin/products/:id/reorder
router.patch('/products/:id/reorder', verifyAdminToken, async (req, res) => {
  const { order } = req.body;
  if (order === undefined) return res.status(400).json({ error: 'الترتيب مطلوب' });

  try {
    const product = await prisma.product.update({
      where: { id: parseInt(req.params.id) },
      data: { order: parseInt(order) },
    });
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'خطأ في الخادم' });
  }
});

// GET /api/admin/users
router.get('/users', verifyAdminToken, async (req, res) => {
  try {
    const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'خطأ في الخادم' });
  }
});

module.exports = router;
