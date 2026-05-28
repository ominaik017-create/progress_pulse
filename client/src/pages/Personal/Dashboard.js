import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle, Clock, Target, Flame, TrendingUp, Plus, Sparkles, RefreshCw, Circle } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler } from 'chart.js';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

function CircularProgress({ value = 0, size = 110, stroke = 9 }) {
  const r   = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (Math.min(value,100) / 100) * circ;
  const color = value >= 70 ? '#10b981' : value >= 40 ? '#f59e0b' : '#f43f5e';
  return (
    <div className="circular-progress" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--border)" strokeWidth={stroke}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition:'stroke-dashoffset 0.8s ease' }}/>
      </svg>
      <div className="circular-progress-text">
        <div style={{ fontSize:'1.5rem', fontWeight:900, color, fontFamily:'Plus Jakarta Sans, sans-serif' }}>{value}%</div>
        <div style={{ fontSize:'0.6rem', color:'var(--text-muted)', marginTop:1 }}>Today</div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats,      setStats]      = useState({ total:0, completed:0, pending:0, productivity:0 });
  const [tasks,      setTasks]      = useState([]);
  const [weekly,     setWeekly]     = useState([]);
  const [quote,      setQuote]      = useState('');
  const [quoteLoad,  setQuoteLoad]  = useState(false);
  const [countdowns, setCountdowns] = useState([]);
  const [loading,    setLoading]    = useState(true);

  const fetchQuote = useCallback(async () => {
    setQuoteLoad(true);
    try {
      const r = await api.get('/ai/motivation');
      setQuote(r.data.quote);
    } catch { setQuote('Push yourself — no one else will do it for you.'); }
    finally  { setQuoteLoad(false); }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [s, t, w, c] = await Promise.all([
          api.get('/tasks/today-stats'),
          api.get('/tasks?status=pending'),
          api.get('/analytics/weekly'),
          api.get('/notifications/countdowns'),
        ]);
        setStats(s.data);
        setTasks(t.data.slice(0,5));
        setWeekly(w.data);
        setCountdowns(c.data.slice(0,3));
      } catch(e) { console.error(e); }
      finally { setLoading(false); }
    })();
    fetchQuote();
  }, [fetchQuote]);

  const completeTask = async (id) => {
    try {
      await api.put(`/tasks/${id}`, { status:'completed' });
      setTasks(prev => prev.filter(t => t._id !== id));
      setStats(s => {
        const completed = s.completed + 1;
        return { ...s, completed, pending: s.pending-1, productivity: s.total>0 ? Math.round((completed/s.total)*100) : 0 };
      });
      toast.success('Task completed! 🎉');
    } catch { toast.error('Failed'); }
  };

  const chartData = {
    labels: weekly.map(d => d.date),
    datasets:[{
      label:'Productivity %',
      data: weekly.map(d => d.productivity),
      fill: true,
      borderColor:'#8b5cf6',
      backgroundColor:'rgba(139,92,246,0.08)',
      tension: 0.4,
      pointBackgroundColor:'#8b5cf6',
      pointRadius: 4, pointHoverRadius: 6,
    }],
  };
  const chartOpts = {
    responsive:true, maintainAspectRatio:false,
    plugins:{ legend:{ display:false } },
    scales:{
      x:{ grid:{ color:'rgba(255,255,255,0.04)' }, ticks:{ color:'#4a5568', font:{ size:11 } } },
      y:{ grid:{ color:'rgba(255,255,255,0.04)' }, ticks:{ color:'#4a5568', font:{ size:11 } }, min:0, max:100 },
    },
  };

  const getDaysLeft = (d) => Math.max(0, Math.ceil((new Date(d)-new Date())/(1000*60*60*24)));

  const STATS = [
    { label:'Total Tasks',  value: stats.total,       icon: Target,       color:'#8b5cf6', bg:'rgba(139,92,246,0.12)' },
    { label:'Completed',    value: stats.completed,   icon: CheckCircle,  color:'#10b981', bg:'rgba(16,185,129,0.12)' },
    { label:'Pending',      value: stats.pending,     icon: Clock,        color:'#f59e0b', bg:'rgba(245,158,11,0.12)' },
    { label:'Day Streak',   value: user?.streak || 0, icon: Flame,        color:'#f43f5e', bg:'rgba(244,63,94,0.12)'  },
  ];

  if (loading) return <div className="spinner"/>;

  const greeting = new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening';

  return (
    <div className="page-content">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Good {greeting}, {user?.name?.split(' ')[0]}! 👋</h1>
          <p className="page-subtitle">Here's your productivity snapshot for today</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/tasks')}>
          <Plus size={15}/> New Task
        </button>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid" style={{ marginBottom:18 }}>
        {STATS.map(s => (
          <div className="stat-card" key={s.label}>
            <div className="stat-icon" style={{ background: s.bg }}>
              <s.icon size={18} color={s.color}/>
            </div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Row 2: Productivity + AI */}
      <div className="grid-2" style={{ marginBottom:18 }}>
        {/* Productivity ring */}
        <div className="card" style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div>
              <h3 style={{ fontWeight:700, fontSize:'1rem', marginBottom:3 }}>Today's Productivity</h3>
              <p style={{ fontSize:'0.78rem', color:'var(--text-muted)' }}>{stats.completed}/{stats.total} tasks completed</p>
            </div>
            <CircularProgress value={stats.productivity}/>
          </div>
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
              <span style={{ fontSize:'0.72rem', color:'var(--text-muted)' }}>Progress</span>
              <span style={{ fontSize:'0.72rem', fontWeight:700, color:'var(--primary-light)' }}>{stats.productivity}%</span>
            </div>
            <div className="progress-bar"><div className="progress-fill" style={{ width:`${stats.productivity}%` }}/></div>
          </div>
        </div>

        {/* Right column */}
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {/* AI quote */}
          <div className="ai-quote">
            <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:10 }}>
              <div style={{ flex:1 }}>
                <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:8 }}>
                  <Sparkles size={13} color="var(--primary-light)"/>
                  <span style={{ fontSize:'0.65rem', fontWeight:700, color:'var(--primary-light)', textTransform:'uppercase', letterSpacing:'0.12em' }}>AI Motivation</span>
                </div>
                <p style={{ fontSize:'0.85rem', lineHeight:1.65, color:'var(--text)', fontStyle:'italic' }}>
                  {quoteLoad ? 'Generating...' : quote || 'Push yourself — no one else will do it for you.'}
                </p>
              </div>
              <button className="btn btn-icon btn-secondary btn-sm" onClick={fetchQuote} style={{ flexShrink:0 }}>
                <RefreshCw size={13} style={{ animation: quoteLoad ? 'spin 0.7s linear infinite' : 'none' }}/>
              </button>
            </div>
          </div>

          {/* Countdowns */}
          {countdowns.length > 0 && (
            <div className="card card-sm">
              <h4 style={{ fontWeight:700, fontSize:'0.82rem', marginBottom:9, color:'var(--text-muted)' }}>⏰ UPCOMING</h4>
              <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                {countdowns.map(c => (
                  <div key={c._id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'7px 10px', background:'var(--bg)', borderRadius:7, borderLeft:`2px solid ${c.color}` }}>
                    <span style={{ fontSize:'0.82rem', fontWeight:500 }}>{c.title}</span>
                    <span style={{ fontSize:'0.82rem', fontWeight:800, color: getDaysLeft(c.targetDate)<=3 ? 'var(--danger)' : c.color }}>
                      {getDaysLeft(c.targetDate)}d left
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Weekly chart */}
      <div className="card" style={{ marginBottom:18 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
          <TrendingUp size={17} color="var(--primary-light)"/>
          <h3 style={{ fontWeight:700, fontSize:'0.95rem' }}>Weekly Performance</h3>
        </div>
        <div style={{ height:180 }}>
          {weekly.length > 0
            ? <Line data={chartData} options={chartOpts}/>
            : <div style={{ textAlign:'center', color:'var(--text-muted)', paddingTop:60, fontSize:'0.85rem' }}>Add tasks to see analytics</div>
          }
        </div>
      </div>

      {/* Pending tasks */}
      <div className="card">
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
          <h3 style={{ fontWeight:700, fontSize:'0.95rem' }}>Pending Tasks</h3>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/tasks')}>View All</button>
        </div>
        {tasks.length === 0 ? (
          <div style={{ textAlign:'center', padding:'28px 0', color:'var(--text-muted)' }}>
            <CheckCircle size={36} style={{ margin:'0 auto 10px', color:'var(--success)', opacity:0.5 }}/>
            <p style={{ fontSize:'0.85rem' }}>All caught up! 🎉</p>
          </div>
        ) : tasks.map(task => (
          <div key={task._id} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 0', borderBottom:'1px solid var(--border)' }}>
            <button onClick={() => completeTask(task._id)}
              style={{ width:20, height:20, borderRadius:'50%', border:'2px solid var(--border)', background:'none', cursor:'pointer', flexShrink:0, transition:'all 0.15s' }}
              onMouseEnter={e => { e.target.style.borderColor='var(--success)'; e.target.style.background='rgba(16,185,129,0.1)'; }}
              onMouseLeave={e => { e.target.style.borderColor='var(--border)';  e.target.style.background='none'; }}
            />
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontWeight:500, fontSize:'0.85rem', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{task.title}</div>
              <div style={{ fontSize:'0.7rem', color:'var(--text-muted)', textTransform:'capitalize', marginTop:1 }}>{task.category}</div>
            </div>
            <span className={`badge ${task.priority==='high'?'badge-danger':task.priority==='medium'?'badge-warning':'badge-info'}`}>
              {task.priority}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
