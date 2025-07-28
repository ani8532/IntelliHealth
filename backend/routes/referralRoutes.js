const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

const Referral = require('../models/Referral');
const FollowUp = require('../models/FollowUp');
const Notification = require('../models/Notification');
const Message = require('../models/Message');
const authMiddleware = require('../middleware/authMiddleware');

// Helper: Convert "10:00 AM" to "10:00", "2:00 PM" to "14:00"
function convertTo24Hour(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') return '';
  const [time, modifier] = timeStr.split(' ');
  if (!time || !modifier) return timeStr; // already 24hr format?

  let [hours, minutes] = time.split(':').map(Number);
  if (modifier === 'PM' && hours < 12) hours += 12;
  if (modifier === 'AM' && hours === 12) hours = 0;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

// POST: Make a referral
router.post('/refer', authMiddleware, async (req, res) => {
  try {
    const {
      citizenName,
      citizenId,
      doctorId,
      doctorName,
      referredBy,
      type,
      report,
      appointmentDate,
      appointmentTime,
      userType
    } = req.body;

    const referral = await Referral.create({
      citizenName,
      citizenId,
      doctorId,
      doctorName,
      referredBy,
      type,
      report,
      appointmentDate,
      appointmentTime,
      userType
    });

    await FollowUp.create({
      citizenName,
      citizenId,
      healthWorkerName: referredBy,
      submittedBy: req.user._id,
      status: 'referred',
      remarks: `Referred to Dr. ${doctorName} (${type})`,
      date: new Date()
    });

    await Notification.create({
      userId: citizenId,
      title: 'You have been referred',
      message: `You have been referred to Dr. ${doctorName} by ${referredBy}. Check your dashboard for details.`
    });

    await Notification.create({
      userId: doctorId,
      title: 'New Referral',
      message: `You have a new referral for ${citizenName} (${type}) from ${referredBy}.`
    });

    res.json(referral);
  } catch (err) {
    console.error('Referral creation failed:', err);
    res.status(500).json({ error: 'Failed to create referral' });
  }
});

// PUT: Confirm consultation
router.put('/confirm/:referralId', authMiddleware, async (req, res) => {
  try {
    const { referralId } = req.params;
    const referral = await Referral.findById(referralId);
    if (!referral) return res.status(404).json({ error: 'Referral not found' });

    let videoLink = '';
    let videoLinkExpiresAt = null;

    if (referral.type === 'Online') {
      // Autofill appointment date/time if missing
      if (!referral.appointmentDate || !referral.appointmentTime) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        referral.appointmentDate = tomorrow.toISOString().split('T')[0];
        referral.appointmentTime = '09:00 AM';
      }

      // Convert time if needed
      const time24 = convertTo24Hour(referral.appointmentTime);
      const startTime = new Date(`${referral.appointmentDate}T${time24}`);

      if (isNaN(startTime)) {
        return res.status(400).json({ error: 'Invalid appointment date/time' });
      }

      const token = uuidv4();
      videoLink = `https://telehealth.example.com/room/${token}`;
      videoLinkExpiresAt = new Date(startTime.getTime() + 30 * 60 * 1000);
    }

    referral.consulted = true;
    referral.consultationConfirmed = true;
    referral.videoLink = videoLink;
    referral.videoLinkExpiresAt = videoLinkExpiresAt;
    await referral.save();

    const messageText = referral.type === 'Online'
      ? `Your consultation with Dr. ${referral.doctorName} is scheduled for ${referral.appointmentDate} at ${referral.appointmentTime}. Join via this link: ${videoLink}`
      : `Your offline consultation with Dr. ${referral.doctorName} is confirmed for ${referral.appointmentDate} at ${referral.appointmentTime}.`;

    await Notification.create({
      userId: referral.citizenId,
      title: 'Consultation Confirmed',
      message: messageText
    });

    await Message.create({
      userId: referral.citizenId,
      title: referral.type === 'Online' ? 'Online Consultation Link' : 'Offline Consultation Confirmed',
      body: messageText
    });

    res.json({ message: 'Consultation confirmed', referral });
  } catch (err) {
    console.error('Failed to confirm consultation:', err);
    res.status(500).json({ error: 'Failed to confirm consultation' });
  }
});

// POST: Resend video link
router.post('/resend-link/:referralId', authMiddleware, async (req, res) => {
  try {
    const referral = await Referral.findById(req.params.referralId);
    if (!referral || referral.type !== 'Online') {
      return res.status(400).json({ error: 'Invalid referral or not an online consultation' });
    }

    if (!referral.videoLink || !referral.videoLinkExpiresAt) {
      return res.status(400).json({ error: 'Video link not generated yet' });
    }

    const text = `Reminder: Join your consultation with Dr. ${referral.doctorName} using this link: ${referral.videoLink}. The link is valid until ${new Date(referral.videoLinkExpiresAt).toLocaleTimeString()}.`;

    await Notification.create({
      userId: referral.citizenId,
      title: 'Video Link Resent',
      message: text
    });

    await Message.create({
      userId: referral.citizenId,
      title: 'Resent Consultation Link',
      body: text
    });

    res.json({ message: 'Video link resent successfully' });
  } catch (err) {
    console.error('Failed to resend link:', err);
    res.status(500).json({ error: 'Failed to resend link' });
  }
});

// Other routes (unchanged)
router.get('/my-referrals', authMiddleware, async (req, res) => {
  try {
    const referrals = await Referral.find({ referredBy: req.user.fullName });
    res.json(referrals);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch referrals' });
  }
});

router.get('/doctor/:doctorId', authMiddleware, async (req, res) => {
  try {
    const referrals = await Referral.find({ doctorId: req.params.doctorId }).sort({ createdAt: -1 });
    res.json(referrals);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch referrals' });
  }
});

router.put('/consult/:referralId', authMiddleware, async (req, res) => {
  try {
    const updated = await Referral.findByIdAndUpdate(
      req.params.referralId,
      { consulted: true },
      { new: true }
    );

    await Notification.create({
      userId: updated.doctorId,
      title: 'Consultation Completed',
      message: `The consultation for ${updated.citizenName} has been marked as completed.`
    });

    res.json(updated);
  } catch (err) {
    console.error('Failed to update consultation status:', err);
    res.status(500).json({ error: 'Failed to update referral status' });
  }
});

router.get('/citizens', authMiddleware, async (req, res) => {
  try {
    const { doctorId, type } = req.query;

    if (!doctorId || !type) {
      return res.status(400).json({ error: 'Missing doctorId or type' });
    }

    let filter = { doctorId };
    if (type === 'referral') filter.referredBy = { $ne: 'self' };
    else if (type === 'direct') filter.referredBy = 'self';
    else return res.status(400).json({ error: 'Invalid type' });

    const referrals = await Referral.find(filter).sort({ createdAt: -1 });

    const seen = new Set();
    const uniqueCitizens = referrals
      .filter(r => {
        if (seen.has(r.citizenId.toString())) return false;
        seen.add(r.citizenId.toString());
        return true;
      })
      .map(r => ({
        _id: r.citizenId,
        name: r.citizenName
      }));

    res.json(uniqueCitizens);
  } catch (err) {
    console.error('Error fetching citizens:', err);
    res.status(500).json({ error: 'Failed to fetch citizens' });
  }
});

module.exports = router;
