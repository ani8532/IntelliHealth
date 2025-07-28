const express = require('express');
const multer = require('multer');
const path = require('path');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');
const requireAdmin = require('../middleware/auth');
const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/docs/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error('Error fetching user profile:', err.message, err.stack);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});


// PUT /api/user/doctor/update/:id
router.put('/doctor/update/:id', authMiddleware, async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Doctor profile update failed' });
  }
});

router.put('/update/:id', async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Update failed' });
  }
});

router.post('/upload/:id', upload.fields([
  { name: 'degreeCertificate', maxCount: 1 },
  { name: 'idProof', maxCount: 1 }
]), async (req, res) => {
  try {
    const update = {};
    if (req.files.degreeCertificate) {
      update.degreeCertificate = `/uploads/docs/${req.files.degreeCertificate[0].filename}`;
    }
    if (req.files.idProof) {
      update.idProof = `/uploads/docs/${req.files.idProof[0].filename}`;
    }
    const user = await User.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Upload failed' });
  }
});



module.exports = router;