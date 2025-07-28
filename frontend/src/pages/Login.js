import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import '../styles/auth.css';

const Login = () => {
  const { t } = useTranslation();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', form);
      const { token, user } = res.data;

      login(user, token);
      switch (user.userType) {
        case 'doctor':
          navigate('/doctor/dashboard');
          break;
        case 'health_worker':
          navigate('/health-worker/dashboard');
          break;
        case 'citizen':
          navigate('/dashboard-1');
          break;
        default:
          alert('Unknown user type');
      }
    } catch (err) {
      console.error(err);
      alert(t('loginForm.login_failed'));
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleSubmit} className="auth-form">
        <h2>{t('loginForm.title')}</h2>
        <p className="auth-welcome">{t('loginForm.welcome')}</p>

        <input
          name="email"
          type="email"
          placeholder={t('loginForm.email')}
          onChange={handleChange}
          required
        />
        <input
          name="password"
          type="password"
          placeholder={t('loginForm.password')}
          onChange={handleChange}
          required
        />
        <button type="submit">{t('loginForm.login_button')}</button>

        <p className="auth-footer">
          {t('loginForm.no_account')} <Link to="/signup">{t('loginForm.signup_link')}</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
