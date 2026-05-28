import React, { useState, useEffect } from 'react';
import { Shield, Users, Target, CheckCircle, XCircle, UserCheck } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function AdminPanel() {
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [pending, setPending] = useState([]);
  const [tab, setTab] = useState('overview');

  useEffect(() => {
    api.get('/admin/stats').then(r => setStats(r.data)).catch(()=>{});
    api.get('/admin/users').then(r => setUsers(r.data)).catch(()=>{});
    api.get('/admin/challenges/pending').then(r => setPending(r.data)).catch(()=>{});
  }, []);

  const verifyCreator = async (userId) => {
    try {
      await api.put(`/admin/users/${userId}/verify-creator`);
      setUsers(users.map(u => u._id === userId ? {...u, isVerifiedCreator:true, role:'creator'} : u));
      toast.success('Creator verified!');
    } catch { toast.error('Failed'); }
  };

  const approveChallenge = async (id) => {
    try {
      await api.put(`/admin/challenges/${id}/approve`);
      setPending(pending.filter(c => c._id !== id));
      toast.success('Challenge approved!');
    } catch { toast.error('Failed'); }
  };

  const rejectChallenge = async (id) => {
    try {
      await api.put(`/admin/challenges/${id}/reject`);
      setPending(pending.filter(c => c._id !== id));
      toast.success('Challenge rejected');
    } catch { toast.error('Failed'); }
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:4 }}>
            <div style={{ width:36, height:36, borderRadius:10, background:'linear-gradient(135deg, #ef4444, #f87171)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Shield size={18} color="white"/>
            </div>
            <h1 className="page-title" style={{ margin:0 }}>Admin Panel</h1>
          </div>
          <p className="page-subtitle">Manage platform users, challenges, and content</p>
        </div>
      </div>

      <div className="stats-grid" style={{ marginBottom:20 }}>
        {[
          { label:'Total Users', value:stats.totalUsers||0, icon:Users, color:'#6366f1' },
          { label:'Total Challenges', value:stats.totalChallenges||0, icon:Target, color:'#10b981' },
          { label:'Pending Review', value:stats.pendingChallenges||0, icon:Shield, color:'#f59e0b' },
        ].map(s => (
          <div className="stat-card" key={s.label}>
            <div className="stat-icon" style={{ background:`${s.color}20` }}><s.icon size={20} color={s.color}/></div>
            <div className="stat-value" style={{ color:s.color }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="tabs" style={{ marginBottom:20 }}>
        <button className={`tab ${tab==='overview'?'active':''}`} onClick={() => setTab('overview')}>👥 Users</button>
        <button className={`tab ${tab==='pending'?'active':''}`} onClick={() => setTab('pending')}>
          ⏳ Pending {pending.length>0&&<span className="badge badge-danger" style={{ marginLeft:6 }}>{pending.length}</span>}
        </button>
      </div>

      {tab === 'overview' && (
        <div className="card">
          <h3 style={{ fontWeight:700, marginBottom:16 }}>All Users</h3>
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ borderBottom:'1px solid var(--border)' }}>
                  {['User','Email','Role','Verified Creator','Streak','Actions'].map(h => (
                    <th key={h} style={{ padding:'10px 12px', textAlign:'left', fontSize:'0.75rem', color:'var(--text-muted)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id} style={{ borderBottom:'1px solid var(--border)' }}>
                    <td style={{ padding:'12px', display:'flex', alignItems:'center', gap:10 }}>
                      <div className="avatar" style={{ flexShrink:0 }}>{u.name?.charAt(0)}</div>
                      <span style={{ fontWeight:600, fontSize:'0.875rem' }}>{u.name}</span>
                    </td>
                    <td style={{ padding:'12px', fontSize:'0.82rem', color:'var(--text-muted)' }}>{u.email}</td>
                    <td style={{ padding:'12px' }}>
                      <span className={`badge ${u.role==='admin'?'badge-danger':u.role==='creator'?'badge-success':'badge-info'}`} style={{ textTransform:'capitalize' }}>{u.role}</span>
                    </td>
                    <td style={{ padding:'12px' }}>
                      {u.isVerifiedCreator ? <span className="badge badge-success">✓ Verified</span> : <span style={{ fontSize:'0.78rem', color:'var(--text-dim)' }}>—</span>}
                    </td>
                    <td style={{ padding:'12px', fontSize:'0.82rem' }}>{u.streak||0}🔥</td>
                    <td style={{ padding:'12px' }}>
                      {!u.isVerifiedCreator && u.role !== 'admin' && (
                        <button className="btn btn-sm btn-success" onClick={() => verifyCreator(u._id)}>
                          <UserCheck size={13}/> Verify Creator
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'pending' && (
        <div>
          {pending.length === 0 ? (
            <div className="empty-state">
              <Shield size={64}/>
              <h3>No pending challenges</h3>
              <p>All challenges have been reviewed</p>
            </div>
          ) : pending.map(ch => (
            <div key={ch._id} className="card" style={{ marginBottom:16 }}>
              <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:16 }}>
                <div style={{ flex:1 }}>
                  <h3 style={{ fontWeight:700, marginBottom:6 }}>{ch.title}</h3>
                  <p style={{ fontSize:'0.85rem', color:'var(--text-muted)', marginBottom:10, lineHeight:1.6 }}>{ch.description}</p>
                  <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                    <span className="badge badge-primary" style={{ textTransform:'capitalize' }}>{ch.category}</span>
                    <span style={{ fontSize:'0.78rem', color:'var(--text-muted)' }}>By: <strong>{ch.creator?.name}</strong> ({ch.creator?.email})</span>
                    <span style={{ fontSize:'0.78rem', color:'var(--text-muted)' }}>{ch.tasks?.length||0} tasks · {ch.duration}d · Max {ch.maxParticipants}</span>
                  </div>
                </div>
                <div style={{ display:'flex', gap:10, flexShrink:0 }}>
                  <button className="btn btn-danger btn-sm" onClick={() => rejectChallenge(ch._id)}>
                    <XCircle size={14}/> Reject
                  </button>
                  <button className="btn btn-success btn-sm" onClick={() => approveChallenge(ch._id)}>
                    <CheckCircle size={14}/> Approve
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
