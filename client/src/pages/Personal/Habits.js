import React, { useState, useEffect } from 'react';
import { Plus, Flame, Trophy, X, Check } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const ICONS = ['⭐','🏃','📚','💪','🧘','💻','🥗','💧','🎯','🎸','✍️','🌙','🎨','🧠','🏊'];
const COLORS = ['#8b5cf6','#10b981','#f59e0b','#ec4899','#06b6d4','#f43f5e','#a78bfa','#fbbf24'];

export default function Habits() {
  const [habits,    setHabits]    = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title:'', description:'', targetDays:30, color:'#8b5cf6', icon:'⭐' });

  useEffect(() => {
    api.get('/habits').then(r => setHabits(r.data)).catch(() => {});
  }, []);

  const createHabit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/habits', form);
      setHabits(prev => [...prev, res.data]);
      setShowModal(false);
      setForm({ title:'', description:'', targetDays:30, color:'#8b5cf6', icon:'⭐' });
      toast.success('Habit created! 🔥');
    } catch { toast.error('Failed'); }
  };

  const markToday = async (id) => {
    try {
      const res = await api.put(`/habits/${id}/complete`);
      setHabits(prev => prev.map(h => h._id===id ? res.data : h));
      toast.success('Habit tracked! 🔥');
    } catch { toast.error('Failed'); }
  };

  const deleteHabit = async (id) => {
    try {
      await api.delete(`/habits/${id}`);
      setHabits(prev => prev.filter(h => h._id !== id));
    } catch { toast.error('Failed'); }
  };

  const isDoneToday = (h) => {
    const today = new Date().toDateString();
    return h.completedDates?.some(d => new Date(d).toDateString() === today);
  };

  const getLast30 = (h) =>
    Array.from({length:30}, (_, i) => {
      const d = new Date(); d.setDate(d.getDate()-(29-i));
      return h.completedDates?.some(cd => new Date(cd).toDateString() === d.toDateString());
    });

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Habit Tracker</h1>
          <p className="page-subtitle">Build unstoppable consistency with daily streaks</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={15}/>New Habit</button>
      </div>

      {habits.length === 0 ? (
        <div className="empty-state">
          <Flame size={52}/>
          <h3>No habits yet</h3>
          <p>Start tracking habits to build powerful streaks</p>
          <button className="btn btn-primary" style={{ marginTop:14 }} onClick={() => setShowModal(true)}><Plus size={15}/>Add Habit</button>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {habits.map(h => {
            const done = isDoneToday(h);
            const days = getLast30(h);
            const pct  = Math.min(100, Math.round((h.currentStreak/h.targetDays)*100));
            return (
              <div key={h._id} className="card" style={{ borderLeft:`4px solid ${h.color}` }}>
                <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:14 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                    <div style={{ width:50, height:50, borderRadius:14, background:`${h.color}18`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.5rem', border:`1px solid ${h.color}30` }}>
                      {h.icon}
                    </div>
                    <div>
                      <h3 style={{ fontWeight:700, fontSize:'1rem', marginBottom:4 }}>{h.title}</h3>
                      {h.description && <p style={{ fontSize:'0.76rem', color:'var(--text-muted)' }}>{h.description}</p>}
                      <div style={{ display:'flex', gap:10, marginTop:6, alignItems:'center' }}>
                        <div className="streak-badge"><Flame size={11}/>{h.currentStreak} day streak</div>
                        <span style={{ fontSize:'0.72rem', color:'var(--text-dim)', display:'flex', alignItems:'center', gap:3 }}>
                          <Trophy size={11} color="var(--warning)"/>Best: {h.longestStreak}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div style={{ display:'flex', gap:7 }}>
                    <button className={`btn btn-sm ${done?'btn-success':'btn-primary'}`}
                      onClick={() => !done && markToday(h._id)} disabled={done}
                      style={{ minWidth:90 }}>
                      {done ? <><Check size={13}/>Done!</> : 'Mark Done'}
                    </button>
                    <button className="btn btn-icon btn-danger btn-sm" onClick={() => deleteHabit(h._id)}><X size={13}/></button>
                  </div>
                </div>

                {/* Progress bar */}
                <div style={{ marginBottom:12 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                    <span style={{ fontSize:'0.7rem', color:'var(--text-muted)', fontWeight:600 }}>Goal: {h.targetDays} days</span>
                    <span style={{ fontSize:'0.7rem', fontWeight:800, color:h.color }}>{pct}%</span>
                  </div>
                  <div className="progress-bar" style={{ height:5 }}>
                    <div className="progress-fill" style={{ width:`${pct}%`, background:`linear-gradient(90deg, ${h.color}cc, ${h.color})` }}/>
                  </div>
                </div>

                {/* 30-day grid */}
                <div>
                  <p style={{ fontSize:'0.65rem', color:'var(--text-dim)', marginBottom:6, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em' }}>Last 30 days</p>
                  <div className="habit-grid">
                    {days.map((d,i) => (
                      <div key={i} className={`habit-dot ${d?'done':''}`}
                        style={d ? { background:h.color, boxShadow:`0 0 4px ${h.color}60` } : {}}
                        title={`Day ${i+1}: ${d?'Done':'Missed'}`}/>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Create New Habit</h3>
              <button className="btn btn-icon btn-secondary btn-sm" onClick={() => setShowModal(false)}><X size={15}/></button>
            </div>
            <form onSubmit={createHabit} style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div className="form-group">
                <label className="form-label">Habit Name *</label>
                <input className="form-input" placeholder="e.g. Morning Run, Read 30 mins" value={form.title}
                  onChange={e => setForm({...form, title:e.target.value})} required/>
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <input className="form-input" placeholder="Optional" value={form.description}
                  onChange={e => setForm({...form, description:e.target.value})}/>
              </div>
              <div className="form-group">
                <label className="form-label">Choose Icon</label>
                <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                  {ICONS.map(icon => (
                    <button key={icon} type="button" onClick={() => setForm({...form, icon})}
                      style={{ width:38, height:38, borderRadius:10, border:`2px solid ${form.icon===icon?form.color:'var(--border)'}`,
                        background: form.icon===icon ? `${form.color}15` : 'var(--bg)',
                        fontSize:'1.1rem', cursor:'pointer', transition:'all 0.15s' }}>
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Target Days</label>
                  <input className="form-input" type="number" min={7} max={365} value={form.targetDays}
                    onChange={e => setForm({...form, targetDays:parseInt(e.target.value)})}/>
                </div>
                <div className="form-group">
                  <label className="form-label">Color</label>
                  <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginTop:4 }}>
                    {COLORS.map(c => (
                      <button key={c} type="button" onClick={() => setForm({...form, color:c})}
                        style={{ width:28, height:28, borderRadius:'50%', background:c,
                          border:`3px solid ${form.color===c?'white':'transparent'}`,
                          cursor:'pointer', outline:form.color===c?`2px solid ${c}`:'none', transition:'all 0.15s' }}/>
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary"><Plus size={14}/>Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
