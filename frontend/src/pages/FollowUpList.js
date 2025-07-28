import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import '../styles/followup.css';

const FollowUpList = () => {
  const { token, user } = useAuth();
  const { t } = useTranslation();
  const [followUps, setFollowUps] = useState([]);
  const [searchName, setSearchName] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchFollowUps = async () => {
    try {
      const res = await axios.get(`/api/followup/my-followups`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          name: searchName,
          status: statusFilter
        }
      });
      setFollowUps(res.data);
    } catch (err) {
      console.error(t('followups.fetch_error'), err);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await axios.put(
        `/api/followup/${id}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchFollowUps();
    } catch (err) {
      console.error(t('followups.update_error'), err);
    }
  };

  useEffect(() => {
    if (user?._id) fetchFollowUps();
  }, [user, searchName, statusFilter]);

  return (
    <div className="followup-container">
      <h2 className="title">{t('followups.title')}</h2>

      <div className="filters">
        <input
          type="text"
          placeholder={t('followups.search_placeholder')}
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          className="input"
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="select">
          <option value="">{t('followups.all')}</option>
          <option value="pending">{t('followups.pending')}</option>
          <option value="recovered">{t('followups.recovered')}</option>
          <option value="referred">{t('followups.referred')}</option>
        </select>
      </div>

      {followUps.length === 0 ? (
        <p>{t('followups.no_data')}</p>
      ) : (
        <div className="table-wrapper">
          <table className="followup-table">
            <thead>
              <tr>
                <th>{t('followups.citizen_name')}</th>
                <th>{t('followups.status')}</th>
                <th>{t('followups.date')}</th>
                <th>{t('followups.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {followUps.map((item) => (
                <tr key={item._id}>
                  <td>{item.citizenName}</td>
                  <td>{t(`followups.${item.status}`)}</td>
                  <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                  <td>
                    {(item.status === 'pending' || item.status === 'referred') && (
                      <button
                        className="btn green"
                        onClick={() => updateStatus(item._id, 'recovered')}
                      >
                        {t('followups.mark_recovered')}
                      </button>
                    )}
                    {item.status === 'pending' && (
                      <button
                        className="btn blue"
                        onClick={() => updateStatus(item._id, 'referred')}
                      >
                        {t('followups.refer_hospital')}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default FollowUpList;
