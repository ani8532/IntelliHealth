import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

const CitizenInbox = () => {
  const { token } = useAuth();
  const { t } = useTranslation();
  const [messages, setMessages] = useState([]);

  const fetchMessages = async () => {
    try {
      const res = await axios.get('/api/messages/inbox', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(res.data);
    } catch {
      alert(t('load_messages_error'));
    }
  };

  const markAsSeen = async (id) => {
    try {
      await axios.put(`/api/messages/seen/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchMessages();
    } catch {
      alert(t('cddash.mark_seen_error'));
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  return (
    <div className="inbox-container" style={{ marginTop: '80px', padding: '20px' }}>
      <h2>{t('cddash.your_messages')}</h2>
      {messages.length === 0 ? (
        <p>{t('cddash.no_messages')}</p>
      ) : (
        <ul className="message-list" style={{ listStyle: 'none', padding: 0 }}>
          {messages.map(msg => (
            <li key={msg._id} style={{
              background: msg.seen ? '#f0f0f0' : '#e0f7fa',
              border: '1px solid #ccc',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '12px',
              transition: 'background 0.3s ease'
            }}>
              <h4>{msg.title}</h4>
              <p>{msg.body}</p>
              <small>{new Date(msg.createdAt).toLocaleString()}</small>
              {!msg.seen && (
                <button
                  onClick={() => markAsSeen(msg._id)}
                  style={{
                    marginTop: '10px',
                    padding: '6px 12px',
                    background: '#007bff',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  {t('cddash.mark_seen')}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CitizenInbox;
