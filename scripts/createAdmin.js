const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// ✅ Correct path to .env based on your folder structure
require('dotenv').config({ path: '../backend/.env' });

// ✅ Correct path to your User model
const User = require('../backend/models/User');

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

const createAdmin = async () => {
  try {
    const email = 'admin@intellihealth.com';
    const existingAdmin = await User.findOne({ email });

    if (existingAdmin) {
      console.log('⚠️ Admin already exists');
      return mongoose.disconnect();
    }

    const hashedPassword = await bcrypt.hash('admin@123', 10);

    const admin = new User({
      fullName: 'Super Admin',
      email,
      password: hashedPassword,
      contactNumber: '9999999999',
      userType: 'admin',
      isVerified: true
    });

    await admin.save();
    console.log('✅ Admin account created successfully');
  } catch (err) {
    console.error('❌ Error creating admin:', err.message);
  } finally {
    mongoose.disconnect();
  }
};

createAdmin();
