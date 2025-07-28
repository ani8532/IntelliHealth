import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { Bar, Pie, Line, Doughnut } from 'react-chartjs-2';
import { useNavigate } from 'react-router-dom';
import { BarChart2, Users, FileText } from 'lucide-react';
import '../styles/HealthWorkerDashboard.css';
import StatCard from '../components/ui/StatCard';
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  ArcElement,
  BarElement,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
);

const HealthWorkerDashboard = () => {
  const { user, token } = useAuth();
  const { t } = useTranslation();
  const [data, setData] = useState({});
  const [dist, setDist] = useState();
  const [line, setLine] = useState();
  const [follow, setFollow] = useState();
  const [refByDoc, setRefByDoc] = useState();
  const [stacked, setStacked] = useState();
  const navigate = useNavigate();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
  if (!user || !token) return;
  const fetchAll = async () => {
    try {
      const [dash, d1, d2, d3, d4, d5] = await Promise.all([
        axios.get(`/api/healthworker/dashboard`, { headers: { Authorization: `Bearer ${token}` } }),

        axios.get(`/api/healthworker/analytics/form-distribution`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`/api/healthworker/analytics/forms-over-time`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`/api/healthworker/analytics/followup-status`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`/api/healthworker/analytics/referrals-by-doctor`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`/api/healthworker/analytics/monthly-stacked`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      setData(dash.data.analytics);
      setDist(d1.data);
      setLine(d2.data);
      setFollow(d3.data);
      setRefByDoc(d4.data);
      setStacked(d5.data);
    } catch (err) {
      console.error(t('hwr.dashboard.error_fetch'), err);
    }
  };
  fetchAll();
}, [user, token, t]);
  if (!stacked) return <div className="loading">{t('hwr.common.loading')}</div>;

  const pieData = { labels: Object.keys(dist), datasets: [{ data: Object.values(dist), backgroundColor: ['#34d399', '#60a5fa'] }] };
  const lineData = { labels: line.labels, datasets: [{ label: t('hwr.dashboard.total_forms'), data: line.data, borderColor: '#f59e0b', fill: false }] };
  const doughnutData = { labels: Object.keys(follow), datasets: [{ data: Object.values(follow), backgroundColor: ['#fbbf24', '#34d399', '#f87171'] }] };
  const referralsData = { labels: refByDoc.labels, datasets: [{ label: t('hwr.dashboard.referrals'), data: refByDoc.data, backgroundColor: '#60a5fa' }] };
  const stackedData = {
    labels: stacked.labels,
    datasets: [
      { label: t('hwr.dashboard.lifestyle_forms'), data: stacked.data.map(d => d[0]), backgroundColor: '#34d399' },
      { label: t('hwr.dashboard.medical_forms'), data: stacked.data.map(d => d[1]), backgroundColor: '#60a5fa' },
      { label: t('hwr.dashboard.follow_ups'), data: stacked.data.map(d => d[2]), backgroundColor: '#f59e0b' }
    ]
  };

  const stackedOptions = { responsive: true, plugins: { legend: { position: 'top' } }, scales: { x: { stacked: true }, y: { stacked: true, beginAtZero: true } } };

  return (
    <div className="dashboard-fullpage">
      <aside className="sidebar">
        <button onClick={() => navigate('/health-worker/form-selection')}>{t('hwr.nav.add_entry')}</button>
        <button onClick={() => navigate('/health-worker/followup')}>{t('hwr.nav.follow_up')}</button>
        <button onClick={() => navigate('/health-worker/refer')}>{t('hwr.nav.refer_doctor')}</button>
        <button onClick={() => navigate('/health-worker/notifications')}>{t('hwr.nav.notifications')}</button>
        <button onClick={() => navigate('/health-worker/profile')}>{t('hwr.nav.profile')}</button>
      </aside>

      <main className="dashboard-content">
        <h2 className="dashboard-heading">{t('hwr.dashboard.title')}</h2>

        <div className="dashboard-vertical-stat-cards">
          <StatCard icon={<FileText size={24} />} label={t('hwr.dashboard.total_forms')} value={data.totalForms} />
          <StatCard icon={<BarChart2 size={24} />} label={t('hwr.dashboard.pending_followups')} value={data.followUpsPending} />
          <StatCard icon={<Users size={24} />} label={t('hwr.dashboard.unique_citizens')} value={data.totalCitizens} />
        </div>

        <div className="dashboard-chart-section">
          <div className="chart-block"><h3>{t('hwr.dashboard.form_distribution')}</h3><Pie data={pieData} /></div>
          <hr className="chart-divider" />
          <div className="chart-block"><h3>{t('hwr.dashboard.forms_over_time')}</h3><Line data={lineData} /></div>
          <hr className="chart-divider" />
          <div className="chart-block"><h3>{t('hwr.dashboard.follow_up_status')}</h3><Doughnut data={doughnutData} /></div>
          <hr className="chart-divider" />
          <div className="chart-block"><h3>{t('hwr.dashboard.referrals_by_doctor')}</h3><Bar data={referralsData} /></div>
          <hr className="chart-divider" />
          <div className="chart-block"><h3>{t('hwr.dashboard.monthly_submission_vs_followups')}</h3><Bar data={stackedData} options={stackedOptions} /></div>
        </div>
      </main>
    </div>
  );
};

export default HealthWorkerDashboard;
