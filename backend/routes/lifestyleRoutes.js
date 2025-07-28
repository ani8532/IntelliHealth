const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  predictDisease,
  getLifestyleEntriesByUser,
  getAllLifestyleEntries
} = require('../controllers/lifestyleController');

// ✅ Add prediction route
router.post('/predict', authMiddleware, predictDisease);

// ✅ Existing routes
router.get('/', authMiddleware, getLifestyleEntriesByUser);
router.get('/all', authMiddleware, getAllLifestyleEntries);

module.exports = router;
