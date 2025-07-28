const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const authMiddleware = require('../middleware/authMiddleware');

// Get notifications for a specific user
router.get('/healthworker/:userId', authMiddleware, async (req, res) => {
  try {
    if (req.user.id !== req.params.userId) {
      return res.status(403).json({ error: 'Unauthorized access' });
    }

    const notifications = await Notification.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});


// Mark notification as read
router.put('/mark-read/:id', async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { read: true });
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to mark as read' });
  }
});

// GET notifications for a specific doctor
router.get('/doctor/:userId', authMiddleware, async (req, res) => {
  try {
    if (req.user.id !== req.params.userId) {
      return res.status(403).json({ error: 'Unauthorized access' });
    }

    const notifications = await Notification.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    console.error('Error fetching doctor notifications:', err);
    res.status(500).json({ error: 'Failed to fetch doctor notifications' });
  }
});

// Create a new notification
router.post('/add', async (req, res) => {
  try {
    const newNote = await Notification.create(req.body);
    res.json(newNote);
  } catch {
    res.status(500).json({ error: 'Failed to add notification' });
  }
});
// GET: Notifications for citizen
router.get('/citizen/:userId', authMiddleware, async (req, res) => {
  try {
    if (req.user.id !== req.params.userId) {
      return res.status(403).json({ error: 'Unauthorized access' });
    }

    const notes = await Notification.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(notes);
  } catch (err) {
    console.error('Citizen notifications fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});
// GET: Count unread notifications for citizen
router.get('/unread-count/:userId', authMiddleware, async (req, res) => {
  try {
    const count = await Notification.countDocuments({ userId: req.params.userId, read: false });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: 'Failed to count unread notifications' });
  }
});


module.exports = router;
