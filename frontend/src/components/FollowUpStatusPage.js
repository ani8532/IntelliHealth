import React, { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import '../styles/ChartStyles.css';

Chart.register(ArcElement, Tooltip, Legend);

const FollowUpStatusPage = () => {
  const { t } = useTranslation();
  const [statusStats, setStatusStats] = useState(null);

  useEffect(() => {
    const fetchStatusData = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/admin/followup-chart', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStatusStats(res.data);
      } catch (err) {
        console.error('Error fetching follow-up status:', err);
      }
    };

    fetchStatusData();
  }, []);

  if (!statusStats) return <div>{t('adminDashboard.loading')}</div>;

  const pieChartData = {
    labels: [t('adminDashboard.pending'), t('adminDashboard.recovered'), t('adminDashboard.referred')],
    datasets: [
      {
        data: [
          statusStats.pending,
          statusStats.recovered,
          statusStats.referred,
        ],
        backgroundColor: ['#f39c12', '#2ecc71', '#e74c3c'],
      },
    ],
  };

  return (
    <div style={{ maxWidth: '600px', margin: '30px auto' }}>
      <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>
        {t('adminDashboard.follow_up_status_distribution')}
      </h3>
      <Pie data={pieChartData} />
    </div>
  );
};

export default FollowUpStatusPage;
