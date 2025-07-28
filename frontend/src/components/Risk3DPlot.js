import React, { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import '../styles/ChartStyles.css';

const Risk3DPlot = () => {
  const [data, setData] = useState([]);
  const [riskType, setRiskType] = useState('diabetesRisk');
  const { t } = useTranslation();

  useEffect(() => {
    const fetchLabRiskData = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/admin/risk-3d-lab', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setData(res.data);
      } catch (err) {
        console.error('Failed to fetch 3D data:', err.response?.data || err.message);
      }
    };

    fetchLabRiskData();
  }, []);

  const filtered = data.filter(
    d => d.sugar != null && d.lipids != null && d[riskType] != null
  );

  return (
    <div className="form-chart" style={{ marginTop: 40 }}>
      <h3>{t('adminDashboard.risk_3d_plot')}</h3>
      <div style={{ marginBottom: 10 }}>
        <label style={{ marginRight: 10 }}>{t('adminDashboard.select_risk_type')}:</label>
        <select
          value={riskType}
          onChange={e => setRiskType(e.target.value)}
          style={{ padding: '5px 10px' }}
        >
          <option value="diabetesRisk">{t('adminDashboard.diabetes')}</option>
          <option value="bpRisk">{t('adminDashboard.bp')}</option>
          <option value="heartRisk">{t('adminDashboard.heart')}</option>
        </select>
      </div>

      <Plot
        data={[
          {
            x: filtered.map(d => d.sugar),
            y: filtered.map(d => d.lipids),
            z: filtered.map(d => d[riskType]),
            type: 'scatter3d',
            mode: 'markers',
            marker: {
              size: 4,
              color: filtered.map(d => d[riskType]),
              colorscale: 'Viridis',
              colorbar: { title: t('adminDashboard.risk_level') },
            },
            text: filtered.map(d =>
              `${t('adminDashboard.sugar')}: ${d.sugar}<br>${t('adminDashboard.lipids')}: ${d.lipids}<br>${t('adminDashboard.risk')}: ${d[riskType]}`
            ),
            hoverinfo: 'text'
          }
        ]}
        layout={{
          autosize: true,
          height: 500,
          title: `${t('adminDashboard.risk_vs_lab_title', { risk: t(`adminDashboard.${riskType}`) })}`,
          scene: {
            xaxis: { title: t('adminDashboard.lab_sugar') },
            yaxis: { title: t('adminDashboard.lab_lipids') },
            zaxis: { title: t('adminDashboard.risk_score') }
          }
        }}
      />
    </div>
  );
};

export default Risk3DPlot;
