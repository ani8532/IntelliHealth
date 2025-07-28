import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { useTranslation } from 'react-i18next';

ChartJS.register(ArcElement, Tooltip, Legend);

const UserRoleChart = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/admin/user-stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(res.data);
      } catch (err) {
        console.error('Failed to fetch user stats:', err);
      }
    };

    fetchStats();
  }, []);

  if (!stats) return <p className="text-center">{t('adminDashboard.loading')}</p>;

  const chartData = {
    labels: [t('adminDashboard.citizens'), t('adminDashboard.health_workers'), t('adminDashboard.doctors')],
    datasets: [
      {
        label: t('adminDashboard.user_roles'),
        data: [
          stats.byRole.citizens,
          stats.byRole.healthWorkers,
          stats.byRole.doctors,
        ],
        backgroundColor: ['#4BC0C0', '#36A2EB', '#FF6384'],
        borderColor: '#fff',
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className="chart-wrapper">
      <h2 className="chart-title">{t('adminDashboard.user_role_distribution')}</h2>
      <div className="chart-container">
        <Pie data={chartData} />
      </div>

      <style>{`
        .chart-wrapper {
          background-color: white;
          padding: 1rem;
          border-radius: 1rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          max-width: 420px;
          margin: auto;
        }

        .chart-title {
          text-align: center;
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 1rem;
        }

        .chart-container {
          position: relative;
          width: 100%;
          height: auto;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .chart-container canvas {
          max-width: 360px;
          max-height: 360px;
        }

        @media (max-width: 480px) {
          .chart-container canvas {
            max-width: 280px;
            max-height: 280px;
          }
        }
      `}</style>
    </div>
  );
};

export default UserRoleChart;
