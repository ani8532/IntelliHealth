import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/ReferDoctor.css';
import { useAuth } from '../context/AuthContext';
import ReferralHistory from './ReferralHistory';
import { useTranslation } from 'react-i18next';

const ReferToDoctorForHealthWorker = () => {
  const { t } = useTranslation();
  const { user, token } = useAuth();

  const [citizens, setCitizens] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedCitizen, setSelectedCitizen] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [consultType, setConsultType] = useState('Online');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [message, setMessage] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  const timeSlots = ['10:00 AM', '2:00 PM', '6:00 PM'];

  const generateNextFiveDays = () => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 5; i++) {
      const date = new Date();
      date.setDate(today.getDate() + i);
      days.push(date.toISOString().split('T')[0]);
    }
    return days;
  };

  const dateOptions = generateNextFiveDays();

  useEffect(() => {
    if (!user || !token) return;

    const fetchData = async () => {
      try {
        const [lifestyleRes, medicalRes] = await Promise.all([
          axios.get(`/api/lifestyle?submittedBy=${user.fullName}`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`/api/medical?submittedBy=${user.fullName}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        const lifestyle = lifestyleRes.data.map(entry => ({ ...entry, formType: 'Lifestyle' }));
        const medical = medicalRes.data.map(entry => ({ ...entry, formType: 'Medical' }));
        setCitizens([...lifestyle, ...medical]);

        const doctorsRes = await axios.get('/api/doctors/verified', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDoctors(doctorsRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        alert(t('refertodr.error_loading_data'));
      }
    };

    fetchData();
  }, [user, token, t]);

  const handleReferral = async () => {
    if (!selectedCitizen || !selectedDoctor || !selectedDate || !selectedTime) {
      alert(t('refertodr.select_all_fields'));
      return;
    }

    const payload = {
      citizenName: selectedCitizen.name,
      citizenId: selectedCitizen._id,
      doctorId: selectedDoctor._id,
      doctorName: selectedDoctor.fullName,
      referredBy: user.fullName,
      type: consultType,
      report: selectedCitizen.reportPath || null,
      appointmentDate: selectedDate,
      appointmentTime: selectedTime
    };

    try {
      await axios.post('/api/referral/refer', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessage(t('refertodr.success_message'));
      setSelectedCitizen(null);
      setSelectedDoctor(null);
      setSelectedDate('');
      setSelectedTime('');
    } catch (err) {
      console.error('Referral failed:', err);
      alert(t('refertodr.referral_failed'));
    }
  };

  if (!user || !token) {
    return <div className="loading">{t('refertodr.loading')}</div>;
  }

  return (
    <div className="consult-container">
      <h2>{t('refertodr.title')}</h2>

      {showHistory ? (
        <ReferralHistory />
      ) : (
        <>
          <div className="dropdown-section">
            <label>{t('refertodr.select_citizen')}:</label>
            <select value={selectedCitizen?._id || ''} onChange={(e) =>
              setSelectedCitizen(citizens.find(c => c._id === e.target.value))
            }>
              <option value="">{t('refertodr.select_citizen_placeholder')}</option>
              {citizens.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name} ({c.formType}) - {new Date(c.createdAt).toLocaleDateString()}
                </option>
              ))}
            </select>
          </div>

          <div className="dropdown-section">
            <label>{t('refertodr.select_doctor')}:</label>
            <select value={selectedDoctor?._id || ''} onChange={(e) =>
              setSelectedDoctor(doctors.find(d => d._id === e.target.value))
            }>
              <option value="">{t('refertodr.select_doctor_placeholder')}</option>
              {doctors.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.fullName} - {d.specialization} ({d.hospital})
                </option>
              ))}
            </select>
          </div>

          <div className="dropdown-section">
            <label>{t('refertodr.consultation_type')}:</label>
            <select value={consultType} onChange={(e) => setConsultType(e.target.value)}>
              <option value="Online">{t('refertodr.online')}</option>
              <option value="Offline">{t('refertodr.offline')}</option>
            </select>
          </div>

          <div className="dropdown-section">
            <label>{t('refertodr.select_date')}:</label>
            <select value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}>
              <option value="">{t('refertodr.select_date_placeholder')}</option>
              {dateOptions.map(date => (
                <option key={date} value={date}>
                  {new Date(date).toDateString()}
                </option>
              ))}
            </select>
          </div>

          <div className="dropdown-section">
            <label>{t('refertodr.select_time')}:</label>
            <select value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)}>
              <option value="">{t('refertodr.select_time_placeholder')}</option>
              {timeSlots.map((t, idx) => (
                <option key={idx} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <button onClick={handleReferral} className="consult-button">
            {t('refertodr.submit_button')}
          </button>

          {message && <p className="consult-message">{message}</p>}

          <div className="history-toggle">
            <button onClick={() => setShowHistory(true)} className="consult-button secondary">
              {t('refertodr.view_history')}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ReferToDoctorForHealthWorker;
