import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';
import { useTranslation } from 'react-i18next';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const createBins = (data, binSize, min = 80, max = 200) => {
  const bins = {};
  for (let i = min; i <= max; i += binSize) {
    const label = `${i}-${i + binSize - 1}`;
    bins[label] = 0;
  }
  data.forEach(val => {
    const binStart = Math.floor(val / binSize) * binSize;
    const label = `${binStart}-${binStart + binSize - 1}`;
    if (bins[label] !== undefined) bins[label]++;
  });
  return bins;
};

const BPDistributionChart = () => {
  const [bpData, setBpData] = useState([]);
  const { t } = useTranslation();

  useEffect(() => {
    fetch('/api/admin/blood-pressure-distribution')
      .then(res => res.json())
      .then(setBpData)
      .catch(err => console.error('Failed to fetch BP data:', err));
  }, []);

  const systolic = bpData.map(d => d.systolic);
  const diastolic = bpData.map(d => d.diastolic);

  const binSize = 10;
  const systolicBins = createBins(systolic, binSize);
  const diastolicBins = createBins(diastolic, binSize);
  const labels = Object.keys(systolicBins);

  const chartData = {
    labels,
    datasets: [
      {
        label: t('adminDashboard.systolic_bp'),
        data: labels.map(label => systolicBins[label] || 0),
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
      },
      {
        label: t('adminDashboard.diastolic_bp'),
        data: labels.map(label => diastolicBins[label] || 0),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: {
        display: true,
        text: t('adminDashboard.bp_distribution_subtitle'),
      },
    },
    scales: {
      x: { stacked: true },
      y: {
        stacked: true,
        beginAtZero: true,
        title: {
          display: true,
          text: t('adminDashboard.number_of_records'),
        },
      },
    },
  };

  return (
    <div className="card bg-white shadow-md p-4 rounded-xl my-6">
      <h3 className="text-lg font-semibold mb-3">{t('adminDashboard.bp_distribution_title')}</h3>
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default BPDistributionChart;
