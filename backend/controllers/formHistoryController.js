const LifestyleEntry = require('../models/LifestyleEntry');
const MedicalEntry = require('../models/medicalformmodel');

exports.getFormHistory = async (req, res) => {
  try {
    const submittedBy = req.user.fullName;

    const [lifestyleForms, medicalForms] = await Promise.all([
      LifestyleEntry.find({ submittedBy }),
      MedicalEntry.find({ submittedBy })
    ]);

    const formattedLifestyle = lifestyleForms.map(form => ({
      _id: form._id,
      name: form.name,
      formType: 'Lifestyle',
      ...form._doc
    }));

    const formattedMedical = medicalForms.map(form => ({
      _id: form._id,
      name: form.name,
      formType: 'Medical',
      ...form._doc
    }));

    res.status(200).json([...formattedLifestyle, ...formattedMedical]);
  } catch (err) {
    console.error('Error fetching form history:', err);
    res.status(500).json({ message: 'Failed to fetch form history' });
  }
};
