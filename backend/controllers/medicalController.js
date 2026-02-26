const { spawn } = require('child_process');
const FollowUp = require('../models/FollowUp');
const MedicalForm = require("../models/medicalformmodel");

exports.predictMedical = async (req, res) => {
  const {
    name, age, gender, height, weight, bmi,
    fastingBloodSugar, hba1c, systolicBP, diastolicBP,
    cholesterol, triglycerides, state, district, city,
    symptoms, diagnosisReports, currentMedication,
    familyHistory, lifestyleFactors, dietType, smoking, alcohol, waterIntake
  } = req.body;

  const symptomList = Array.isArray(symptoms) ? symptoms.join(', ') : symptoms;

  const py = spawn('python', ['ml/med_predict.py']);
  const input = JSON.stringify({ ...req.body, bmi, symptoms: symptomList });

  let output = '';
  let errorOutput = '';

  py.stdin.write(input);
  py.stdin.end();

  py.stdout.on('data', data => output += data.toString());
  py.stderr.on('data', data => errorOutput += data.toString());

  py.on('close', async (code) => {
    if (code !== 0) {
      console.error('Python error:', errorOutput);
      return res.status(500).json({ error: 'ML model prediction failed.' });
    }

    try {
      const parsed = JSON.parse(output);

      const entry = new MedicalEntry({
        name,
        age,
        gender,
        height,
        weight,
        bmi,
        fastingBloodSugar,
        hba1c,
        systolicBP,
        diastolicBP,
        cholesterol,
        triglycerides,
        state,
        district,
        city,
        symptoms: symptomList,
        diagnosisReports,
        currentMedication,
        familyHistory,
        lifestyleFactors,
        dietType,
        smoking,
        alcohol,
        waterIntake,
        submittedBy: req.user?.fullName || 'Unknown',
        submittedByRole: req.user?.userType || 'unknown',

        // ✅ Include ML results:
        diabetesRisk: parsed.diabetesRisk,
        bpRisk: parsed.bpRisk,
        heartDiseaseRisk: parsed.heartDiseaseRisk,
        isDiabetes: parsed.isDiabetes,
        isBP: parsed.isBP,
        isHeartDisease: parsed.isHeartDisease,
        suggestions: parsed.suggestions,
        reasons: parsed.reasons,
        report: parsed.report
      });

      await entry.save(); // ✅ Save after prediction

      // ✅ Follow-up tracking (only for health workers)
      if (req.user?.userType === 'health_worker') {
        const existingFollowUp = await FollowUp.findOne({
          citizenName: name,
          healthWorkerName: req.user.fullName,
          status: 'pending'
        });

        if (existingFollowUp) {
          existingFollowUp.updatedAt = new Date();
          await existingFollowUp.save();
        } else {
          await FollowUp.create({
            citizenName: name,
            citizenId: req.user._id,
            healthWorkerName: req.user.fullName,
            submittedBy: req.user._id,
            status: 'pending'
          });
        }
      }

      return res.json({
        name,
        bmi,
        ...parsed
      });

    } catch (jsonErr) {
      console.error('JSON Parse Error:', jsonErr);
      return res.status(500).json({ error: 'ML model gave invalid response.' });
    }
  });
};
exports.getMedicalEntriesByUser = async (req, res) => {
  try {
    const { submittedBy, city, district } = req.query;
    const filter = {};

    if (submittedBy) filter.submittedBy = submittedBy;
    if (city) filter.city = city;
    if (district) filter.district = district;

    const entries = await MedicalEntry.find(filter).sort({ createdAt: -1 });
    res.json(entries);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch entries" });
  }
};

exports.getAllMedicalEntries = async (req, res) => {
  try {
    const entries = await MedicalEntry.find().sort({ createdAt: -1 });
    res.json(entries);
  } catch (err) {
    console.error('Failed to fetch all medical entries:', err);
    res.status(500).json({ error: "Failed to fetch all medical entries" });
  }
};
