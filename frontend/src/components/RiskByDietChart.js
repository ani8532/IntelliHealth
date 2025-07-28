import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { useTranslation } from 'react-i18next';
import ChartErrorBoundary from './ChartErrorBoundary';
import axios from 'axios';

const RiskByDietChart = () => {
  const { t } = useTranslation();
  const [riskByDiet, setRiskByDiet] = useState(null);

  useEffect(() => {
    const fetchRiskByDiet = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/admin/risk-by-diet', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setRiskByDiet(res.data);
      } catch (error) {
        console.error('Error fetching Risk by Diet:', error);
      }
    };

    fetchRiskByDiet();
  }, []);

  if (!riskByDiet?.riskByDiet?.length) return null;

  const labels = riskByDiet.riskByDiet.map(item => item.dietType || 'Unknown');
  const dataValues = riskByDiet.riskByDiet.map(item => item.avgRisk);

  const chartData = {
    labels,
    datasets: [
      {
        label: t('adminDashboard.average_risk'),
        data: dataValues,
        backgroundColor: 'rgba(255, 159, 64, 0.6)',
        borderColor: 'rgba(255, 159, 64, 1)',
        borderWidth: 1,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: ctx => `Risk: ${(ctx.raw * 100).toFixed(1)}%`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 1,
        ticks: {
          callback: value => `${(value * 100).toFixed(0)}%`
        }
      }
    }
  };

  return (
    <ChartErrorBoundary fallback="Could not render Risk by Diet chart.">
      <div style={{
        background: '#fff',
        padding: '1.5rem',
        margin: '1rem auto',
        borderRadius: '16px',
        boxShadow: '0 0 10px rgba(0,0,0,0.1)',
        width: '90%',
        maxWidth: '700px'
      }}>
        <h3 style={{
          fontSize: '1.2rem',
          marginBottom: '1rem',
          textAlign: 'center',
          color: '#333'
        }}>
          {t('adminDashboard.average_risk_by_diet')}
        </h3>
        <Bar data={chartData} options={chartOptions} />
      </div>
    </ChartErrorBoundary>
  );
};

export default RiskByDietChart;
