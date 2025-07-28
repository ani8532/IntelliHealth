import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import '../styles/DoctorPrescriptionForm.css';
const DoctorPrescriptionForm = () => {
  const { user, token } = useAuth();
  const { t } = useTranslation();

  const [citizens, setCitizens] = useState([]);
  const [selectedCitizen, setSelectedCitizen] = useState(null);
  const [notes, setNotes] = useState('');
  const [tests, setTests] = useState('');
  const [file, setFile] = useState(null);
  const [success, setSuccess] = useState('');
  const [sourceType, setSourceType] = useState('referral');
  const [showHistory, setShowHistory] = useState(false);
  const [prescriptions, setPrescriptions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 5;

  useEffect(() => {
    if (!user || !token) return;
    const fetchCitizens = async () => {
      try {
        const res = await axios.get(`/api/referral/citizens?doctorId=${user._id}&type=${sourceType}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCitizens(res.data);
      } catch {
        alert(t('dr.fetch_citizens_error'));
      }
    };
    fetchCitizens();
  }, [user, token, sourceType, t]);

  const handleSubmit = async () => {
    if (!selectedCitizen) return alert(t('dr.select_citizen_alert'));
    const formData = new FormData();
    formData.append('citizenId', selectedCitizen._id);
    formData.append('citizenName', selectedCitizen.name);
    formData.append('doctorId', user._id);
    formData.append('doctorName', user.fullName);
    formData.append('notes', notes);
    formData.append('prescribedTests', JSON.stringify(tests.split(',').map(t => t.trim())));
    if (file) formData.append('prescriptionFile', file);

    try {
      await axios.post('/api/prescription/add', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess(t('prescription_success'));
      setNotes('');
      setTests('');
      setFile(null);
      setSelectedCitizen(null);
    } catch {
      alert(t('prescription_error'));
    }
  };

  const fetchPrescribedHistory = async () => {
    try {
      const res = await axios.get(`/api/prescription/doctor/${user._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPrescriptions(res.data);
      setShowHistory(true);
      setPage(1);
    } catch {
      alert(t('history_fetch_error'));
    }
  };

  const filteredPrescriptions = prescriptions.filter(p =>
    p.citizenName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const paginated = filteredPrescriptions.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(filteredPrescriptions.length / perPage);

  return (
    <div className="prescription-container">
      

      <h3>{t('dr.write_prescription')}</h3>

      <label>{t('dr.select_source')}</label>
      <select value={sourceType} onChange={(e) => setSourceType(e.target.value)}>
        <option value="referral">{t('dr.source_referral')}</option>
        <option value="direct">{t('dr.source_direct')}</option>
      </select>

      <label>{t('dr.select_citizen')}</label>
      <select
        value={selectedCitizen?._id || ''}
        onChange={(e) => setSelectedCitizen(citizens.find(c => c._id === e.target.value))}
      >
        <option value="">{t('dr.select_citizen_placeholder')}</option>
        {citizens.map(c => (
          <option key={c._id} value={c._id}>{c.name}</option>
        ))}
      </select>

      <textarea
        placeholder={t('dr.notes_placeholder')}
        value={notes}
        onChange={e => setNotes(e.target.value)}
        rows={4}
      />
      <input
        type="text"
        placeholder={t('dr.tests_placeholder')}
        value={tests}
        onChange={e => setTests(e.target.value)}
      />
      <input type="file" onChange={e => setFile(e.target.files[0])} />

      <div>
        <button onClick={handleSubmit}>{t('dr.submit_btn')}</button>
        <button onClick={fetchPrescribedHistory}>{t('dr.history_btn')}</button>
      </div>

      {success && <p className="success">{success}</p>}

      {showHistory && (
        <div className="history-box">
          <h4>{t('dr.history_title')}</h4>

          <input
            className="search-bar"
            type="text"
            placeholder={t('dr.search_placeholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          {paginated.length === 0 ? (
            <p>{t('dr.no_prescriptions')}</p>
          ) : (
            paginated.map(p => (
              <div className="history-item" key={p._id}>
                <strong>{t('dr.citizen')}:</strong> {p.citizenName} <br />
                <strong>{t('dr.date')}:</strong> {new Date(p.createdAt).toLocaleDateString()} <br />
                <strong>{t('dr.notes')}:</strong> {p.notes} <br />
                <strong>{t('dr.tests')}:</strong> {p.prescribedTests?.join(', ')} <br />
                {p.prescriptionFile && (
                  <a href={p.prescriptionFile} target="_blank" rel="noopener noreferrer">{t('dr.view_file')}</a>
                )}
              </div>
            ))
          )}

          {totalPages > 1 && (
            <div className="pagination">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>{t('dr.prev')}</button>
              <span>{t('dr.page')} {page} {t('dr.of')} {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>{t('dr.next')}</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DoctorPrescriptionForm;
