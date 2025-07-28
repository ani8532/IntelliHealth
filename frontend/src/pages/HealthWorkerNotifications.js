import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const HealthWorkerNotifications = () => {
  const { user, token } = useAuth();
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!user || !token) return;

    const fetchNotifications = async () => {
      try {
        const res = await axios.get(`/api/notifications/healthworker/${user._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setNotifications(res.data);
      } catch (err) {
        console.error('Failed to fetch notifications', err);
      }
    };

    fetchNotifications();
  }, [user, token]);

  const markAsRead = async (id) => {
    try {
      await axios.put(`/api/notification/mark-read/${id}`);
      setNotifications((prev) =>
        prev.map((note) => (note._id === id ? { ...note, read: true } : note))
      );
    } catch (err) {
      console.error('Error marking as read', err);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>{t('hwr.ht.heading')}</h2>
      {notifications.length === 0 ? (
        <p style={styles.empty}>{t('hwr.ht.empty')}</p>
      ) : (
        <ul style={styles.list}>
          {notifications.map((note) => (
            <li
              key={note._id}
              style={{
                ...styles.item,
                ...(note.read ? styles.read : styles.unread)
              }}
            >
              <div>
                <strong>{note.title}</strong>
                <p>{note.message}</p>
                <small>{new Date(note.createdAt).toLocaleString()}</small>
              </div>
              {!note.read && (
                <button style={styles.button} onClick={() => markAsRead(note._id)}>
                  <CheckCircle2 size={16} />
                  <span style={{ marginLeft: '6px' }}>{t('hwr.ht.markAsRead')}</span>
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
    maxWidth: '800px',
    margin: '2rem auto',
    padding: '1.5rem',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
    fontFamily: 'Arial, sans-serif',
    marginTop: '80px'
  },
  heading: {
    fontSize: '1.8rem',
    marginBottom: '1rem',
    color: '#111827'
  },
  empty: {
    fontSize: '1rem',
    color: '#6b7280'
  },
  list: {
    listStyle: 'none',
    padding: 0,
    margin: 0
  },
  item: {
    padding: '1rem',
    marginBottom: '1rem',
    borderRadius: '8px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    transition: 'background 0.3s ease',
    border: '1px solid #e5e7eb'
  },
  unread: {
    backgroundColor: '#f0f9ff',
    borderLeft: '4px solid #3b82f6'
  },
  read: {
    backgroundColor: '#f9fafb',
    opacity: 0.7
  },
  button: {
    backgroundColor: '#10b981',
    color: '#fff',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    fontSize: '0.9rem',
    transition: 'background 0.2s ease'
  }
};

export default HealthWorkerNotifications;
