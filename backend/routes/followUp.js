const express = require('express');
const router = express.Router();
const followUpController = require('../controllers/followUpController');
const authMiddleware = require('../middleware/authMiddleware');





router.post('/add', authMiddleware, followUpController.createFollowUp);
router.get('/by/:id', authMiddleware, followUpController.getFollowUpsByHealthWorker);
router.get('/chart', authMiddleware, followUpController.getFollowUpStats);
router.put('/:id', authMiddleware, followUpController.updateFollowUp);
router.get('/pending/mine', authMiddleware, followUpController.getMyPendingFollowUps);
router.get('/pending', authMiddleware, followUpController.getPendingFollowUps);
router.get('/my-followups', authMiddleware, followUpController.getFollowUpsForCurrentHealthWorker);

module.exports = router;