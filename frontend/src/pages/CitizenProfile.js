import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import '../styles/doctorProfile.css'; // Reuse same CSS

const CitizenProfile = () => {
  const { user, token } = useAuth();
  const { t } = useTranslation();

  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({});
  const [editing, setEditing] = useState(false);
  const [idFile, setIdFile] = useState(null);

  useEffect(() => {
    if (!user || !user._id) return;

    const fetchProfile = async () => {
      try {
        const res = await axios.get(`/api/user/${user._id}`, {
          headers: { Authorization: `Bearer ${token}` },
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
      const res = await axios.put(`/api/user/citizen/update/${user._id}`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert(t('cddash.profile_updated'));
      setProfile(res.data);
      setEditing(false);
    } catch (err) {
      alert(t('cddash.profile_update_failed'));
    }
  };

  const handleUpload = async () => {
    const formData = new FormData();
    if (idFile) formData.append('idProof', idFile);

    try {
      const res = await axios.post(`/api/user/upload/${user._id}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert(t('cddash.document_uploaded'));
      setProfile(res.data);
    } catch (err) {
      alert(t('cddash.document_upload_failed'));
    }
  };

  if (!profile) return <p>{t('cddash.loading_profile')}</p>;

  return (
    <div className="doctor-profile">
      <h2 className="profile-title">{t('cddash.citizen_profile')}</h2>
      <div className="header">
        <div className="avatar">{profile.fullName?.charAt(0)}</div>
      </div>

      {editing ? (
        <div className="edit-section">
          <div className="form-field">
            <label>{t('cddash.full_name')}</label>
            <input name="fullName" value={form.fullName || ''} onChange={handleChange} />
          </div>
          <div className="form-field">
            <label>{t('cddash.age')}</label>
            <input name="age" type="number" value={form.age || ''} onChange={handleChange} />
          </div>
          <div className="form-field">
            <label>{t('cddash.gender')}</label>
            <input name="gender" value={form.gender || ''} onChange={handleChange} />
          </div>
          <div className="form-field">
            <label>{t('cddash.contact_number')}</label>
            <input name="contactNumber" value={form.contactNumber || ''} onChange={handleChange} />
          </div>
          <div className="form-field">
            <label>{t('cddash.upload_id_proof')}</label>
            <input type="file" onChange={(e) => setIdFile(e.target.files[0])} />
          </div>

          <div className="button-group">
            <button onClick={handleUpdate}>💾 {t('cddash.save')}</button>
            <button onClick={handleUpload}>📤 {t('cddash.upload')}</button>
            <button onClick={() => setEditing(false)} className="cancel-btn">❌ {t('cddash.cancel')}</button>
          </div>
        </div>
      ) : (
        <div className="info-section">
          <p><strong>{t('cddash.full_name')}:</strong> {profile.fullName}</p>
          <p><strong>{t('cddash.email')}:</strong> {profile.email}</p>
          <p><strong>{t('cddash.age')}:</strong> {profile.age}</p>
          <p><strong>{t('cddash.gender')}:</strong> {profile.gender}</p>
          <p><strong>{t('cddash.contact_number')}:</strong> {profile.contactNumber}</p>
          {profile.idProof && (
            <p>
              <a href={`http://localhost:5000${profile.idProof}`} target="_blank" rel="noreferrer">
                🪪 {t('cddash.view_id_proof')}
              </a>
            </p>
          )}
          <button onClick={() => setEditing(true)}>✏️ {t('cddash.edit')}</button>
        </div>
      )}
    </div>
  );
};

export default CitizenProfile;
