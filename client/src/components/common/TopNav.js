import React, { useState, useEffect, useRef } from 'react';
import { useAuth, API } from '../../context/AuthContext';

export default function TopNav({ title, subtitle }) {
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRef = useRef(null);

  useEffect(() => {
    API.get('/notifications').then(res => {
      setNotifications(res.data);
      setUnreadCount(res.data.filter(n => !n.isRead).length);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllRead = async () => {
    await API.put('/notifications/read-all');
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className="topnav">
      <div className="topnav-left">
        <div className="topnav-title">{title}</div>
        {subtitle && <div className="topnav-subtitle">{subtitle}</div>}
      </div>
      <div className="topnav-right" style={{ position: 'relative' }} ref={notifRef}>
        <button className="notification-btn" onClick={() => setShowNotifications(!showNotifications)}>
          🔔
          {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
        </button>

        {showNotifications && (
          <div className="notification-panel">
            <div className="notification-header">
              <span style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 15 }}>Notifications</span>
              {unreadCount > 0 && (
                <button onClick={markAllRead} style={{ fontSize: 12, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                  Mark all read
                </button>
              )}
            </div>
            {notifications.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>No notifications</div>
            ) : (
              notifications.slice(0, 8).map(n => (
                <div key={n._id} className={`notification-item ${!n.isRead ? 'unread' : ''}`}>
                  <div className="notification-title">{n.title}</div>
                  <div className="notification-msg">{n.message}</div>
                  <div className="notification-time">{timeAgo(n.createdAt)}</div>
                </div>
              ))
            )}
          </div>
        )}

        <div className="avatar-btn">
          {user?.name?.[0]?.toUpperCase()}
        </div>
      </div>
    </div>
  );
}
