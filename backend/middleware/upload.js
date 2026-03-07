'use strict';

const multer = require('multer');
const path = require('path');
const fs = require('fs');

const getUploadDir = () => path.join(__dirname, '../uploads');

const ensureUploadDir = () => {
  const uploadDir = getUploadDir();
  if (!fs.existsSync(uploadDir)) {
    try {
      fs.mkdirSync(uploadDir, { recursive: true });
      console.log('Uploads directory created:', uploadDir);
    } catch (err) {
      console.error('Failed to create uploads directory:', err);
      throw err;
    }
  }
  return uploadDir;
};

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    try {
      const uploadDir = ensureUploadDir();
      cb(null, uploadDir);
    } catch (err) {
      cb(err);
    }
  },
  filename: (_req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const fileFilter = (_req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error('نوع الملف غير مدعوم، يُقبل فقط JPEG وPNG وWebP'));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

module.exports = upload;
module.exports.ensureUploadDir = ensureUploadDir;
