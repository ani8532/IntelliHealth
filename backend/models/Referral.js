
const mongoose = require('mongoose');

const referralSchema = new mongoose.Schema({
  citizenName: String,
  citizenId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  doctorName: String,
  referredBy: String,
  type: String,
  report: String,
  consulted: { type: Boolean, default: false },
  appointmentDate: String,
  appointmentTime: String,
  videoLink: String,
  videoLinkExpiresAt: Date,
  consultationConfirmed: {
  type: Boolean,
  userType: {
    type: String,
    enum: ['citizen', 'healthworker'], // ✅ Allowed values only
    required: true
  },

  default: false
},

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Referral', referralSchema);