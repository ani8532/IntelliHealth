import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import '../styles/DoctorReferralsList.css';

const DoctorReferralsList = () => {
  const { user, token } = useAuth();
  const { t } = useTranslation();
  const [referrals, setReferrals] = useState([]);

  const fetchReferrals = async () => {
    try {
      const res = await axios.get(`/api/referral/doctor/${user._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReferrals(res.data);
    } catch (err) {
      console.error(t('dr.doctorReferrals.error_fetching'), err);
    }
  };

  useEffect(() => {
    if (user && user._id) fetchReferrals();
  }, [user, token]);

  const handleConfirm = async (referralId, isOnline, alreadySent) => {
    try {
      await axios.put(`/api/referral/confirm/${referralId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert(
        isOnline
          ? alreadySent
            ? t('dr.doctorReferrals.link_resent')
            : t('dr.doctorReferrals.link_sent')
          : t('dr.doctorReferrals.offline_confirmed')
      );

      fetchReferrals();
    } catch (err) {
      console.error(t('dr.doctorReferrals.confirm_failed'), err);
      alert(t('dr.doctorReferrals.confirm_error'));
    }
  };

  return (
    <div className="referral-list-container">
      <h2>{t('dr.doctorReferrals.heading')}</h2>

      {referrals.length === 0 ? (
        <p>{t('dr.doctorReferrals.no_referrals')}</p>
      ) : (
        <table className="referral-table">
          <thead>
            <tr>
              <th>{t('dr.doctorReferrals.citizen')}</th>
              <th>{t('dr.doctorReferrals.referred_by')}</th>
              <th>{t('dr.doctorReferrals.type')}</th>
              <th>{t('dr.doctorReferrals.date')}</th>
              <th>{t('dr.doctorReferrals.time')}</th>
              <th>{t('dr.doctorReferrals.report')}</th>
              <th>{t('dr.doctorReferrals.video_link')}</th>
              <th>{t('dr.doctorReferrals.action')}</th>
            </tr>
          </thead>
          <tbody>
            {referrals.map((ref) => (
              <tr key={ref._id}>
                <td data-label={t('dr.doctorReferrals.citizen')}>{ref.citizenName}</td>
                <td data-label={t('dr.doctorReferrals.referred_by')}>{ref.referredBy}</td>
                <td data-label={t('dr.doctorReferrals.type')}>{ref.type}</td>
                <td data-label={t('dr.doctorReferrals.date')}>{ref.appointmentDate || 'N/A'}</td>
                <td data-label={t('dr.doctorReferrals.time')}>{ref.appointmentTime || 'N/A'}</td>
                <td data-label={t('dr.doctorReferrals.report')}>
                  {ref.report ? (
                    <a
                      href={`http://localhost:5000${ref.report.replace(/\\/g, '/')}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {t('dr.doctorReferrals.view')}
                    </a>
                  ) : (
                    'N/A'
                  )}
                </td>
                <td data-label={t('dr.doctorReferrals.video_link')}>
                  {ref.type === 'Online' && ref.videoLink ? (
                    <a href={ref.videoLink} target="_blank" rel="noreferrer">
                      {t('dr.doctorReferrals.join_call')}
                    </a>
                  ) : (
                    '—'
                  )}
                </td>
                <td data-label={t('dr.doctorReferrals.action')}>
                  {ref.consultationConfirmed ? (
                    ref.type === 'Online' && ref.videoLink ? (
                      <button
                        onClick={() => handleConfirm(ref._id, true, true)}
                        className="resend-btn"
                      >
                        {t('dr.doctorReferrals.resend_link')}
                      </button>
                    ) : (
                      t('dr.doctorReferrals.confirmed')
                    )
                  ) : (
                    <button
                      onClick={() => handleConfirm(ref._id, ref.type === 'Online', false)}
                      className="confirm-btn"
                    >
                      {t('dr.doctorReferrals.confirm')}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default DoctorReferralsList;
