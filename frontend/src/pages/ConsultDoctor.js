import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/ConsultDoctor.css';
import { useTranslation } from 'react-i18next';

const ConsultDoctor = () => {
  const { t } = useTranslation();

  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [message, setMessage] = useState('');
  const [search, setSearch] = useState('');
  const [consultType, setConsultType] = useState('Online');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [loading, setLoading] = useState(false);

  const timeSlots = ['10:00 AM', '2:00 PM', '6:00 PM'];

  const generateNextFiveDays = () => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 5; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      days.push(date.toISOString().split('T')[0]);
    }
    return days;
  };

  const dateOptions = generateNextFiveDays();

  const fetchDoctors = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/doctors/verified');
      setDoctors(res.data);
      setFilteredDoctors(res.data);
    } catch {
      alert(t('dr.fetch_doctors_failed'));
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearch(query);
    const filtered = doctors.filter(doc =>
      doc.fullName.toLowerCase().includes(query) ||
      doc.specialization.toLowerCase().includes(query) ||
      doc.hospital.toLowerCase().includes(query)
    );
    setFilteredDoctors(filtered);
  };

  const handleConsult = async () => {
    if (!selectedDoctor || !selectedDate || !selectedTime || !consultType) {
      return alert(t('fill_all_fields'));
    }

    const report = JSON.parse(localStorage.getItem('latestReport'));
    const citizen = JSON.parse(localStorage.getItem('citizenInfo'));
    const token = localStorage.getItem('token');

    if (!citizen || !citizen._id || !citizen.fullName) {
      return alert(t('dr.missing_user_info'));
    }

    if (!token) {
      return alert(t('dr.auth_token_missing'));
    }

    setLoading(true);
    try {
      await axios.post(
        'http://localhost:5000/api/referral/refer',
        {
          citizenName: citizen.fullName,
          citizenId: citizen._id,
          doctorId: selectedDoctor._id,
          doctorName: selectedDoctor.fullName,
          referredBy: 'self',
          type: consultType,
          report: report?.summary || '',
          appointmentDate: selectedDate,
          appointmentTime: selectedTime
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage(
        t('dr.consult_success_message', {
          type: consultType,
          date: selectedDate,
          time: selectedTime
        })
      );

      setSelectedDoctor(null);
      setSelectedDate('');
      setSelectedTime('');
      setConsultType('Online');
    } catch (err) {
      console.error('Consultation submission failed:', err);
      alert(t('dr.consult_submit_failed'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  return (
    <div className="consult-container">
      <h2>{t('dr.available_doctors')}</h2>

      <input
        type="text"
        className="doctor-search"
        placeholder={t('dr.search_placeholder')}
        value={search}
        onChange={handleSearch}
      />

      <div className="doctor-list">
        {filteredDoctors.map(doc => (
          <div
            key={doc._id}
            className={`doctor-card ${selectedDoctor?._id === doc._id ? 'selected' : ''}`}
            onClick={() => setSelectedDoctor(doc)}
          >
            <input
              type="radio"
              name="selectDoctor"
              checked={selectedDoctor?._id === doc._id}
              onChange={() => setSelectedDoctor(doc)}
            />
            <div className="avatar-info">
              <div className="doctor-avatar">{doc.fullName?.charAt(0).toUpperCase()}</div>
              <div className="doctor-details">
                <h4>{doc.fullName}</h4>
                <hr />
                <p><strong>{t('dr.specialization')}:</strong> {doc.specialization}</p>
                <p><strong>{t('dr.hospital')}:</strong> {doc.hospital}</p>
                <p><strong>{t('dr.registration_number')}:</strong> {doc.registrationNumber}</p>
                <p><strong>{t('dr.email')}:</strong> {doc.email}</p>
                <p><strong>{t('dr.contact')}:</strong> {doc.contactNumber}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedDoctor && (
        <div className="consult-options">
          <div className="dropdown-section">
            <label>{t('dr.select_consult_type')}:</label>
            <select value={consultType} onChange={(e) => setConsultType(e.target.value)}>
              <option value="Online">{t('dr.online')}</option>
              <option value="Offline">{t('dr.offline')}</option>
            </select>
          </div>

          <div className="dropdown-section">
            <label>{t('dr.select_date')}:</label>
            <select value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}>
              <option value="">{t('dr.select_date_option')}</option>
              {dateOptions.map(date => (
                <option key={date} value={date}>
                  {new Date(date).toDateString()}
                </option>
              ))}
            </select>
          </div>

          <div className="dropdown-section">
            <label>{t('dr.select_time')}:</label>
            <select value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)}>
              <option value="">{t('dr.select_time_option')}</option>
              {timeSlots.map((t, idx) => (
                <option key={idx} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <button onClick={handleConsult} className="consult-button" disabled={loading}>
            {loading ? t('dr.submitting') : t('dr.submit_request')}
          </button>
        </div>
      )}

      {message && <p className="consult-message">{message}</p>}
    </div>
  );
};

export default ConsultDoctor;
