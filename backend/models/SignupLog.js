const mongoose = require('mongoose');

const signupLogSchema = new mongoose.Schema({
  userType: { type: String, enum: ['doctor', 'health_worker', 'citizen', 'admin'], required: true },
  count: { type: Number, default: 0 }
});

module.exports = mongoose.model('SignupLog', signupLogSchema);
