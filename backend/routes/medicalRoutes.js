const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  predictMedical,
  getMedicalEntriesByUser,
  getAllMedicalEntries
} = require('../controllers/medicalController');

router.post('/predict', authMiddleware, predictMedical);
router.get('/', authMiddleware, getMedicalEntriesByUser);
router.get('/all', authMiddleware, getAllMedicalEntries);

module.exports = router;