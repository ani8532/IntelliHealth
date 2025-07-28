const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const SignupLog = require('../models/SignupLog');

const createToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30m' });

exports.signup = async (req, res) => {
  try {
    const {
      fullName, email, password, contactNumber, userType,
      registrationNumber, specialization, hospital,
      district, city, state,
      employeeId, role, institution, workState,
      age, gender
    } = req.body;

    // 🚫 Prevent public admin registration
    if (userType === 'admin') {
      return res.status(403).json({ error: 'Admin signup is not allowed via this form.' });
    }

    // ✅ Prevent duplicate email/contactNumber
    const existingUser = await User.findOne({
      $or: [{ email }, { contactNumber }]
    });
    if (existingUser) {
      return res.status(400).json({ error: 'Email or contact number already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
      contactNumber,
      userType,
      isVerified: userType === 'citizen',
      registrationNumber,
      specialization,
      hospital,
      employeeId,
      role,
      institution,
      workState,
      age,
      gender,
      location: {
        state,
        district,
        city
      },
      degreeCertificate: req.files?.degreeCertificate?.[0]?.path || '',
      idProof: req.files?.idProof?.[0]?.path || '',
    });

    await newUser.save();
    await SignupLog.findOneAndUpdate(
      { userType },
      { $inc: { count: 1 } },
      { upsert: true, new: true }
    );

    console.log(`✅ Signup: ${userType}`);
    res.status(201).json({ message: 'Signup successful. Pending admin verification.' });

  } catch (err) {
    console.error('Signup Error:', err);
    console.log('Request body:', req.body);
    console.log('Request files:', req.files);
    res.status(400).json({ error: 'Signup failed', details: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Incorrect password' });

    // ✅ Admins can login without verification
    if (user.userType !== 'admin' && user.userType !== 'citizen' && !user.isVerified) {
      return res.status(403).json({ error: 'Account pending verification' });
    }

    const token = createToken(user._id);
    res.status(200).json({ token, user });
  } catch (err) {
    res.status(500).json({ error: 'Login failed', details: err.message });
  }
};
