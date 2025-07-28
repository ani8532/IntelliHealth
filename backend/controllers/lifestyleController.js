const { spawn } = require('child_process');
const LifestyleEntry = require('../models/LifestyleEntry');
const FollowUp = require('../models/FollowUp');

exports.predictDisease = async (req, res) => {
  const formData = req.body;
  const submittedBy = req.user?.userType === 'health_worker' ? 'health_worker' : 'citizen';

  const python = spawn('python', ['ml/predict.py']);
  python.stdin.write(JSON.stringify(formData));
  python.stdin.end();

  let output = '';
  let errorOutput = '';

  python.stdout.on('data', (data) => {
    output += data.toString();
  });

  python.stderr.on('data', (err) => {
    errorOutput += err.toString();
    console.error('Python Error:', err.toString());
  });

  python.on('close', async (code) => {
    try {
      if (code !== 0) {
        console.error('Python script exited with error:', errorOutput);
        return res.status(500).json({ error: 'Prediction process failed.' });
      }

      const result = JSON.parse(output);

      const entry = new LifestyleEntry({
        ...formData,
        ...result,
        submittedBy: req.user.fullName || 'Unknown',
        submittedByRole: req.user.userType
      });

      await entry.save();

      if (req.user?.userType === 'health_worker') {
        const existingFollowUp = await FollowUp.findOne({
          citizenName: formData.name,
          healthWorkerName: req.user.fullName,
          status: 'pending'
        });

        if (existingFollowUp) {
          existingFollowUp.updatedAt = new Date();
          await existingFollowUp.save();
        } else {
          await FollowUp.create({
            citizenName: formData.name,
            citizenId: req.user._id,
            healthWorkerName: req.user.fullName,
            submittedBy: req.user._id,
            status: 'pending'
          });
        }
      }

      res.json(result);
    } catch (error) {
      console.error('Prediction error:', error);
      res.status(500).json({ error: 'Prediction failed' });
    }
  });
};

exports.getLifestyleEntriesByUser = async (req, res) => {
  try {
    const { submittedBy, city, district } = req.query;
    const filter = {};

    if (submittedBy) filter.submittedBy = submittedBy;
    if (city) filter.city = city;
    if (district) filter.district = district;

    const entries = await LifestyleEntry.find(filter).sort({ createdAt: -1 });
    res.json(entries);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch entries' });
  }
};

exports.getAllLifestyleEntries = async (req, res) => {
  try {
    const entries = await LifestyleEntry.find().sort({ createdAt: -1 });
    res.json(entries);
  } catch (err) {
    console.error('Failed to fetch all lifestyle entries:', err);
    res.status(500).json({ error: 'Failed to fetch all lifestyle entries' });
  }
};
