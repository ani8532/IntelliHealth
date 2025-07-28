const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const Message = require('../models/Message');

// GET: All messages for logged-in user
router.get('/inbox', authMiddleware, async (req, res) => {
  try {
    const messages = await Message.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// PUT: Mark message as seen
router.put('/seen/:id', authMiddleware, async (req, res) => {
  try {
    const updated = await Message.findByIdAndUpdate(req.params.id, { seen: true }, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update message status' });
  }
});
router.get('/unread-count', authMiddleware, async (req, res) => {
  try {
    const count = await Message.countDocuments({ userId: req.user.id, seen: false });
    res.json({ count });
  } catch (err) {
    console.error('Error fetching unread count:', err);
    res.status(500).json({ error: 'Failed to get unread count' });
  }
});

module.exports = router;
