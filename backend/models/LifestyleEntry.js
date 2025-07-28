const mongoose = require('mongoose');

const lifestyleSchema = new mongoose.Schema({
  name: String,
  contact: String,
  age: Number,
  gender: String,
  height: Number,
  weight: Number,
  bmi: Number,
  state: String,
  district: String,
  city: String,
  dietType: String,
  sleep: Number,
  waterIntake: Number,
  smoking: String,
  alcohol: String,
  areaType: String,
  fastFoodFreq: String,
  diabetesSymptoms: [String],
  bpSymptoms: [String],
  heartSymptoms: [String],
  familyHistory: [String],
  currentSymptoms: [String],

  // ML model outputs
  isDiabetes: Number,
  isBP: Number,
  isHeartDisease: Number,
  
  diabetesLevel: String,
  bpLevel: String,
  heartLevel: String,

  // Submitter info
  submittedBy: String, // name of user
  submittedByRole: {
    type: String,
    enum: ['citizen', 'health_worker'],
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('LifestyleEntry', lifestyleSchema);
