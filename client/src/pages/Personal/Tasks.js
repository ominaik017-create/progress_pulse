import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, CheckCircle, Circle, X, Search } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const CATEGORIES = ['all','study','fitness','work','personal','health','coding','other'];
const PRIORITIES  = ['low','medium','high'];
const CAT_ICONS   = { study:'📚', fitness:'💪', work:'💼', personal:'🌟', health:'❤️', coding:'💻', other:'📌', all:'🗂️' };
const PRI_COLOR   = { high:'var(--danger)', medium:'var(--warning)', low:'var(--info)' };

export default function Tasks() {
  const [tasks,     setTasks]     = useState([]);
  const [filter,    setFilter]    = useState('all');
  const [search,    setSearch]    = useState('');
  const [showModal, setShowModal] = useState(false);
  const [loading,   setLoading]   = useState(true);
  const [form, setForm] = useState({ title:'', description:'', category:'personal', priority:'medium', dueDate:'' });

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params = filter !== 'all' ? { category: filter } : {};
      const res = await api.get('/tasks', { params });
      setTasks(res.data);
    } catch { toast.error('Failed to load tasks'); }
    finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const createTask = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/tasks', form);
      setTasks(prev => [res.data, ...prev]);
      setShowModal(false);
      setForm({ title:'', description:'', category:'personal', priority:'medium', dueDate:'' });
      toast.success('Task created! ✅');
    } catch { toast.error('Failed to create task'); }
  };

  const toggleTask = async (task) => {
    try {
      const newStatus = task.status === 'completed' ? 'pending' : 'completed';
      const res = await api.put(`/tasks/${task._id}`, { status: newStatus });
      setTasks(prev => prev.map(t => t._id === task._id ? res.data : t));
      if (newStatus === 'completed') toast.success('Task done! 🎉');
    } catch { toast.error('Update failed'); }
  };

  const deleteTask = async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
      setTasks(prev => prev.filter(t => t._id !== id));
    } catch { toast.error('Delete failed'); }
  };

  const visible = tasks.filter(t =>
    !search || t.title.toLowerCase().includes(search.toLowerCase())
  );

  const done    = visible.filter(t => t.status === 'completed').length;
  const total   = visible.length;
  const pct     = total > 0 ? Math.round((done/total)*100) : 0;

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Tasks</h1>
          <p className="page-subtitle">{done}/{total} tasks completed · {pct}% productivity</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={15}/>New Task</button>
      </div>

      {/* Progress */}
      {total > 0 && (
        <div className="card" style={{ marginBottom:16, padding:'14px 18px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
            <span style={{ fontSize:'0.78rem', fontWeight:600, color:'var(--text-muted)' }}>Overall Progress</span>
            <span style={{ fontSize:'0.78rem', fontWeight:800, color:'var(--primary-light)' }}>{pct}%</span>
          </div>
          <div className="progress-bar"><div className="progress-fill" style={{ width:`${pct}%` }}/></div>
        </div>
      )}

      {/* Search + filters */}
      <div style={{ display:'flex', gap:10, marginBottom:16, flexWrap:'wrap', alignItems:'center' }}>
        <div className="input-icon" style={{ flex:'1 1 200px', minWidth:180 }}>
          <Search size={14}/>
          <input className="form-input" placeholder="Search tasks..." value={search}
            onChange={e => setSearch(e.target.value)} style={{ paddingLeft:34 }}/>
        </div>
        <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setFilter(c)}
              style={{ padding:'5px 12px', borderRadius:6, border:`1px solid ${filter===c?'var(--primary)':'var(--border)'}`,
                background: filter===c ? 'rgba(139,92,246,0.15)' : 'var(--bg-card)',
                color: filter===c ? 'var(--primary-light)' : 'var(--text-muted)',
                fontSize:'0.75rem', fontWeight:600, cursor:'pointer', transition:'all 0.15s',
                display:'flex', alignItems:'center', gap:4 }}>
              {CAT_ICONS[c]} {c}
            </button>
          ))}
        </div>
      </div>

      {/* Task list */}
      {loading ? <div className="spinner"/> : visible.length === 0 ? (
        <div className="empty-state">
          <CheckCircle size={52}/>
          <h3>{search ? 'No matching tasks' : 'No tasks yet'}</h3>
          <p>{search ? 'Try a different search term' : 'Click "New Task" to get started'}</p>
          {!search && <button className="btn btn-primary" style={{ marginTop:14 }} onClick={() => setShowModal(true)}><Plus size={15}/>Add Task</button>}
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {visible.map(task => (
            <div key={task._id} className="card card-sm"
              style={{ display:'flex', alignItems:'center', gap:12,
                borderLeft:`3px solid ${task.status==='completed'?'var(--success)':PRI_COLOR[task.priority]}`,
                opacity: task.status==='completed' ? 0.65 : 1, transition:'all 0.18s' }}>
              <button onClick={() => toggleTask(task)}
                style={{ background:'none', border:'none', cursor:'pointer', flexShrink:0,
                  color: task.status==='completed' ? 'var(--success)' : 'var(--border-light)', transition:'color 0.15s' }}>
                {task.status==='completed' ? <CheckCircle size={21}/> : <Circle size={21}/>}
              </button>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontWeight:600, fontSize:'0.875rem',
                  textDecoration: task.status==='completed' ? 'line-through' : 'none',
                  overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                  {task.title}
                </div>
                {task.description && (
                  <div style={{ fontSize:'0.74rem', color:'var(--text-muted)', marginTop:2,
                    overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {task.description}
                  </div>
                )}
                <div style={{ display:'flex', gap:6, marginTop:5, flexWrap:'wrap', alignItems:'center' }}>
                  <span style={{ fontSize:'0.67rem', background:'var(--bg-hover)', padding:'2px 7px', borderRadius:4, color:'var(--text-muted)', fontWeight:600 }}>
                    {CAT_ICONS[task.category]} {task.category}
                  </span>
                  {task.dueDate && (
                    <span style={{ fontSize:'0.67rem', color:'var(--text-dim)' }}>
                      Due: {new Date(task.dueDate).toLocaleDateString('en-IN')}
                    </span>
                  )}
                </div>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
                <span style={{ fontSize:'0.68rem', fontWeight:800, color:PRI_COLOR[task.priority], textTransform:'uppercase', letterSpacing:'0.05em' }}>
                  {task.priority}
                </span>
                <button className="btn btn-icon btn-danger btn-sm" onClick={() => deleteTask(task._id)}><Trash2 size={13}/></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Create New Task</h3>
              <button className="btn btn-icon btn-secondary btn-sm" onClick={() => setShowModal(false)}><X size={15}/></button>
            </div>
            <form onSubmit={createTask} style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div className="form-group">
                <label className="form-label">Task Title *</label>
                <input className="form-input" placeholder="e.g. Study 2 hours for exam" value={form.title}
                  onChange={e => setForm({...form, title:e.target.value})} required/>
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-textarea" placeholder="Optional notes..." value={form.description}
                  onChange={e => setForm({...form, description:e.target.value})}/>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select className="form-select" value={form.category} onChange={e => setForm({...form, category:e.target.value})}>
                    {CATEGORIES.filter(c=>c!=='all').map(c => (
                      <option key={c} value={c}>{CAT_ICONS[c]} {c}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Priority</label>
                  <select className="form-select" value={form.priority} onChange={e => setForm({...form, priority:e.target.value})}>
                    {PRIORITIES.map(p => <option key={p} value={p} style={{ textTransform:'capitalize' }}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Due Date (Optional)</label>
                <input className="form-input" type="date" value={form.dueDate} onChange={e => setForm({...form, dueDate:e.target.value})}/>
              </div>
              <div style={{ display:'flex', gap:8, justifyContent:'flex-end', marginTop:4 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary"><Plus size={14}/>Create Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
