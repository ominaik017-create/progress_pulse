import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { ArrowLeft, Send, Trophy, Plus, X, Target, Users } from 'lucide-react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function GroupDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [challenges, setChallenges] = useState([]);
  const [messages, setMessages] = useState([]);
  const [msg, setMsg] = useState('');
  const [tab, setTab] = useState('chat');
  const [showChallenge, setShowChallenge] = useState(false);
  const [chalForm, setChalForm] = useState({ title: '', description: '', category: 'study', tasks: [{ title: 'Task 1', points: 10 }] });
  const socketRef = useRef(null);
  const msgEndRef = useRef(null);

  useEffect(() => {
    fetchAll();
    const socket = io('http://localhost:5000');
    socketRef.current = socket;
    socket.emit('join_group', { groupId: id, userId: user._id, userName: user.name });
    socket.on('receive_message', (message) => {
      setMessages(prev => [...prev, message]);
    });
    return () => { socket.disconnect(); };
  }, [id]);

  useEffect(() => { msgEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const fetchAll = async () => {
    try {
      const [gRes, mRes, cRes] = await Promise.all([
        api.get(`/groups/${id}`),
        api.get(`/groups/${id}/messages`),
        api.get(`/challenges/group/${id}`),
      ]);
      setGroup(gRes.data);
      setMessages(mRes.data);
      setChallenges(cRes.data);
    } catch { toast.error('Failed to load group'); }
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!msg.trim()) return;
    socketRef.current?.emit('send_message', {
      groupId: id, senderId: user._id, senderName: user.name,
      senderAvatar: user.avatar, content: msg.trim(),
    });
    setMsg('');
  };

  const createChallenge = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/challenges', { ...chalForm, type: 'group', group: id });
      setChallenges([...challenges, res.data]);
      setShowChallenge(false);
      toast.success('Challenge created!');
    } catch { toast.error('Failed'); }
  };

  const completeTask = async (challengeId, taskId) => {
    try {
      await api.put(`/challenges/${challengeId}/complete-task`, { taskId });
      const res = await api.get(`/challenges/group/${id}`);
      setChallenges(res.data);
      toast.success('Task completed! Points earned!');
    } catch { toast.error('Failed'); }
  };

  const isAdmin = group?.admin?._id === user._id;

  const getLeaderboard = () => {
    if (!group?.members) return [];
    return [...group.members].sort((a, b) => (b.totalTasksCompleted || 0) - (a.totalTasksCompleted || 0));
  };

  if (!group) return <div className="spinner"/>;

  return (
    <div className="page-content">
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
        <button className="btn btn-secondary btn-sm" onClick={() => navigate('/groups')}><ArrowLeft size={16}/></button>
        <div>
          <h1 className="page-title" style={{ margin: 0 }}>{group.name}</h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{group.members?.length} members · Code: <strong style={{ letterSpacing: '0.1em' }}>{group.inviteCode}</strong></p>
        </div>
        {isAdmin && <button className="btn btn-primary btn-sm" style={{ marginLeft: 'auto' }} onClick={() => setShowChallenge(true)}><Plus size={14}/>Add Challenge</button>}
      </div>

      <div className="tabs" style={{ marginBottom: 20 }}>
        {['chat','challenges','leaderboard','members'].map(t => (
          <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)} style={{ textTransform: 'capitalize' }}>{t}</button>
        ))}
      </div>

      {tab === 'chat' && (
        <div className="card" style={{ padding: 0, display: 'flex', flexDirection: 'column', height: 'calc(100vh - 280px)' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, rgba(99,102,241,0.3), rgba(129,140,248,0.1))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>💬</div>
            <div><div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Group Chat</div><div style={{ fontSize: '0.72rem', color: 'var(--success)' }}>● Live</div></div>
          </div>
          <div className="chat-messages" style={{ flex: 1 }}>
            {messages.map((m, i) => {
              const isOwn = m.sender?._id === user._id;
              return (
                <div key={m._id || i} className={`chat-message ${isOwn ? 'own' : ''}`}>
                  {!isOwn && <div className="avatar" style={{ flexShrink: 0 }}>{m.sender?.name?.charAt(0)}</div>}
                  <div>
                    {!isOwn && <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 3, marginLeft: 2 }}>{m.sender?.name}</div>}
                    <div className={`chat-bubble ${isOwn ? 'own' : 'other'}`}>{m.content}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', marginTop: 3, marginLeft: isOwn ? 0 : 2, textAlign: isOwn ? 'right' : 'left' }}>{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                </div>
              );
            })}
            <div ref={msgEndRef}/>
          </div>
          <form onSubmit={sendMessage} className="chat-input-area">
            <input className="form-input" placeholder="Type a message..." value={msg} onChange={e => setMsg(e.target.value)} style={{ flex: 1 }}/>
            <button type="submit" className="btn btn-primary"><Send size={16}/></button>
          </form>
        </div>
      )}

      {tab === 'challenges' && (
        <div>
          {challenges.length === 0 ? (
            <div className="empty-state">
              <Target size={64}/>
              <h3>No challenges yet</h3>
              {isAdmin && <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setShowChallenge(true)}><Plus size={16}/>Create First Challenge</button>}
            </div>
          ) : challenges.map(ch => {
            const myParticipant = ch.participants?.find(p => p.user?._id === user._id || p.user === user._id);
            const leaderboard = [...(ch.participants || [])].sort((a,b) => (b.score||0) - (a.score||0));
            return (
              <div key={ch._id} className="card" style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div>
                    <h3 style={{ fontWeight: 700, fontSize: '1.05rem' }}>{ch.title}</h3>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 4 }}>{ch.description}</p>
                  </div>
                  <span className="badge badge-primary" style={{ textTransform: 'capitalize' }}>{ch.category}</span>
                </div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
                  {leaderboard.slice(0, 3).map((p, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: 'var(--bg)', borderRadius: 8 }}>
                      <span>{idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}</span>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{p.user?.name || 'Unknown'}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--primary-light)', fontWeight: 700 }}>{p.score}pts</span>
                    </div>
                  ))}
                </div>
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14 }}>
                  <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 10 }}>Tasks ({ch.tasks?.length})</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {ch.tasks?.map(task => {
                      const done = myParticipant?.completedTasks?.includes(task._id);
                      return (
                        <div key={task._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: done ? 'rgba(16,185,129,0.08)' : 'var(--bg)', borderRadius: 8, border: `1px solid ${done ? 'rgba(16,185,129,0.2)' : 'var(--border)'}` }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: 500, textDecoration: done ? 'line-through' : 'none', opacity: done ? 0.6 : 1 }}>{task.title}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span className="badge badge-warning">+{task.points}pts</span>
                            {!done && myParticipant && (
                              <button className="btn btn-sm btn-success" onClick={() => completeTask(ch._id, task._id)}>Done</button>
                            )}
                            {done && <span style={{ color: 'var(--success)', fontSize: '0.8rem', fontWeight: 600 }}>✓ Done</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === 'leaderboard' && (
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <Trophy size={20} color="var(--warning)"/>
            <h3 style={{ fontWeight: 700 }}>Group Leaderboard</h3>
          </div>
          {getLeaderboard().map((member, idx) => (
            <div key={member._id} className="leaderboard-item">
              <div className={`rank ${idx < 3 ? `rank-${idx+1}` : ''}`} style={idx >= 3 ? { background: 'var(--bg)', color: 'var(--text-muted)', fontSize: '0.8rem' } : {}}>
                {idx < 3 ? ['🥇','🥈','🥉'][idx] : idx + 1}
              </div>
              <div className="avatar">{member.name?.charAt(0)}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>{member.name} {member._id === user._id && <span className="badge badge-primary" style={{ marginLeft: 4, fontSize: '0.65rem' }}>You</span>}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{member.streak || 0} day streak</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 800, color: 'var(--primary-light)' }}>{member.totalTasksCompleted || 0}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>tasks done</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'members' && (
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <Users size={20} color="var(--primary-light)"/>
            <h3 style={{ fontWeight: 700 }}>Members ({group.members?.length}/{group.maxMembers})</h3>
          </div>
          {group.members?.map(member => (
            <div key={member._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
              <div className="avatar avatar-lg">{member.name?.charAt(0)}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>{member.name} {member._id === group.admin?._id && <span className="badge badge-warning" style={{ marginLeft: 4, fontSize: '0.65rem' }}>Admin</span>}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{member.totalTasksCompleted || 0} tasks completed</div>
              </div>
              <div className="streak-badge" style={{ fontSize: '0.72rem' }}>🔥 {member.streak || 0}</div>
            </div>
          ))}
        </div>
      )}

      {showChallenge && (
        <div className="modal-overlay" onClick={() => setShowChallenge(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Create Group Challenge</h3>
              <button className="btn btn-icon btn-secondary btn-sm" onClick={() => setShowChallenge(false)}><X size={16}/></button>
            </div>
            <form onSubmit={createChallenge} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Title *</label>
                <input className="form-input" placeholder="e.g. 7-Day Coding Sprint" value={chalForm.title} onChange={e => setChalForm({...chalForm, title: e.target.value})} required/>
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-textarea" value={chalForm.description} onChange={e => setChalForm({...chalForm, description: e.target.value})}/>
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-select" value={chalForm.category} onChange={e => setChalForm({...chalForm, category: e.target.value})}>
                  {['study','coding','fitness','reading','meditation','other'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <label className="form-label" style={{ marginBottom: 0 }}>Tasks</label>
                  <button type="button" className="btn btn-sm btn-secondary" onClick={() => setChalForm({...chalForm, tasks: [...chalForm.tasks, { title: '', points: 10 }]})}>
                    <Plus size={12}/>Add Task
                  </button>
                </div>
                {chalForm.tasks.map((task, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    <input className="form-input" placeholder={`Task ${idx+1}`} value={task.title} onChange={e => { const t = [...chalForm.tasks]; t[idx].title = e.target.value; setChalForm({...chalForm, tasks: t}); }} style={{ flex: 1 }}/>
                    <input className="form-input" type="number" min={1} value={task.points} onChange={e => { const t = [...chalForm.tasks]; t[idx].points = parseInt(e.target.value); setChalForm({...chalForm, tasks: t}); }} style={{ width: 70 }} placeholder="pts"/>
                    {chalForm.tasks.length > 1 && <button type="button" className="btn btn-icon btn-danger btn-sm" onClick={() => setChalForm({...chalForm, tasks: chalForm.tasks.filter((_, i) => i !== idx)})}><X size={12}/></button>}
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowChallenge(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary"><Plus size={16}/>Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
