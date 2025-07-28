import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../styles/Home.css';

const Home = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleUserSelect = (type) => {
    if (type === 'admin') navigate('/admin-login')
       else navigate('/login');
  };

  return (
    <div className="home-container">
      <h2>{t('home.welcome_title')}</h2>
      <p style={{ fontStyle: 'italic', marginBottom: '2rem' }}>{t('home.welcome_quote')}</p>

      <h3>{t('home.select_user')}</h3>
      <div className="user-buttons">
        <button onClick={() => handleUserSelect('citizen')}>{t('home.citizen')}</button>
        <button onClick={() => handleUserSelect('doctor')}>{t('home.doctor')}</button>
        <button onClick={() => handleUserSelect('health_worker')}>{t('home.health_worker')}</button>
        <button onClick={() => handleUserSelect('admin')}>{t('home.admin')}</button>
      </div>

      <div className="content-section">
        <h3>{t('home.about_heading')}</h3>
        <p>{t('home.about_text')}</p>

        <h4>{t('home.features_heading')}</h4>
        <ul>
          <li>{t('home.feature1')}</li>
          <li>{t('home.feature2')}</li>
          <li>{t('home.feature3')}</li>
        </ul>

        <h4>{t('home.advantages_heading')}</h4>
        <ul>
          <li>{t('home.advantage1')}</li>
          <li>{t('home.advantage2')}</li>
          <li>{t('home.advantage3')}</li>
        </ul>
      </div>
    </div>
  );
};

export default Home;
