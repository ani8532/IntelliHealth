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
      console.error(t('doctorReferrals.error_fetching'), err);
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
            ? t('doctorReferrals.link_resent')
            : t('doctorReferrals.link_sent')
          : t('doctorReferrals.offline_confirmed')
      );

      fetchReferrals();
    } catch (err) {
      console.error(t('doctorReferrals.confirm_failed'), err);
      alert(t('doctorReferrals.confirm_error'));
    }
  };

  return (
    <div className="referral-list-container">
      <h2>{t('doctorReferrals.heading')}</h2>

      {referrals.length === 0 ? (
        <p>{t('doctorReferrals.no_referrals')}</p>
      ) : (
        <table className="referral-table">
          <thead>
            <tr>
              <th>{t('doctorReferrals.citizen')}</th>
              <th>{t('doctorReferrals.referred_by')}</th>
              <th>{t('doctorReferrals.type')}</th>
              <th>{t('doctorReferrals.date')}</th>
              <th>{t('doctorReferrals.time')}</th>
              <th>{t('doctorReferrals.report')}</th>
              <th>{t('doctorReferrals.video_link')}</th>
              <th>{t('doctorReferrals.action')}</th>
            </tr>
          </thead>
          <tbody>
            {referrals.map((ref) => (
              <tr key={ref._id}>
                <td>{ref.citizenName}</td>
                <td>{ref.referredBy}</td>
                <td>{ref.type}</td>
                <td>{ref.appointmentDate || 'N/A'}</td>
                <td>{ref.appointmentTime || 'N/A'}</td>
                <td>
                  {ref.report ? (
                    <a
                      href={`http://localhost:5000${ref.report.replace(/\\/g, '/')}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {t('doctorReferrals.view')}
                    </a>
                  ) : (
                    'N/A'
                  )}
                </td>
                <td>
                  {ref.type === 'Online' && ref.videoLink ? (
                    <a href={ref.videoLink} target="_blank" rel="noreferrer">
                      {t('doctorReferrals.join_call')}
                    </a>
                  ) : (
                    '—'
                  )}
                </td>
                <td>
                  {ref.consultationConfirmed ? (
                    ref.type === 'Online' && ref.videoLink ? (
                      <button
                        onClick={() => handleConfirm(ref._id, true, true)}
                        className="resend-btn"
                      >
                        {t('doctorReferrals.resend_link')}
                      </button>
                    ) : (
                      t('doctorReferrals.confirmed')
                    )
                  ) : (
                    <button
                      onClick={() => handleConfirm(ref._id, ref.type === 'Online', false)}
                      className="confirm-btn"
                    >
                      {t('doctorReferrals.confirm')}
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