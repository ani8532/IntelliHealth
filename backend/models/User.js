const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: String,
  email: { type: String, required: true, unique: true },
  password: String,
  contactNumber: String,
  userType: { type: String, enum: ['doctor', 'health_worker', 'citizen', 'admin'], required: true },
  isVerified: { type: Boolean, default: false },

  // Location - common for all users
  location: {
    state: String,
    district: String,
    city: String
  },

  // Doctor fields
  registrationNumber: String,
  specialization: String,
  hospital: String,
  degreeCertificate: String,
  idProof: String,

  // Health worker fields
  employeeId: String,
  role: String,
  institution: String,
  workState: String,

  // Citizen fields
  age: Number,
  gender: String,
});

module.exports = mongoose.model('User', userSchema);
