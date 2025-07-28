import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { Chart, LineElement, CategoryScale, LinearScale, PointElement, Legend, Tooltip } from 'chart.js';
import '../styles/ChartStyles.css';

Chart.register(LineElement, CategoryScale, LinearScale, PointElement, Legend, Tooltip);

const RiskTrendsChart = () => {
  const [riskData, setRiskData] = useState([]);
  const { t } = useTranslation();

  useEffect(() => {
    const token = localStorage.getItem('token');

    axios.get('/api/admin/risk-trends', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then(res => setRiskData(res.data.trend))
    .catch(err => console.error('Error fetching trend data:', err));
  }, []);

  const chartData = {
    labels: riskData.map(r => r.month),
    datasets: [
      {
        label: t('adminDashboard.diabetes_risk'),
        data: riskData.map(r => r.avgDiabetesRisk),
        borderColor: 'rgb(255, 99, 132)',
        fill: false,
        tension: 0.2,
      },
      {
        label: t('adminDashboard.bp_risk'),
        data: riskData.map(r => r.avgBPRisk),
        borderColor: 'rgb(54, 162, 235)',
        fill: false,
        tension: 0.2,
      },
      {
        label: t('adminDashboard.heart_risk'),
        data: riskData.map(r => r.avgHeartRisk),
        borderColor: 'rgb(255, 206, 86)',
        fill: false,
        tension: 0.2,
      },
    ]
  };

  return (
    <div style={{ marginTop: 40 }}>
      <h3>{t('adminDashboard.risk_trends_over_time')}</h3>
      <Line data={chartData} options={{ responsive: true }} />
    </div>
  );
};

export default RiskTrendsChart;
