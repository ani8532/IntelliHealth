import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Bell } from 'lucide-react';
import '../styles/DoctorDashboard.css';
import DoctorProfile from './DoctorProfile';
import { useTranslation } from 'react-i18next';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer, ComposedChart
} from 'recharts';

const COLORS = ['#00C49F', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#a4de6c', '#d0ed57'];

const DoctorDashboard = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [stats, setStats] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [lineChartData, setLineChartData] = useState([]);
  const [referralTypeData, setReferralTypeData] = useState([]);
  const [citizenPrescriptionData, setCitizenPrescriptionData] = useState([]);
  const [referralSourceData, setReferralSourceData] = useState([]);
  const [testFrequencyData, setTestFrequencyData] = useState([]);

  useEffect(() => {
    if (!user || !token) return;
    const fetchStats = async () => {
      try {
        const res = await axios.get(`/api/doctors/dashboard/${user._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setStats([
          { title: t('dr.total_referrals'), value: res.data.totalReferrals },
          { title: t('dr.prescriptions_given'), value: res.data.totalPrescriptions },
          { title: t('dr.pending_consults'), value: res.data.pendingConsults }
        ]);

        setChartData(res.data.chartData);
        setPieData(res.data.pieData);
        setLineChartData(res.data.lineChartData);
        setReferralTypeData(res.data.referralTypeData);
        setCitizenPrescriptionData(res.data.citizenPrescriptionData);
        setReferralSourceData(res.data.referralSourceData);
        setTestFrequencyData(res.data.testFrequencyData);
      } catch (err) {
        console.error('Error fetching doctor dashboard stats:', err);
      }
    };

    fetchStats();
  }, [user, token, t]);

  const renderPie = (data, titleKey) => (
    <div className="chart-section">
      <h3>{t(titleKey)}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={100}
            dataKey="count"
            nameKey="name"
            label={({ name, value }) => `${name}: ${value}`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );

  return (
    <div className="dashboard-grid">
      <div className="sidebar">
        <div className="profile-header">
          <h3>{t('dr.doctor_panel')}</h3>
        </div>
        <DoctorProfile />
      </div>

      <div className="main-content">
        <h2>{t('dr.doctor_dashboard')}</h2>

        <div className="stat-boxes">
          {stats.map((item, idx) => (
            <div key={idx} className="stat-card">
              <h4>{item.title}</h4>
              <p>{item.value}</p>
            </div>
          ))}
        </div>

        <div className="chart-grid">
          {/* Monthly Referrals & Prescriptions */}
          <div className="chart-section">
            <h3>{t('dr.monthly_referrals_prescriptions')}</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="referrals" stackId="a" fill="#8884d8" name={t('dr.referrals')} />
                <Bar dataKey="prescriptions" stackId="a" fill="#82ca9d" name={t('dr.prescriptions')} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Daily Confirmed Consultations */}
          <div className="chart-section">
            <h3>{t('dr.daily_consultations')}</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={lineChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#ff7300"
                  strokeWidth={2}
                  label={{ position: 'top' }}
                  name={t('dr.consultations')}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Charts */}
          {renderPie(pieData, 'consultation_ratio')}
          {renderPie(referralTypeData, 'referral_type')}
          {renderPie(referralSourceData, 'referral_source')}

          {/* Prescriptions per Citizen - Horizontal Chart */}
          <div className="chart-section">
            <h3>{t('dr.prescriptions_per_citizen')}</h3>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={citizenPrescriptionData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" barSize={40} fill="#00C49F" name={t('dr.prescriptions')} />
                <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={2} dot={{ r: 4 }} name={t('trend')} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Test Frequency */}
          <div className="chart-section">
            <h3>{t('dr.test_frequency')}</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={testFrequencyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="test" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#ffc658" name={t('dr.orders')} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="actions">
          <button onClick={() => navigate('/doctor/notifications')}>
            <Bell size={18} style={{ marginRight: '6px' }} /> {t('notifications')}
          </button>
          <button onClick={() => navigate('/doctor/referrals')}>👨‍⚕️ {t('dr.referred_patients')}</button>
          <button onClick={() => navigate('/doctor/prescribe')}>📝 {t('dr.write_prescription')}</button>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
