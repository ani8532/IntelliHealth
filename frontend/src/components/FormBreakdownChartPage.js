import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import { useTranslation } from 'react-i18next';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const FormBreakdownChartPage = () => {
  const { t } = useTranslation();
  const [formBreakdown, setFormBreakdown] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get('/api/admin/form-breakdown', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => setFormBreakdown(res.data))
      .catch(err => console.error('Failed to fetch form breakdown:', err));
  }, []);

  if (!formBreakdown) return <p className="text-center mt-8">{t('loading')}...</p>;

  const chartData = {
    labels: [
      t('adminDashboard.lifestyle_forms'),
      t('adminDashboard.medical_forms'),
    ],
    datasets: ['citizen', 'health_worker'].map((role, i) => ({
      label: t(`adminDashboard.${role}`),
      backgroundColor: ['#007bff', '#28a745'][i],
      data: [
        formBreakdown.lifestyle?.[role] || 0,
        formBreakdown.medical?.[role] || 0,
      ],
    })),
  };

  const chartOptions = {
    responsive: true,
    plugins: { legend: { position: 'top' } },
    scales: {
      x: { stacked: true },
      y: { stacked: true, beginAtZero: true },
    },
  };

  return (
    <div className="chart-wrapper">
      <h2 className="chart-title">
        {t('adminDashboard.form_distribution_by_role')}
      </h2>
      <div className="bar-chart-container">
        <Bar data={chartData} options={{ ...chartOptions, maintainAspectRatio: false }} />
      </div>

      {/* Inline Styling */}
      <style>
        {`
          .chart-wrapper {
            background-color: white;
            padding: 1rem;
            border-radius: 1rem;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            max-width: 800px;
            margin: 1rem auto;
            height: 400px;
          }

          .chart-title {
            text-align: center;
            font-size: 1.5rem;
            font-weight: bold;
            margin-bottom: 1rem;
          }

          .bar-chart-container {
            width: 100%;
            height: 400px;
          }

          @media (max-width: 600px) {
            .bar-chart-container {
              height: 300px;
            }
          }
        `}
      </style>
    </div>
  );
};

export default FormBreakdownChartPage;
