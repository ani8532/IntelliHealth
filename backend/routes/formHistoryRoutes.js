const express = require('express');
const router = express.Router();
const { getFormHistory } = require('../controllers/formHistoryController');
const requireAuth = require('../middleware/authMiddleware');


router.get('/', requireAuth, getFormHistory);

module.exports = router;
