import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import ChartErrorBoundary from './ChartErrorBoundary';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const SmokingAlcoholRiskChart = () => {
  const [riskByHabits, setRiskByHabits] = useState([]);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchRisk = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/admin/risk-by-smoking-alcohol', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setRiskByHabits(res.data);
      } catch (err) {
        console.error('Error fetching Smoking/Alcohol risk data:', err);
      }
    };
    fetchRisk();
  }, []);

  if (!riskByHabits.length) return null;

  return (
    <ChartErrorBoundary fallback={t('adminDashboard.chart_error_smoking_alcohol')}>
      <div className="form-chart" style={{ marginTop: 30 }}>
        <h3>{t('adminDashboard.risk_by_smoking_alcohol')}</h3>
        <Bar
          data={{
            labels: riskByHabits.map(item => item.group),
            datasets: [
              {
                label: t('adminDashboard.diabetes_risk'),
                data: riskByHabits.map(item => item.diabetes),
                backgroundColor: 'rgba(255, 99, 132, 0.7)',
                stack: 'stack1',
              },
              {
                label: t('adminDashboard.bp_risk'),
                data: riskByHabits.map(item => item.bp),
                backgroundColor: 'rgba(54, 162, 235, 0.7)',
                stack: 'stack1',
              },
              {
                label: t('adminDashboard.heart_risk'),
                data: riskByHabits.map(item => item.heart),
                backgroundColor: 'rgba(255, 206, 86, 0.7)',
                stack: 'stack1',
              },
            ]
          }}
          options={{
            responsive: true,
            plugins: {
              tooltip: {
                callbacks: {
                  label: ctx => `${ctx.dataset.label}: ${(ctx.raw * 100).toFixed(1)}%`
                }
              }
            },
            scales: {
              y: {
                stacked: true,
                beginAtZero: true,
                max: 3,
                ticks: {
                  callback: val => `${(val / 3 * 100).toFixed(0)}%`
                }
              },
              x: {
                stacked: true
              }
            }
          }}
        />
      </div>
    </ChartErrorBoundary>
  );
};

export default SmokingAlcoholRiskChart;
