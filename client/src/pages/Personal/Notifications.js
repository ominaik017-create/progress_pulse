import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const TYPE_CONFIG = {
  task:      { emoji:'✅', color:'var(--success)' },
  challenge: { emoji:'🏆', color:'var(--warning)' },
  group:     { emoji:'👥', color:'var(--info)'    },
  system:    { emoji:'🔔', color:'var(--primary-light)' },
  countdown: { emoji:'⏰', color:'var(--danger)'  },
};

export default function Notifications() {
  const [notifs,  setNotifs]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/notifications').then(r=>{ setNotifs(r.data); setLoading(false); }).catch(()=>setLoading(false));
  }, []);

  const markRead = async (id) => {
    await api.put(`/notifications/${id}/read`);
    setNotifs(prev=>prev.map(n=>n._id===id?{...n,isRead:true}:n));
  };

  const markAll = async () => {
    await api.put('/notifications/read-all');
    setNotifs(prev=>prev.map(n=>({...n,isRead:true})));
    toast.success('All marked as read');
  };

  const unread = notifs.filter(n=>!n.isRead).length;

  if (loading) return <div className="spinner"/>;

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="page-subtitle">{unread} unread · {notifs.length} total</p>
        </div>
        {unread>0 && (
          <button className="btn btn-secondary" onClick={markAll}><CheckCheck size={15}/>Mark All Read</button>
        )}
      </div>

      {notifs.length===0 ? (
        <div className="empty-state"><Bell size={52}/><h3>No notifications</h3><p>You'll see task reminders, challenge updates, and group messages here</p></div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
          {notifs.map(n => {
            const cfg = TYPE_CONFIG[n.type]||TYPE_CONFIG.system;
            return (
              <div key={n._id} onClick={()=>!n.isRead&&markRead(n._id)}
                style={{ display:'flex', alignItems:'flex-start', gap:13, padding:'13px 16px',
                  background: n.isRead?'var(--bg-card)':'rgba(139,92,246,0.04)',
                  border:`1px solid ${n.isRead?'var(--border)':'rgba(139,92,246,0.18)'}`,
                  borderRadius:12, cursor:n.isRead?'default':'pointer', transition:'all 0.15s' }}>
                <div style={{ width:38, height:38, borderRadius:10, background:`${cfg.color}15`,
                  display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.1rem', flexShrink:0, border:`1px solid ${cfg.color}20` }}>
                  {cfg.emoji}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:3 }}>
                    <span style={{ fontWeight:n.isRead?500:700, fontSize:'0.855rem' }}>{n.title}</span>
                    {!n.isRead && <div style={{ width:7, height:7, borderRadius:'50%', background:'var(--primary)', flexShrink:0 }}/>}
                  </div>
                  <p style={{ fontSize:'0.78rem', color:'var(--text-muted)', lineHeight:1.5 }}>{n.message}</p>
                  <span style={{ fontSize:'0.67rem', color:'var(--text-dim)', marginTop:5, display:'block' }}>
                    {new Date(n.createdAt).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
