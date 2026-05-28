import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, Check, CheckCheck } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function Topbar({ mode, setMode, title }) {
  const [notifs, setNotifs] = useState([]);
  const [open,   setOpen]   = useState(false);
  const { user } = useAuth();
  const ref = useRef();

  useEffect(() => {
    api.get('/notifications').then(r => setNotifs(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const unread = notifs.filter(n => !n.isRead).length;

  const markAll = async () => {
    await api.put('/notifications/read-all');
    setNotifs(notifs.map(n => ({ ...n, isRead: true })));
  };

  const MODES = [
    { key:'personal', label:'🧘 Personal' },
    { key:'academic', label:'🎓 Academic' },
    { key:'public',   label:'🌍 Public'   },
  ];

  return (
    <div className="topbar">
      <div className="topbar-left">
        <div>
          <div style={{ fontWeight:700, fontSize:'1rem', letterSpacing:'-0.01em' }}>{title || 'Dashboard'}</div>
          <div style={{ fontSize:'0.7rem', color:'var(--text-muted)' }}>
            {new Date().toLocaleDateString('en-IN',{ weekday:'long', year:'numeric', month:'long', day:'numeric' })}
          </div>
        </div>
      </div>

      <div className="topbar-right">
        <div className="mode-switcher">
          {MODES.map(m => (
            <button key={m.key} className={`mode-btn ${mode===m.key?'active':''}`} onClick={() => setMode(m.key)}>
              {m.label}
            </button>
          ))}
        </div>

        {/* Notification bell */}
        <div ref={ref} style={{ position:'relative' }}>
          <button className="btn btn-secondary btn-icon notif-btn" onClick={() => setOpen(!open)}>
            <Bell size={16}/>
            {unread > 0 && <span className="notif-dot"/>}
          </button>

          {open && (
            <div className="notif-panel">
              <div style={{ padding:'12px 14px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ fontWeight:700, fontSize:'0.88rem' }}>Notifications</span>
                  {unread > 0 && <span className="badge badge-danger">{unread}</span>}
                </div>
                <div style={{ display:'flex', gap:6 }}>
                  {unread > 0 && (
                    <button className="btn btn-sm btn-success" onClick={markAll}><CheckCheck size={12}/>All read</button>
                  )}
                  <button className="btn btn-sm btn-secondary" onClick={() => setOpen(false)}><X size={12}/></button>
                </div>
              </div>
              <div style={{ maxHeight:300, overflowY:'auto' }}>
                {notifs.length === 0 ? (
                  <div style={{ padding:24, textAlign:'center', color:'var(--text-muted)', fontSize:'0.82rem' }}>No notifications yet</div>
                ) : notifs.slice(0,15).map(n => (
                  <div key={n._id} style={{ padding:'10px 14px', borderBottom:'1px solid var(--border)', background: n.isRead?'transparent':'rgba(139,92,246,0.04)' }}>
                    <div style={{ fontWeight: n.isRead?500:700, fontSize:'0.82rem' }}>{n.title}</div>
                    <div style={{ fontSize:'0.75rem', color:'var(--text-muted)', marginTop:2 }}>{n.message}</div>
                    <div style={{ fontSize:'0.67rem', color:'var(--text-dim)', marginTop:3 }}>{new Date(n.createdAt).toLocaleDateString()}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Avatar */}
        <div className="avatar" style={{ background:`linear-gradient(135deg, ${user?.avatar||'#7c3aed'}, #a78bfa)`, cursor:'pointer' }}
          onClick={() => window.location.href='/settings'}>
          {user?.name?.charAt(0).toUpperCase()}
        </div>
      </div>
    </div>
  );
}
