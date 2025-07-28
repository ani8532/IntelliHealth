import React, { useState, useEffect } from 'react';
import { Scatter } from 'react-chartjs-2';
import { Chart as ChartJS, Tooltip, Legend, LinearScale, PointElement } from 'chart.js';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

ChartJS.register(LinearScale, PointElement, Tooltip, Legend);

// Hook to detect window size
const useWindowSize = () => {
  const [size, setSize] = useState([window.innerWidth, window.innerHeight]);
  useEffect(() => {
    const handleResize = () => setSize([window.innerWidth, window.innerHeight]);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return size;
};

const BmiRiskScatterPage = () => {
  const { t } = useTranslation();
  const [scatterData, setScatterData] = useState([]);
  const [selectedDisease, setSelectedDisease] = useState('diabetes');
  const [width] = useWindowSize();

  const diseaseFieldMap = {
    diabetes: 'diabetesRisk',
    bp: 'bpRisk',
    heart: 'heartRisk',
  };

  useEffect(() => {
    axios.get('/api/admin/combined-risk-data')
      .then(res => setScatterData(res.data))
      .catch(console.error);
  }, []);

  const chartData = {
    datasets: ['Lifestyle', 'Medical'].map((type, i) => ({
      label: `${t(`adminDashboard.${type.toLowerCase()}_risk`)}`,
      data: scatterData
        .filter(d => d.type === type)
        .map(d => ({
          x: d.bmi,
          y: (d[diseaseFieldMap[selectedDisease]] || 0) * 100,
        })),
      backgroundColor: ['rgba(75,192,192,1)', 'rgba(255,99,132,1)'][i],
      pointRadius: 4,
    })),
  };

  const isMobile = width < 768;

  const containerStyle = {
    width: isMobile ? '100%' : '920px',
    margin: '20px auto',
    backgroundColor: '#fff',
    borderRadius: '12px',
    boxShadow: '0 3px 10px rgba(0, 0, 0, 0.1)',
    padding: '20px',
  };

  const chartContainerStyle = {
    width: '100%',
    height: isMobile ? '300px' : '440px',
    position: 'relative',
  };

  return (
    <div style={containerStyle}>
      <h2 style={{
        fontSize: '22px',
        fontWeight: 'bold',
        marginBottom: '16px',
        textAlign: 'center'
      }}>
        {t('adminDashboard.bmi_vs_risk_scatter')}
      </h2>

      <div style={{ marginBottom: '16px', textAlign: 'center' }}>
        <label style={{ marginRight: '10px', fontWeight: '500' }}>
          {t('adminDashboard.select_disease')}:
        </label>
        <select
          value={selectedDisease}
          onChange={e => setSelectedDisease(e.target.value)}
          style={{
            padding: '6px 10px',
            borderRadius: '6px',
            border: '1px solid #ccc',
            fontSize: '14px',
          }}
        >
          {['diabetes', 'bp', 'heart'].map(d => (
            <option key={d} value={d}>{t(`adminDashboard.${d}`)}</option>
          ))}
        </select>
      </div>

      <div style={chartContainerStyle}>
        <Scatter
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { position: 'top' },
              tooltip: {
                callbacks: {
                  label: ctx => `BMI: ${ctx.raw.x}, ${t('adminDashboard.risk')}: ${ctx.raw.y.toFixed(1)}%`,
                },
              },
            },
            scales: {
              x: {
                title: { display: true, text: 'BMI' },
                min: 10,
                max: 50,
              },
              y: {
                title: { display: true, text: t('adminDashboard.risk_percent') },
                min: 0,
                max: 100,
                ticks: {
                  stepSize: 10,
                  callback: val => `${val}%`,
                },
              },
            },
          }}
        />
      </div>
    </div>
  );
};

export default BmiRiskScatterPage;
