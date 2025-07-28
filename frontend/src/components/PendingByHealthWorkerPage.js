import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from 'chart.js';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const PendingByHealthWorkerPage = () => {
  const { t } = useTranslation();
  const [pendingByHW, setPendingByHW] = useState({});

  useEffect(() => {
    const fetchPendingData = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/followup/pending', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const grouped = res.data.reduce((acc, item) => {
          const name = item.healthWorkerName || t('unknown');
          acc[name] = (acc[name] || 0) + 1;
          return acc;
        }, {});
        setPendingByHW(grouped);
      } catch (err) {
        console.error('Error fetching pending follow-up data:', err);
      }
    };

    fetchPendingData();
  }, [t]);

  const barChartData = {
    labels: Object.keys(pendingByHW),
    datasets: [
      {
        label: t('adminDashboard.pending_followups'),
        data: Object.values(pendingByHW),
        backgroundColor: '#3498db',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        labels: {
          font: { size: 14 }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0
        }
      }
    }
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>{t('adminDashboard.pending_by_health_worker')}</h3>
      <div style={styles.chartWrapper}>
        <Bar data={barChartData} options={chartOptions} />
      </div>
    </div>
  );
};

// 🧩 Internal CSS
const styles = {
  container: {
    maxWidth: '900px',
    margin: '30px auto',
    padding: '20px',
    background: '#fff',
    borderRadius: '16px',
    boxShadow: '0 0 10px rgba(0,0,0,0.1)',
  },
  title: {
    textAlign: 'center',
    marginBottom: '20px',
    fontSize: '1.4rem',
    fontWeight: 'bold',
    color: '#333',
  },
  chartWrapper: {
    width: '100%',
    height: '400px',
  }
};

export default PendingByHealthWorkerPage;
