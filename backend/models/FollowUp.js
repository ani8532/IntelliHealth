const mongoose = require('mongoose');

const followUpSchema = new mongoose.Schema({
  citizenName: String,
  citizenContact: String,
  healthWorkerName: String,
  remarks: String,
  status: {
    type: String,
    enum: ['pending', 'recovered', 'referred'],
    default: 'pending',
    lowercase: true
  },
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  citizenId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedByHealthWorker: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('FollowUp', followUpSchema);