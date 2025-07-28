const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
// Route imports
const userRoutes = require('./routes/user');
const notificationRoutes = require('./routes/notification');
const followUpRoutes = require('./routes/followUp');
const authRoutes = require('./routes/authRoutes');
const lifestyleRoutes = require('./routes/lifestyleRoutes');
const medicalRoutes = require('./routes/medicalRoutes');
const adminRoutes = require('./routes/admin');
const doctorRoutes = require('./routes/doctorRoutes');
const healthWorkerRoutes = require('./routes/healthWorker');
const referralRoutes = require('./routes/referralRoutes');
const messageRoutes = require('./routes/messageRoutes');
const formHistoryRoutes = require('./routes/formHistoryRoutes');

const app = express();

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB Atlas connected'))
.catch(err => console.error('MongoDB Atlas connection error:', err));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads/reports', express.static(path.join(__dirname, 'uploads/reports')));
app.use('/plots', express.static(path.join(__dirname, 'ml/plots')));


// Mounting routes

app.use('/api/form-history', formHistoryRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/lifestyle', lifestyleRoutes);
app.use('/api/medical', medicalRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/healthworker', healthWorkerRoutes);
app.use('/api/followup', followUpRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/user', userRoutes);
app.use('/api/referral', require('./routes/referralRoutes'));
app.use('/uploads/prescriptions',express.static(path.join(__dirname, 'uploads/prescriptions')));
app.use('/api/prescription', require('./routes/prescriptionRoutes'));





const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
