const express = require('express');
const { requireAdmin } = require('../middleware/auth');
const User = require('../models/User');
const router = express.Router();
const Notification = require('../models/Notification');
const LifestyleEntry = require('../models/LifestyleEntry');
const MedicalPrediction = require('../models/medicalformmodel');
const { getRiskTrendsOverTime,getCombinedRiskData,getRiskCorrelations,getRiskByDiet,getSmokingAlcoholRisk ,getLabBasedRisk3D,getBloodPressureDistribution, 
  getAllFollowUpStats} = require('../controllers/adminController');



router.get('/followup-chart',requireAdmin ,getAllFollowUpStats);

// Get pending users
router.get('/pending-users', requireAdmin, async (req, res) => {
  try {
    const users = await User.find({ isVerified: false });
    res.json(users);
  } catch (err) {
    console.error('Failed to fetch pending users:', err);
    res.status(500).json({ error: 'Server error while fetching users' });
  }
});

// Approve user
router.patch('/approve/:id', requireAdmin, async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { isVerified: true },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // ✅ Send notification
    await Notification.create({
      userId: updatedUser._id,
      title: 'Account Approved',
      message: `Your ${updatedUser.userType} account has been approved by the Admin.`,
      read: false
    });

    res.json({ message: 'User approved and notification sent' });
  } catch (error) {
    console.error('Approval error:', error);
    res.status(500).json({ error: 'Failed to approve user' });
  }
});
// GET total form stats (lifestyle + medical)
router.get('/form-stats', requireAdmin, async (req, res) => {
  try {
    const lifestyleCount = await LifestyleEntry.countDocuments();
    const medicalCount = await MedicalPrediction.countDocuments();
    res.json({
      lifestyleCount,
      medicalCount,
      totalCount: lifestyleCount + medicalCount
    });
  } catch (err) {
    console.error('Failed to fetch form stats:', err);
    res.status(500).json({ error: 'Failed to fetch form stats' });
  }
});

// GET total user count (for Admin Dashboard stat card)
router.get('/user-stats', requireAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const citizens = await User.countDocuments({ userType: 'citizen' });
    const healthWorkers = await User.countDocuments({ userType: 'health_worker' });
    const doctors = await User.countDocuments({ userType: 'doctor' });
    const verifiedUsers = await User.countDocuments({ isVerified: true });
    const pendingUsers = await User.countDocuments({ isVerified: false });

    res.json({
      totalUsers,
      verifiedUsers,
      pendingUsers,
      byRole: {
        citizens,
        healthWorkers,
        doctors
      }
    });
  } catch (err) {
    console.error('Failed to fetch user stats:', err);
    res.status(500).json({ error: 'Failed to fetch user stats' });
  }
});


// GET form breakdown by role (for stacked bar chart)
router.get('/form-breakdown', requireAdmin, async (req, res) => {
  try {
    const lifestyle = await LifestyleEntry.aggregate([
      { $group: { _id: '$submittedByRole', count: { $sum: 1 } } }
    ]);

    const medical = await MedicalPrediction.aggregate([
      { $group: { _id: '$submittedByRole', count: { $sum: 1 } } }
    ]);

    const format = (arr) => {
      const obj = { citizen: 0, health_worker: 0 };
      arr.forEach(i => obj[i._id] = i.count);
      return obj;
    };

    res.json({
      lifestyle: format(lifestyle),
      medical: format(medical)
    });
  } catch (err) {
    console.error('Form breakdown error:', err);
    res.status(500).json({ error: 'Failed to get form breakdown' });
  }
});
router.get('/combined-risk-data', getCombinedRiskData);
router.get('/risk-correlations', requireAdmin, getRiskCorrelations);
router.get('/risk-by-diet', requireAdmin, getRiskByDiet);
router.get('/risk-by-smoking-alcohol',requireAdmin, getSmokingAlcoholRisk);
router.get('/risk-3d-lab', requireAdmin, getLabBasedRisk3D);
router.get('/blood-pressure-distribution', getBloodPressureDistribution);
router.get('/risk-trends', requireAdmin, getRiskTrendsOverTime);
// PATCH reject user
router.patch('/reject/:id', requireAdmin, async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: 'User rejected and deleted' });
});
module.exports = router;