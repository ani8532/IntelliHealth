
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const LifestyleEntry = require('../models/LifestyleEntry');
const MedicalEntry = require('../models/medicalformmodel');
const Referral = require('../models/Referral');
const FollowUp = require('../models/FollowUp');
const User = require('../models/User');

// ================= Dashboard Overview =================
router.get('/dashboard', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const healthWorker = await User.findById(userId);

    if (!healthWorker || healthWorker.userType !== 'health_worker') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const submittedBy = healthWorker.fullName || healthWorker.email;

    const [lifestyleForms, medicalForms, followUps] = await Promise.all([
      LifestyleEntry.find({ submittedBy }),
      MedicalEntry.find({ submittedBy }),
      FollowUp.find({ healthWorkerName: submittedBy })
    ]);

    const pendingFollowUps = followUps.filter(f => f.status !== 'recovered');

    const analytics = {
      totalForms: lifestyleForms.length + medicalForms.length,
      followUpsPending: pendingFollowUps.length,
      totalCitizens: new Set(lifestyleForms.map(f => f.name)).size
    };

    const followUpChart = followUps.reduce((acc, f) => {
      acc[f.status] = (acc[f.status] || 0) + 1;
      return acc;
    }, {});

    const cityCounts = {};
    lifestyleForms.forEach(f => {
      if (f.city) {
        cityCounts[f.city] = (cityCounts[f.city] || 0) + 1;
      }
    });

    res.json({ analytics, lifestyleForms, medicalForms, followUpChart, cityCounts });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load dashboard', details: err.message });
  }
});

// ================= PIE CHART - Form Distribution =================
router.get('/analytics/form-distribution', authMiddleware, async (req, res) => {
  try {
    const submittedBy = req.user.fullName;
    const [lifestyle, medical] = await Promise.all([
      LifestyleEntry.countDocuments({ submittedBy }),
      MedicalEntry.countDocuments({ submittedBy })
    ]);
    res.json({ Lifestyle: lifestyle, Medical: medical });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch form distribution' });
  }
});

// ================= LINE CHART - Forms Over Time =================
router.get('/analytics/forms-over-time', authMiddleware, async (req, res) => {
  try {
    const submittedBy = req.user.fullName;
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 5);

    const labels = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(); d.setMonth(d.getMonth() - (5 - i));
      return d.toLocaleString('default', { month: 'short' });
    });

    const pipeline = [
      { $match: { submittedBy, createdAt: { $gte: monthAgo } } },
      { $group: { _id: { $month: '$createdAt' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ];

    const [lifestyle, medical] = await Promise.all([
      LifestyleEntry.aggregate(pipeline),
      MedicalEntry.aggregate(pipeline)
    ]);

    const monthlyData = labels.map((_, idx) => {
      const month = (new Date()).getMonth() - (5 - idx) + 1;
      const l = lifestyle.find(e => e._id === month)?.count || 0;
      const m = medical.find(e => e._id === month)?.count || 0;
      return l + m;
    });

    res.json({ labels, data: monthlyData });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch forms over time' });
  }
});

// ================= DOUGHNUT CHART - Follow-Up Status =================
router.get('/analytics/followup-status', authMiddleware, async (req, res) => {
  try {
    const submittedBy = req.user.fullName;
    const followUps = await FollowUp.find({ healthWorkerName: submittedBy });

    const validStatuses = ['pending', 'referred', 'recovered'];
    const counts = followUps.reduce((acc, f) => {
      const status = f.status?.toLowerCase();
      if (validStatuses.includes(status)) {
        acc[status] = (acc[status] || 0) + 1;
      }
      return acc;
    }, {});

    res.json(counts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch follow-up status' });
  }
});

// ================= BAR CHART - Referrals by Doctor =================
router.get('/analytics/referrals-by-doctor', authMiddleware, async (req, res) => {
  try {
    const referredBy = req.user.fullName;
    const data = await Referral.aggregate([
      { $match: { referredBy } },
      { $group: { _id: '$doctorName', count: { $sum: 1 } } }
    ]);

    const labels = data.map(d => d._id);
    const counts = data.map(d => d.count);

    res.json({ labels, data: counts });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch referrals by doctor' });
  }
});

// ================= STACKED BAR CHART - Monthly Summary =================
router.get('/analytics/monthly-stacked', authMiddleware, async (req, res) => {
  try {
    const submittedBy = req.user.fullName;
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 5);

    const labels = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(); d.setMonth(d.getMonth() - (5 - i));
      return d.toLocaleString('default', { month: 'short' });
    });

    const getMonthlyCounts = async (model, matchField = 'submittedBy', value = submittedBy) => {
      return await model.aggregate([
        { $match: { [matchField]: value, createdAt: { $gte: monthAgo } } },
        { $group: { _id: { $month: '$createdAt' }, count: { $sum: 1 } } }
      ]);
    };

    const [lifestyle, medical, followups] = await Promise.all([
      getMonthlyCounts(LifestyleEntry),
      getMonthlyCounts(MedicalEntry),
      getMonthlyCounts(FollowUp, 'healthWorkerName', submittedBy)
    ]);

    const getCount = (arr, month) => arr.find(e => e._id === month)?.count || 0;

    const stackedData = labels.map((_, i) => {
      const month = (new Date()).getMonth() - (5 - i) + 1;
      return [
        getCount(lifestyle, month),
        getCount(medical, month),
        getCount(followups, month)
      ];
    });

    res.json({ labels, data: stackedData });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stacked chart data' });
  }
});

module.exports = router;
