import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import CitizenDashboard from './pages/CitizenDashboard';
import LifestyleForm from './pages/LifestyleForm';
import MedicalForm from './pages/MedicalForm';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import ConsultDoctor from './pages/ConsultDoctor';
import HealthWorkerProfile from './pages/HealthWorkerProfile';
import HealthWorkerDashboard from './pages/HealthWorkerDashboard';
import FollowUpList from './pages/FollowUpList';
import HealthWorkerNotifications from './pages/HealthWorkerNotifications';
import HealthWorkerFormSelection from './pages/HealthWorkerForm';
import ReferToDoctorForHealthWorker from './pages/ReferToDoctorForHealthWorker';
import ReferralHistory from './pages/ReferralHistory';
import DoctorDashboard from './pages/DoctorDashboard';
import DoctorNotifications from './pages/DoctorNotifications';
import DoctorPrescriptionForm from './pages/DoctorPrescriptionForm';
import DoctorReferralsList from './pages/DoctorReferralsList';
import CitizenInbox from './pages/CitizenInbox';
import CitizenNotifications from './pages/CitizenNotifications';

const storedUser = localStorage.getItem('user');



const App = () => {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard-1" element={<CitizenDashboard />} />
        <Route path="/lifestyle-form" element={<LifestyleForm />} />
        <Route path="/medical-form" element={<MedicalForm />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard/>} />
        <Route path="/consult-doctor" element={<ConsultDoctor/>} />
        <Route path="/health-worker/profile" element={<HealthWorkerProfile />} />
        <Route path="/health-worker/dashboard" element={<HealthWorkerDashboard />} />
        <Route path="/health-worker/followUp" element={<FollowUpList />} />
        <Route path="/health-worker/notifications" element={<HealthWorkerNotifications />} />
        <Route path="/health-worker/form-selection" element={<HealthWorkerFormSelection />} />
        <Route path="/health-worker/lifestyle-form" element={<LifestyleForm />} />
        <Route path="/health-worker/medical-form" element={<MedicalForm />} />
        <Route path="/health-worker/refer" element={<ReferToDoctorForHealthWorker />} />
        <Route path="/health-worker/referral-history" element={<ReferralHistory />} />
        <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
        <Route path="/doctor/notifications" element={<DoctorNotifications />} />
        <Route path="/doctor/prescribe" element={<DoctorPrescriptionForm />} />
        <Route path="/doctor/referrals" element={<DoctorReferralsList />} />
        <Route path="/inbox" element={<CitizenInbox />} />
        <Route path="/notifications" element={<CitizenNotifications />} />








        
      
        
        
    
      </Routes>
    </>
  );
};

export default App;
