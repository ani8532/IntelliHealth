import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/citizen.css';
import lifestyleImg from '../assets/ai.jpeg';
import medicalImg from '../assets/100.jpg';
import { useTranslation } from 'react-i18next';
import { Mail, Bell, User } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import CitizenProfile from './CitizenProfile';

const CitizenDashboard = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { token, user } = useAuth();

  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [showProfile, setShowProfile] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [formHistory, setFormHistory] = useState([]);

  useEffect(() => {
    const fetchUnreadCounts = async () => {
      try {
        const [msgRes, notifRes] = await Promise.all([
          axios.get('/api/messages/unread-count', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`/api/notifications/unread-count/${user._id}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
        setUnreadMessages(msgRes.data.count || 0);
        setUnreadNotifications(notifRes.data.count || 0);
      } catch (err) {
        console.error('Failed to fetch unread counts:', err);
      }
    };

    if (token && user) fetchUnreadCounts();
  }, [token, user]);

  const fetchFormHistory = async () => {
    try {
      const res = await axios.get('/api/form-history', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setFormHistory(res.data);
      setShowHistory(true);
    } catch (err) {
      console.error('Failed to fetch form history:', err);
    }
  };

  const handleConsult = (form) => {
    localStorage.setItem('latestReport', JSON.stringify(form));
    localStorage.setItem('citizenInfo', JSON.stringify(user));
    navigate('/consult-doctor');
  };

  const handleDownload = (form) => {
    const blob = new Blob([JSON.stringify(form, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${form.name || form.fullName}-${form.formType}-Report.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (showProfile) return <CitizenProfile />;

  return (
    <div className="dashboard-container">
      <div className="icon-container">
        <div className="icon-wrapper" onClick={() => navigate('/inbox')}>
          <Mail size={26} color="#333" />
          {unreadMessages > 0 && <span className="badge">{unreadMessages}</span>}
        </div>
        <div className="icon-wrapper" onClick={() => navigate('/notifications')}>
          <Bell size={26} color="#333" />
          {unreadNotifications > 0 && <span className="badge">{unreadNotifications}</span>}
        </div>
        <div className="icon-wrapper" onClick={() => setShowProfile(true)}>
          <User size={26} color="#333" />
        </div>
      </div>

      <h2>{t('cddash.welcome_to_intellihealth')}</h2>
      <p>{t('cddash.select_method')}</p>

      <div className="card-container">
        <div className="card" onClick={() => navigate('/lifestyle-form')}>
          <img src={lifestyleImg} alt={t('cddash.lifestyle_title')} />
          <h3>{t('cddash.lifestyle_title')}</h3>
          <p>{t('cddash.lifestyle_description')}</p>
        </div>

        <div className="card" onClick={() => navigate('/medical-form')}>
          <img src={medicalImg} alt={t('cddash.medical_title')} />
          <h3>{t('cddash.medical_title')}</h3>
          <p>{t('cddash.medical_description')}</p>
        </div>
      </div>

      <button onClick={fetchFormHistory} className="history-button">
        {t('cddash.view_form_history')}
      </button>

      {showHistory && (
        <div className="form-history">
          <h3>{t('cddash.submitted_forms')}</h3>
          {formHistory.length === 0 ? (
            <p>{t('cddash.no_forms_yet')}</p>
          ) : (
            formHistory.map((form, index) => (
              <div key={index} className="form-entry">
                <p><strong>{t('cddash.name')}:</strong> {form.name || form.fullName}</p>
                <p><strong>{t('cddash.form_type')}:</strong> {form.formType}</p>
                <div className="form-actions">
                  <button onClick={() => handleConsult(form)}>{t('cddash.consult_doctor')}</button>
                  <button onClick={() => handleDownload(form)}>{t('cddash.download_report')}</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <div className="info-section">
        <h4>{t('cddash.lifestyle_title')}</h4>
        <ul>
          <li>{t('cddash.lifestyle_point1')}</li>
          <li>{t('cddash.lifestyle_point2')}</li>
          <li>{t('cddash.lifestyle_point3')}</li>
        </ul>

        <h4>{t('cddash.medical_title')}</h4>
        <ul>
          <li>{t('cddash.medical_point1')}</li>
          <li>{t('cddash.medical_point2')}</li>
          <li>{t('cddash.medical_point3')}</li>
        </ul>
      </div>
    </div>
  );
};

export default CitizenDashboard;
