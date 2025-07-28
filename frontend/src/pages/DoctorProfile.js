import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import '../styles/doctorProfile.css';

const DoctorProfile = () => {
  const { user, token } = useAuth();
  const { t } = useTranslation();

  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({});
  const [editing, setEditing] = useState(false);
  const [degreeFile, setDegreeFile] = useState(null);
  const [idFile, setIdFile] = useState(null);

  useEffect(() => {
    if (!user || !user._id) return;
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`/api/user/${user._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfile(res.data);
        setForm(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProfile();
  }, [user, token]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleUpdate = async () => {
    try {
      const res = await axios.put(`/api/user/doctor/update/${user._id}`, form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(t('dr.profile.updated'));
      setProfile(res.data);
      setEditing(false);
    } catch (err) {
      alert(t('dr.profile.update_failed'));
    }
  };

  const handleUpload = async () => {
    const formData = new FormData();
    if (degreeFile) formData.append('degreeCertificate', degreeFile);
    if (idFile) formData.append('idProof', idFile);

    try {
      const res = await axios.post(`/api/user/upload/${user._id}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(t('dr.profile.upload_success'));
      setProfile(res.data);
    } catch (err) {
      alert(t('dr.profile.upload_failed'));
    }
  };

  if (!profile) return <p>{t('dr.loading')}</p>;

  return (
    <div className="doctor-profile">
      <h2 className="profile-title">{t('dr.profile.title')}</h2>
      <div className="header">
        <div className="avatar">{profile.fullName?.charAt(0)}</div>
      </div>

      {editing ? (
        <div className="edit-section">
          <div className="form-field">
            <label>{t('form.full_name')}</label>
            <input name="fullName" value={form.fullName || ''} onChange={handleChange} />
          </div>
          <div className="form-field">
            <label>{t('dr.form.specialization')}</label>
            <input name="specialization" value={form.specialization || ''} onChange={handleChange} />
          </div>
          <div className="form-field">
            <label>{t('dr.form.registration_number')}</label>
            <input name="registrationNumber" value={form.registrationNumber || ''} onChange={handleChange} />
          </div>
          <div className="form-field">
            <label>{t('dr.form.hospital')}</label>
            <input name="hospital" value={form.hospital || ''} onChange={handleChange} />
          </div>
          <div className="form-field">
            <label>{t('dr.form.contact_number')}</label>
            <input name="contactNumber" value={form.contactNumber || ''} onChange={handleChange} />
          </div>
          <div className="form-field">
            <label>{t('dr.form.upload_degree')}</label>
            <input type="file" onChange={(e) => setDegreeFile(e.target.files[0])} />
          </div>
          <div className="form-field">
            <label>{t('dr.form.upload_id')}</label>
            <input type="file" onChange={(e) => setIdFile(e.target.files[0])} />
          </div>
          <div className="button-group">
            <button onClick={handleUpdate}>💾 {t('dr.buttons.save')}</button>
            <button onClick={handleUpload}>📤 {t('dr.buttons.upload')}</button>
            <button onClick={() => setEditing(false)} className="cancel-btn">❌ {t('buttons.cancel')}</button>
          </div>
        </div>
      ) : (
        <div className="info-section">
          <p><strong>{t('dr.form.full_name')}:</strong> {profile.fullName}</p>
          <p><strong>{t('dr.form.email')}:</strong> {profile.email}</p>
          <p><strong>{t('dr.form.specialization')}:</strong> {profile.specialization}</p>
          <p><strong>{t('dr.form.registration_number')}:</strong> {profile.registrationNumber}</p>
          <p><strong>{t('dr.form.hospital')}:</strong> {profile.hospital}</p>
          <p><strong>{t('dr.form.contact_number')}:</strong> {profile.contactNumber}</p>
          <p><strong>{t('dr.form.verified')}:</strong> {profile.isVerified ? t('form.yes') : t('form.pending')}</p>
          {profile.degreeCertificate && (
            <p><a href={`http://localhost:5000${profile.degreeCertificate}`} target="_blank" rel="noreferrer">🎓 {t('dr.form.view_degree')}</a></p>
          )}
          {profile.idProof && (
            <p><a href={`http://localhost:5000${profile.idProof}`} target="_blank" rel="noreferrer">🪪 {t('dr.form.view_id')}</a></p>
          )}
          <button onClick={() => setEditing(true)}>✏️ {t('dr.buttons.edit')}</button>
        </div>
      )}
    </div>
  );
};

export default DoctorProfile;
