const FollowUp = require('../models/FollowUp');
const Notification = require('../models/Notification');

// ✅ Create follow-up (submittedBy set from token)
exports.createFollowUp = async (req, res) => {
  try {
    const followUp = new FollowUp({ 
      ...req.body, 
      submittedBy: req.user._id, 
      healthWorkerName: req.user.fullName // ensure consistency
    });
    await followUp.save();
    res.status(201).json({ message: 'Follow-up added successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add follow-up', details: err.message });
  }
};

// ✅ Get all follow-ups for a health worker (by ID)
exports.getFollowUpsByHealthWorker = async (req, res) => {
  try {
    const { id } = req.params;
    const followUps = await FollowUp.find({ submittedBy: id }).sort({ createdAt: -1 });
    res.json(followUps);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch follow-ups', details: err.message });
  }
};

// ✅ Get follow-up status stats for chart
exports.getFollowUpStats = async (req, res) => {
  try {
    const followUps = await FollowUp.find({ submittedBy: req.user._id });
    const statusCounts = { pending: 0, recovered: 0, referred: 0 };

    followUps.forEach(entry => {
      const status = entry.status?.toLowerCase();
      if (statusCounts[status] !== undefined) {
        statusCounts[status]++;
      } else {
        statusCounts['pending']++;
      }
    });

    res.json(statusCounts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch follow-up data' });
  }
};

// ✅ Get all pending follow-ups (for admin or dashboard)
exports.getPendingFollowUps = async (req, res) => {
  try {
    const pendingFollowUps = await FollowUp.find({ status: 'pending' }).populate('citizenId');
    res.status(200).json(pendingFollowUps);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch pending follow-ups', details: err.message });
  }
};

// ✅ Get pending follow-ups of logged-in health worker
exports.getMyPendingFollowUps = async (req, res) => {
  try {
    const pendingFollowUps = await FollowUp.find({ status: 'pending', submittedBy: req.user._id });
    res.status(200).json(pendingFollowUps);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch your pending follow-ups', details: err.message });
  }
};

// ✅ Update follow-up (status & remarks) by ID
exports.updateFollowUp = async (req, res) => {
  try {
    const { status, remarks } = req.body;
    const { id } = req.params;

    const followUp = await FollowUp.findByIdAndUpdate(
      id,
      { status, remarks, updatedByHealthWorker: true },
      { new: true }
    );

    if (!followUp) return res.status(404).json({ error: 'Follow-up not found' });

    await Notification.create({
      userId: followUp.citizenId,
      title: 'Follow-up Status Updated',
      message: `Your follow-up status was updated by ${req.user.fullName}. Please check your dashboard.`
    });

    res.json(followUp);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update follow-up' });
  }
};

// ✅ Main route with filtering by citizen name & status
exports.getFollowUpsForCurrentHealthWorker = async (req, res) => {
  try {
    const { name, status } = req.query;
    const healthWorkerName = req.user.fullName;

    const filter = { healthWorkerName };

    if (status) {
      filter.status = status;
    }

    if (name) {
      filter.citizenName = { $regex: name, $options: 'i' }; // case-insensitive
    }

    const followUps = await FollowUp.find(filter).sort({ createdAt: -1 });
    res.status(200).json(followUps);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch follow-ups', details: err.message });
  }
};