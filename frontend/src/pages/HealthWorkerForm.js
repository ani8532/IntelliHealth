import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import lifestyleImg from '../assets/ai.jpeg';
import medicalImg from '../assets/100.jpg';
import '../styles/citizen.css';

const HealthWorkerFormSelection = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="dashboard-container">
      <h2>{t('hwr.formSelection.heading')}</h2>
      <p>{t('hwr.formSelection.description')}</p>

      <div className="card-container">
        <div className="card" onClick={() => navigate('/health-worker/lifestyle-form')}>
          <img src={lifestyleImg} alt={t('hwr.formSelection.lifestyleAlt')} />
          <h3>{t('hwr.formSelection.lifestyleTitle')}</h3>
          <p>{t('hwr.formSelection.lifestyleDesc')}</p>
        </div>
        <div className="card" onClick={() => navigate('/health-worker/medical-form')}>
          <img src={medicalImg} alt={t('hwr.formSelection.medicalAlt')} />
          <h3>{t('hwr.formSelection.medicalTitle')}</h3>
          <p>{t('hwr.formSelection.medicalDesc')}</p>
        </div>
      </div>
    </div>
  );
};

export default HealthWorkerFormSelection;
