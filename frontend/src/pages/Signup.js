import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../styles/signup.css';

const Signup = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    userType: '',
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    contactNumber: '',
    district: '',
    city: '',
    state: '',
    gender: '',
    registrationNumber: '',
    specialization: '',
    hospital: '',
    degreeCertificate: null,
    idProof: null,
    employeeId: '',
    role: '',
    institution: '',
    workState: '',
    age: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setForm(prev => ({ ...prev, [name]: files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      alert(t('passwords_do_not_match'));
      return;
    }

    const formData = new FormData();
    for (let key in form) {
      if (form[key]) {
        formData.append(key, form[key]);
      }
    }

    try {
      await axios.post('http://localhost:5000/api/auth/signup', formData);

      alert(
        form.userType === 'citizen'
          ? t('signup_success')
          : t('signup_success_pending')
      );
      navigate('/login');
    } catch (err) {
      console.error('Signup Error:', err.response?.data || err.message);
      alert(err.response?.data?.error || t('signup_failed'));
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit} encType="multipart/form-data">
        <h2>{t('signin.signup')}</h2>

        <label>{t('signin.user_type')}</label>
        <select name="userType" value={form.userType} onChange={handleChange} required>
          <option value="">{t('signin.select')}</option>
          <option value="doctor">{t('signin.doctor')}</option>
          <option value="health_worker">{t('signin.health_worker')}</option>
          <option value="citizen">{t('signin.citizen')}</option>
        </select>

        <input name="fullName" placeholder={t('signin.full_name')} onChange={handleChange} required />
        <input name="email" type="email" placeholder={t('signin.email')} onChange={handleChange} required />
        <input name="password" type="password" placeholder={t('signin.password')} onChange={handleChange} required />
        <input name="confirmPassword" type="password" placeholder={t('signin.confirm_password')} onChange={handleChange} required />
        <input name="contactNumber" placeholder={t('signin.contact_number')} onChange={handleChange} required />
        <input name="state" placeholder={t('signin.state')} onChange={handleChange} required />
        <input name="district" placeholder={t('signin.district')} onChange={handleChange} required />
        <input name="city" placeholder={t('signin.city')} onChange={handleChange} required />
        <input name="gender" placeholder={t('signin.gender')} onChange={handleChange} required />

        {form.userType === 'doctor' && (
          <>
            <input name="registrationNumber" placeholder={t('signin.registration_number')} onChange={handleChange} required />
            <input name="specialization" placeholder={t('signin.specialization')} onChange={handleChange} required />
            <input name="hospital" placeholder={t('signin.hospital')} onChange={handleChange} required />

            <label>{t('signin.degree_certificate')}</label>
            <input type="file" name="degreeCertificate" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} required />

            <label>{t('signin.id_proof')}</label>
            <input type="file" name="idProof" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} required />
          </>
        )}

        {form.userType === 'health_worker' && (
          <>
            <input name="employeeId" placeholder={t('signin.employee_id')} onChange={handleChange} required />
            <input name="role" placeholder={t('signin.role')} onChange={handleChange} required />
            <input name="institution" placeholder={t('signin.institution')} onChange={handleChange} required />
            <input name="workState" placeholder={t('signin.work_state')} onChange={handleChange} required />

            <label>{t('signin.id_proof')}</label>
            <input type="file" name="idProof" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} required />
          </>
        )}

        {form.userType === 'citizen' && (
          <input name="age" placeholder={t('signin.age')} onChange={handleChange} required />
        )}

        <button type="submit">{t('signin.signup')}</button>
        <p className="auth-footer">
          {t('signin.already_account')} <Link to="/login">{t('signin.login_here')}</Link>
        </p>
      </form>
    </div>
  );
};

export default Signup;
