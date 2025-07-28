import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  FaUserCheck,
  FaClipboardList,
  FaHeartbeat,
  FaStethoscope
} from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  PointElement,
  Title,
  ScatterController,
  BarController
} from 'chart.js';
import { MatrixController, MatrixElement } from 'chartjs-chart-matrix';

import '../styles/AdminDashboard.css';
import Risk3DPlot from '../components/Risk3DPlot';
import BPDistributionChart from '../components/BPDistributionChart';
import RiskTrendsChart from '../components/RiskTrendsChart';
import FollowUpCharts from '../components/FollowUpStatusPage';
import UserRoleChart from '../components/UserRoleChart';
import RiskByDietChart from '../components/RiskByDietChart';
import BmiRiskScatterPage from '../components/BmiRiskScatterPage';
import FormBreakdownChartPage from '../components/FormBreakdownChartPage';
import SmokingAlcoholRiskChart from '../components/SmokingAlcoholRiskChart';
import CorrelationHeatmapPage from '../components/CorrelationHeatmapPage';
import PendingByHealthWorkerPage from '../components/PendingByHealthWorkerPage';

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  PointElement,
  Title,
  ScatterController,
  BarController,
  MatrixController,
  MatrixElement
);

const AdminDashboard = () => {
  const { t } = useTranslation();
  const [pendingUsers, setPendingUsers] = useState([]);
  const [formStats, setFormStats] = useState({ lifestyleCount: 0, medicalCount: 0, totalCount: 0 });
  const [userStats, setUserStats] = useState(null);
  const [showPending, setShowPending] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };

        const [usersRes, statsRes, userStatsRes] = await Promise.all([
          axios.get('http://localhost:5000/api/admin/pending-users', config),
          axios.get('http://localhost:5000/api/admin/form-stats', config),
          axios.get('http://localhost:5000/api/admin/user-stats', config)
        ]);

        setPendingUsers(usersRes.data);
        setFormStats(statsRes.data);
        setUserStats(userStatsRes.data);
      } catch (err) {
        console.error(err);
        alert(t('adminDashboard.load_error'));
      }
    };
    fetchData();
  }, [t]);

  const handleAction = async (userId, action) => {
    try {
      const token = localStorage.getItem('token');
      const endpoint = `http://localhost:5000/api/admin/${action}/${userId}`;
      await axios.patch(endpoint, {}, { headers: { Authorization: `Bearer ${token}` } });

      const updated = await axios.get('http://localhost:5000/api/admin/pending-users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPendingUsers(updated.data);
      alert(t(`${action}_success`));
    } catch (err) {
      console.error(err);
      alert(t(`${action}_error`));
    }
  };

  const renderFileLink = (filename, label) => {
    if (!filename) return null;
    const clean = filename.replace(/^uploads[\\/]+/, '');
    return (
      <a
        href={`http://localhost:5000/uploads/reports/${clean}`}
        target="_blank"
        rel="noreferrer"
        className="doc-link"
      >
        {label}
      </a>
    );
  };

  return (
    <div className="admin-dashboard">
      <div className="header">
        <h2>{t('adminDashboard.admin_dashboard')}</h2>
        <button className="icon-button" onClick={() => setShowPending(!showPending)}>
          <FaUserCheck size={20} /> {t('adminDashboard.pending')} ({pendingUsers.length})
        </button>
      </div>

    <div className="stat-cards">
  {['adminDashboard.total_forms', 'adminDashboard.lifestyle_forms', 'adminDashboard.medical_forms'].map((key, idx) => (
    <div className={`stat-card ${key.split('_')[0]}`} key={key}>
      {[FaClipboardList, FaHeartbeat, FaStethoscope][idx]({ size: 30 })}
      <h4>{t(key)}</h4>
      <p>{formStats[["totalCount", "lifestyleCount", "medicalCount"][idx]]}</p>
    </div>
  ))}
</div>


      {userStats && (
        <div className="stat-cards">
          <div className="stat-card">
            <FaUserCheck size={30} />
            <h4>{t('adminDashboard.total_users')}</h4>
            <p>{userStats.totalUsers}</p>
          </div>
          <div className="stat-card">
            <FaUserCheck size={30} />
            <h4>{t('adminDashboard.verified_users')}</h4>
            <p>{userStats.verifiedUsers}</p>
          </div>
          <div className="stat-card">
            <FaUserCheck size={30} />
            <h4>{t('adminDashboard.pending_users')}</h4>
            <p>{userStats.pendingUsers}</p>
          </div>
        </div>
      )}

      <div className="form-chart-row">
        <UserRoleChart />
        <FormBreakdownChartPage />
        <FollowUpCharts />
      </div>

      <div className="chart-section-row">
        <div className="chart-section"><RiskTrendsChart /></div>
        <div className="chart-section"><BPDistributionChart /></div>
      </div>

      <div className="chart-section-row">
        <div className="chart-section"><RiskByDietChart /></div>
        <div className="chart-section"><CorrelationHeatmapPage /></div>
        
      </div>
      <div className="chart-section-row">
        <div className="chart-section"><SmokingAlcoholRiskChart /></div>
        <div className="chart-section"><PendingByHealthWorkerPage /></div>
        </div>
        <div className="chart-section"><BmiRiskScatterPage /></div>

      <div className="chart-section-row">
        
        <div className="chart-section"><Risk3DPlot /></div>
      </div>

      {showPending && (
        <div className="user-list">
          {pendingUsers.map(user => (
            <div key={user._id} className="user-card">
              <h4>{user.fullName} ({t(user.userType)})</h4>
              <p>{t('email')}: {user.email}</p>
              <p>{t('contact')}: {user.contactNumber}</p>
              <p>{t('district')}: {user.district}, {t('city')}: {user.city}</p>
              {user.userType === 'doctor' && (
                <>
                  <p>{t('adminDashboard.specialization')}: {user.specialization}</p>
                  <p>{t('adminDashboard.hospital')}: {user.hospital}</p>
                  <p>{t('adminDashboard.registration_number')}: {user.registrationNumber}</p>
                </>
              )}
              {user.userType === 'health_worker' && (
                <>
                  <p>{t('adminDashboard.role')}: {user.role}</p>
                  <p>{t('adminDashboard.institution')}: {user.institution}</p>
                </>
              )}
              <div className="docs">
                {renderFileLink(user.degreeCertificate, t('adminDashboard.degree_certificate'))}
                {renderFileLink(user.idProof, t('adminDashboard.id_proof'))}
              </div>
              <div className="actions">
                <button className="approve" onClick={() => handleAction(user._id, 'approve')}>
                  {t('adminDashboard.approve')}
                </button>
                <button className="reject" onClick={() => handleAction(user._id, 'reject')}>
                  {t('adminDashboard.reject')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;