const mongoose = require('mongoose');

const medicalSchema = new mongoose.Schema({
  name: String,
  contact: String,
  age: Number,
  gender: String,
  height: Number,
  weight: Number,
  bmi: Number,

  // Location
  state: String,
  district: String,
  city: String,

  // Medical test fields
  fastingBloodSugar: Number,
  hba1c: Number,
  systolicBP: Number,
  diastolicBP: Number,
  cholesterol: Number,
  triglycerides: Number,

  // Symptoms and other info
  symptoms: [String],
  diagnosisReports: String,
  currentMedication: String,
  familyHistory: String,
  lifestyleFactors: String,

  // Lifestyle fields
  dietType: String,
  smoking: String,
  alcohol: String,
  waterIntake: Number,

  // Risk Scores (updated)
  diabetesRisk: Number,
  bpRisk: Number,
  heartDiseaseRisk: Number,

  // Prediction outcome (label if threshold crossed)
  isDiabetes: Number,
  isBP: Number,
  isHeartDisease: Number,

  // Suggestions
  suggestions: {
    diabetes: String,
    blood_pressure: String,
    heart_disease: String
  },

  // SHAP-based reasons (textual)
  reasons: {
    diabetesReasons: [String],
    bpReasons: [String],
    heartReasons: [String]
  },

  // Report content
  report: String,
  pdfPath: String, // relative or absolute path

  submittedBy: String,
  submittedByRole: {
    type: String,
    enum: ['citizen', 'health_worker'],
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.models.MedicalPrediction || mongoose.model('MedicalPrediction', medicalSchema, 'medicalpredictions');

