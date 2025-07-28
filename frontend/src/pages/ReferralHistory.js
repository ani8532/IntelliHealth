import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import '../styles/ReferralHistory.css';

const ReferralHistory = () => {
  const { token } = useAuth();
  const { t } = useTranslation();
  const [referrals, setReferrals] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReferrals = async () => {
      if (!token) {
        setError(t('referralHistory.tokenMissing'));
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get('/api/referral/my-referrals', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setReferrals(res.data);
      } catch (err) {
        console.error('Failed to load referral history:', err);
        setError(t('referralHistory.loadFailed'));
      } finally {
        setLoading(false);
      }
    };

    fetchReferrals();
  }, [token, t]);

  return (
    <div className="referral-history-container">
      <h2>{t('referralHistory.title')}</h2>

      {loading ? (
        <p>{t('referralHistory.loading')}</p>
      ) : error ? (
        <p className="error-text">{error}</p>
      ) : referrals.length === 0 ? (
        <p>{t('referralHistory.noReferrals')}</p>
      ) : (
        <table className="referral-table">
          <thead>
            <tr>
              <th>{t('referralHistory.citizenName')}</th>
              <th>{t('referralHistory.formId')}</th>
              <th>{t('referralHistory.doctorName')}</th>
              <th>{t('referralHistory.consultType')}</th>
              <th>{t('referralHistory.date')}</th>
              <th>{t('referralHistory.report')}</th>
            </tr>
          </thead>
          <tbody>
            {referrals.map(ref => (
              <tr key={ref._id}>
                <td>{ref.citizenName}</td>
                <td>{ref.citizenId}</td>
                <td>{ref.doctorName}</td>
                <td>{ref.type}</td>
                <td>{new Date(ref.createdAt).toLocaleDateString()}</td>
                <td>
                  {ref.report ? (
                    <a
                      href={`http://localhost:5000/uploads/reports/${ref.report.replace(/^uploads[\\/]/, '')}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {t('referralHistory.viewReport')}
                    </a>
                  ) : (
                    '—'
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

export default ReferralHistory;
