import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import '../styles/profile.css';

const HealthWorkerProfile = ({ user: propUser }) => {
  const { token } = useAuth();
  const { t } = useTranslation();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({});
  const [degreeFile, setDegreeFile] = useState(null);
  const [idFile, setIdFile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const user = propUser || JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (!user || !user._id) return;

    const fetchProfile = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/user/${user._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfile(res.data);
        setForm(res.data);
      } catch (err) {
        console.error('Error fetching profile:', err);
      }
    };

    fetchProfile();
  }, [user, token]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleProfileUpdate = async () => {
    try {
      const res = await axios.put(
        `http://localhost:5000/api/user/update/${user._id}`,
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(t('hwr.healthWorker.profileUpdated'));
      setProfile(res.data);
      setIsEditing(false);
    } catch (err) {
      alert(t('hwr.healthWorker.profileUpdateFailed'));
      console.error(err);
    }
  };

  const handleUpload = async () => {
    const formData = new FormData();
    if (degreeFile) formData.append('degreeCertificate', degreeFile);
    if (idFile) formData.append('idProof', idFile);

    try {
      const res = await axios.post(
        `http://localhost:5000/api/user/upload/${user._id}`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(t('hwr.healthWorker.documentsUploaded'));
      setProfile(res.data);
    } catch (err) {
      alert(t('hwr.healthWorker.uploadFailed'));
      console.error(err);
    }
  };

  if (!user || !user._id) return <p>{t('hwr.healthWorker.userUnavailable')}</p>;
  if (!profile) return <p>{t('hwr.healthWorker.loadingProfile')}</p>;

  return (
    <div className="profile-container">
      <h2>{t('hwr.healthWorker.profileTitle')}</h2>
      <div className="profile-avatar">
        {profile?.fullName ? profile.fullName.charAt(0).toUpperCase() : 'U'}
      </div>

      {isEditing ? (
        <>
          <input name="fullName" value={form.fullName || ''} onChange={handleChange} placeholder={t('hwr.healthWorker.fullName')} />
          <input name="contactNumber" value={form.contactNumber || ''} onChange={handleChange} placeholder={t('hwr.healthWorker.contactNumber')} />
          <input name="employeeId" value={form.employeeId || ''} onChange={handleChange} placeholder={t('hwr.healthWorker.employeeId')} />
          <input name="role" value={form.role || ''} onChange={handleChange} placeholder={t('hwr.healthWorker.role')} />
          <input name="institution" value={form.institution || ''} onChange={handleChange} placeholder={t('hwr.healthWorker.institution')} />
          <input name="workState" value={form.workState || ''} onChange={handleChange} placeholder={t('hwr.healthWorker.workState')} />
          <div className="button-group">
            <button onClick={handleProfileUpdate}>{t('hwr.healthWorker.saveChanges')}</button>
            <button className="cancel-btn" onClick={() => setIsEditing(false)}>{t('hwr.healthWorker.cancel')}</button>
          </div>
        </>
      ) : (
        <>
          <p><strong>{t('hwr.healthWorker.name')}:</strong> {profile.fullName}</p>
          <p><strong>{t('hwr.healthWorker.email')}:</strong> {profile.email}</p>
          <p><strong>{t('hwr.healthWorker.contact')}:</strong> {profile.contactNumber}</p>
          <p><strong>{t('hwr.healthWorker.institution')}:</strong> {profile.institution}</p>
          <p><strong>{t('hwr.healthWorker.workState')}:</strong> {profile.workState}</p>
          <p><strong>{t('hwr.healthWorker.role')}:</strong> {profile.role}</p>
          <p><strong>{t('hwr.healthWorker.employeeId')}:</strong> {profile.employeeId}</p>
          <button onClick={() => setIsEditing(true)}>{t('hwr.healthWorker.editProfile')}</button>
        </>
      )}

      <p><strong>{t('hwr.healthWorker.verified')}:</strong> {profile.isVerified ? '✅ ' + t('healthWorker.verifiedYes') : '⏳ ' + t('healthWorker.verifiedNo')}</p>

      <h3>{t('hwr.healthWorker.uploadDocuments')}</h3>
      <p>{t('hwr.healthWorker.uploadDegree')}</p>
      <input type="file" onChange={e => setDegreeFile(e.target.files[0])} />
      <p>{t('hwr.healthWorker.uploadIdProof')}</p>
      <input type="file" onChange={e => setIdFile(e.target.files[0])} />
      <button onClick={handleUpload}>{t('hwr.healthWorker.upload')}</button>

      {profile.degreeCertificate && (
        <p>
          <a
            href={`http://localhost:5000${profile.degreeCertificate.replace(/\\/g, '/')}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t('hwr.healthWorker.viewDegree')}
          </a>
        </p>
      )}
      {profile.idProof && (
        <p>
          <a
            href={`http://localhost:5000${profile.idProof.replace(/\\/g, '/')}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t('hwr.healthWorker.viewId')}
          </a>
        </p>
      )}
    </div>
  );
};

export default HealthWorkerProfile;
