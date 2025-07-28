const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Referral = require('../models/Referral');
const Prescription = require('../models/Prescription');
const authMiddleware = require('../middleware/authMiddleware');

// Get all verified doctors (excluding sensitive fields)
router.get('/verified', async (req, res) => {
  try {
    const doctors = await User.find({ userType: 'doctor', isVerified: true })
      .select('-password -idProof -degreeCertificate');
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch doctors' });
  }
});

router.get('/dashboard/:doctorId', authMiddleware, async (req, res) => {
  try {
    const doctorId = req.params.doctorId;

    const referrals = await Referral.find({ doctorId });
    const prescriptions = await Prescription.find({ doctorId });

    const monthlyStats = {};
    const dailyConsults = {};
    const referralTypes = { Online: 0, Offline: 0 };
    const prescriptionByCitizen = {};
    const referralSource = { Direct: 0, HealthWorker: 0 };
    const testFrequency = {};

    referrals.forEach(ref => {
      const month = new Date(ref.createdAt).toLocaleString('default', { month: 'short' });
      const date = new Date(ref.createdAt).toLocaleDateString();
      const refType = ref.type || 'Unknown';

      // Monthly count
      monthlyStats[month] = monthlyStats[month] || { referrals: 0, prescriptions: 0 };
      monthlyStats[month].referrals++;

      // Daily consults
      if (ref.consultationConfirmed) {
        dailyConsults[date] = (dailyConsults[date] || 0) + 1;
      }

      // Referral type
      referralTypes[refType] = (referralTypes[refType] || 0) + 1;

      // Referral source
      if (ref.referredBy === 'self') referralSource.Direct++;
      else referralSource.HealthWorker++;
    });

    prescriptions.forEach(pres => {
      const month = new Date(pres.createdAt).toLocaleString('default', { month: 'short' });
      monthlyStats[month] = monthlyStats[month] || { referrals: 0, prescriptions: 0 };
      monthlyStats[month].prescriptions++;

      // Prescription per citizen
      prescriptionByCitizen[pres.citizenName] = (prescriptionByCitizen[pres.citizenName] || 0) + 1;

      // Test frequency
      (pres.prescribedTests || []).forEach(test => {
        testFrequency[test] = (testFrequency[test] || 0) + 1;
      });
    });

    const chartData = Object.keys(monthlyStats).map(month => ({
      month,
      ...monthlyStats[month]
    }));

    // ✅ Now using consistent 'count' key instead of 'value'
    const pieData = [
      { name: 'Consulted', count: referrals.filter(r => r.consultationConfirmed).length },
      { name: 'Pending', count: referrals.filter(r => !r.consultationConfirmed).length }
    ];

    const lineChartData = Object.keys(dailyConsults).map(date => ({
      date,
      count: dailyConsults[date]
    }));

    const referralTypeData = Object.keys(referralTypes).map(type => ({
      name: type,
      count: referralTypes[type]
    }));

    const citizenPrescriptionData = Object.keys(prescriptionByCitizen).map(name => ({
      name,
      count: prescriptionByCitizen[name]
    }));

    const referralSourceData = Object.keys(referralSource).map(src => ({
      name: src,
      count: referralSource[src]
    }));

    const testFrequencyData = Object.keys(testFrequency).map(test => ({
      test,
      count: testFrequency[test]
    }));

    res.json({
      totalReferrals: referrals.length,
      totalPrescriptions: prescriptions.length,
      pendingConsults: pieData[1].count,
      chartData,
      pieData,
      lineChartData,
      referralTypeData,
      citizenPrescriptionData,
      referralSourceData,
      testFrequencyData
    });
  } catch (err) {
    console.error('Error in /dashboard route:', err.message, err.stack);
    res.status(500).json({ error: 'Failed to fetch doctor dashboard data' });
  }
});

module.exports = router;