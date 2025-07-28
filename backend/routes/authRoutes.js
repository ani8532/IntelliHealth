const express = require('express');
const multer = require('multer');
const path = require('path');
const { signup, login } = require('../controllers/authController');

const router = express.Router();

// Multer config with type & size limits
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/docs/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
  if (!allowedTypes.includes(file.mimetype)) {
    cb(new Error('Only PDF, JPG, or PNG files allowed.'));
  } else {
    cb(null, true);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter
});

router.post('/signup', upload.fields([
  { name: 'degreeCertificate', maxCount: 1 },
  { name: 'idProof', maxCount: 1 }
]), signup);

router.post('/login', login);

module.exports = router;
