import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { HeatMapGrid } from 'react-grid-heatmap';
import { Card, CardContent } from './ui/card';
import { useTranslation } from 'react-i18next';

const CorrelationHeatmapPage = () => {
  const { t } = useTranslation();
  const [correlationMatrix, setCorrelationMatrix] = useState([]);
  const [labels, setLabels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');

    axios.get('/api/admin/risk-correlations', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        setCorrelationMatrix(res.data.matrix || []);
        setLabels(res.data.labels || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching correlation matrix:', err);
        setError(t('error_loading_correlation'));
        setLoading(false);
      });
  }, [t]);

  if (loading) return <div className="text-center text-lg p-6">{t('adminDashboard.loading_heatmap')}</div>;
  if (error) return <div className="text-center text-red-600 p-6">{error}</div>;
  if (!Array.isArray(correlationMatrix) || correlationMatrix.length === 0) {
    return <div className="text-center p-6">{t('adminDashboard.no_correlation_data')}</div>;
  }

  return (
    <div className="heatmap-page-container flex flex-col items-center justify-center px-4 py-8">
      <h2 className="text-2xl font-semibold text-center mb-6">{t('adminDashboard.correlation_heatmap')}</h2>
      <Card className="rounded-2xl shadow-lg w-full max-w-6xl">
        <CardContent className="flex justify-center items-center overflow-auto p-6">
          <div className="min-w-[600px]">
            <HeatMapGrid
              data={correlationMatrix}
              xLabels={labels}
              yLabels={labels}
              cellHeight="2.5rem"
              square
              cellStyle={(value) => ({
                background: `rgba(255, 0, 0, ${Math.abs(value)})`,
                color: '#000',
                fontSize: '12px',
                border: '1px solid #fff',
              })}
              xLabelsStyle={() => ({
                transform: 'rotate(-45deg)',
                textAlign: 'right',
                fontSize: '11px',
                whiteSpace: 'nowrap',
              })}
              yLabelsStyle={() => ({
                textAlign: 'right',
                fontSize: '11px',
              })}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CorrelationHeatmapPage;
