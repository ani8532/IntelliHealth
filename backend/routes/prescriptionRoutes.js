const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Prescription = require('../models/Prescription');
const Notification = require('../models/Notification'); // ✅ Make sure this is imported
const authMiddleware = require('../middleware/authMiddleware');

// File storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/prescriptions'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// ✅ POST: Write prescription
router.post('/add', authMiddleware, upload.single('prescriptionFile'), async (req, res) => {
  try {
    const {
      citizenId, citizenName,
      doctorId, doctorName,
      notes, prescribedTests
    } = req.body;

    const newPrescription = new Prescription({
      citizenId,
      citizenName,
      doctorId,
      doctorName,
      notes,
      prescribedTests: prescribedTests ? JSON.parse(prescribedTests) : [],
      prescriptionFile: req.file ? `/uploads/prescriptions/${req.file.filename}` : null
    });

    // ✅ Notification to citizen
    await Notification.create({
      userId: citizenId,
      title: 'Prescription Uploaded',
      message: `A new prescription has been uploaded by Dr. ${req.user.fullName}. Please check your dashboard.`
    });

    await newPrescription.save();
    res.json(newPrescription);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to submit prescription' });
  }
});

// ✅ GET: All prescriptions for a specific citizen
router.get('/citizen/:citizenId', authMiddleware, async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ citizenId: req.params.citizenId }).sort({ createdAt: -1 });
    res.json(prescriptions);
  } catch {
    res.status(500).json({ error: 'Failed to fetch prescriptions' });
  }
});

// ✅ NEW: All prescriptions written by a doctor
router.get('/doctor/:doctorId', authMiddleware, async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ doctorId: req.params.doctorId }).sort({ createdAt: -1 });
    res.json(prescriptions);
  } catch (err) {
    console.error('Failed to fetch doctor prescriptions:', err);
    res.status(500).json({ error: 'Failed to fetch doctor prescriptions' });
  }
});

// ✅ GET: Filtered & paginated prescription history by doctor
router.get('/doctor/:doctorId/history', authMiddleware, async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { page = 1, limit = 10, citizenName = '', from, to } = req.query;

    const filters = { doctorId };

    // ✅ Filter by citizen name (case-insensitive)
    if (citizenName) {
      filters.citizenName = { $regex: citizenName, $options: 'i' };
    }

    // ✅ Filter by date range
    if (from || to) {
      filters.createdAt = {};
      if (from) filters.createdAt.$gte = new Date(from);
      if (to) filters.createdAt.$lte = new Date(to);
    }

    const prescriptions = await Prescription.find(filters)
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    const total = await Prescription.countDocuments(filters);

    res.json({
      prescriptions,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    });
  } catch (err) {
    console.error('Failed to fetch filtered history:', err);
    res.status(500).json({ error: 'Failed to fetch prescription history' });
  }
});

module.exports = router;
