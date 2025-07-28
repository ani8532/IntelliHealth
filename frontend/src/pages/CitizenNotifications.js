import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

const CitizenNotifications = () => {
  const { user, token } = useAuth();
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(`/api/notifications/citizen/${user._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(res.data);
    } catch (err) {
      console.error(t('cddash.notification_fetch_error'), err);
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.put(`/api/notifications/mark-read/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchNotifications();
    } catch (err) {
      alert(t('cddash.mark_read_error'));
    }
  };

  useEffect(() => {
    if (user && token) fetchNotifications();
  }, [user, token]);

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>{t('cddash.your_notifications')}</h2>
      {notifications.length === 0 ? (
        <p>{t('cddash.no_notifications')}</p>
      ) : (
        <ul style={styles.list}>
          {notifications.map((note) => (
            <li
              key={note._id}
              style={{
                ...styles.item,
                backgroundColor: note.read ? '#f9f9f9' : '#e8f0fe',
              }}
            >
              <h4 style={styles.notificationTitle}>{note.title}</h4>
              <p style={styles.message}>{note.message}</p>
              <small>{new Date(note.createdAt).toLocaleString()}</small>
              {!note.read && (
                <button style={styles.button} onClick={() => markAsRead(note._id)}>
                  {t('cddash.mark_read')}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '40px 20px',
    maxWidth: '800px',
    margin: 'auto',
  },
  title: {
    marginBottom: '20px',
    textAlign: 'center',
    color: '#2c3e50',
  },
  list: {
    listStyle: 'none',
    padding: 0,
  },
  item: {
    padding: '15px',
    border: '1px solid #ccc',
    borderRadius: '10px',
    marginBottom: '15px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
  },
  notificationTitle: {
    margin: 0,
    color: '#34495e',
  },
  message: {
    margin: '8px 0',
  },
  button: {
    marginTop: '8px',
    padding: '6px 12px',
    backgroundColor: '#3498db',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
};

export default CitizenNotifications;
