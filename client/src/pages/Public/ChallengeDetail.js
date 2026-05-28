import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Clock, Trophy, CheckCircle, Circle } from 'lucide-react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const CATEGORY_ICONS = { fitness:'💪', study:'📚', coding:'💻', reading:'📖', meditation:'🧘', diet:'🥗', other:'🎯' };

export default function ChallengeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [challenge, setChallenge] = useState(null);

  useEffect(() => {
    api.get(`/challenges/${id}`).then(r => setChallenge(r.data)).catch(() => navigate('/challenges'));
  }, [id]);

  const joinChallenge = async () => {
    try {
      await api.post(`/challenges/${id}/join`);
      const res = await api.get(`/challenges/${id}`);
      setChallenge(res.data);
      toast.success('Joined successfully!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const completeTask = async (taskId) => {
    try {
      await api.put(`/challenges/${id}/complete-task`, { taskId });
      const res = await api.get(`/challenges/${id}`);
      setChallenge(res.data);
      toast.success('Task completed! Points earned! 🎉');
    } catch { toast.error('Failed'); }
  };

  if (!challenge) return <div className="spinner"/>;

  const myP = challenge.participants?.find(p => p.user?._id === user._id || p.user === user._id);
  const isJoined = !!myP;
  const leaderboard = [...(challenge.participants||[])].filter(p=>p.status==='accepted').sort((a,b)=>(b.score||0)-(a.score||0));
  const totalPossible = challenge.tasks?.reduce((a,t)=>a+(t.points||10),0) || 0;
  const myScore = myP?.score || 0;
  const scorePercent = totalPossible > 0 ? Math.round((myScore/totalPossible)*100) : 0;

  return (
    <div className="page-content">
      <button className="btn btn-secondary btn-sm" style={{ marginBottom:20 }} onClick={() => navigate('/challenges')}><ArrowLeft size={16}/>Back</button>

      {/* Header Banner */}
      <div style={{ background:`linear-gradient(135deg, rgba(99,102,241,0.3), rgba(129,140,248,0.1))`, border:'1px solid rgba(99,102,241,0.2)', borderRadius:20, padding:'28px 28px', marginBottom:20, display:'flex', alignItems:'center', gap:20 }}>
        <div style={{ fontSize:'4rem' }}>{CATEGORY_ICONS[challenge.category]||'🎯'}</div>
        <div style={{ flex:1 }}>
          <div style={{ display:'flex', gap:10, marginBottom:8, flexWrap:'wrap' }}>
            <span className="badge badge-primary" style={{ textTransform:'capitalize' }}>{challenge.category}</span>
            <span className={`badge ${challenge.status==='active'?'badge-success':'badge-warning'}`}>{challenge.status}</span>
            {challenge.isPublic && <span className="badge badge-info">🌍 Public</span>}
          </div>
          <h1 style={{ fontSize:'1.6rem', fontWeight:800, marginBottom:6 }}>{challenge.title}</h1>
          <p style={{ color:'var(--text-muted)', fontSize:'0.9rem', lineHeight:1.6 }}>{challenge.description}</p>
          <div style={{ display:'flex', gap:20, marginTop:12, flexWrap:'wrap' }}>
            <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:'0.82rem', color:'var(--text-muted)' }}><Users size={14}/>{challenge.participants?.filter(p=>p.status==='accepted').length||0}/{challenge.maxParticipants} participants</div>
            <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:'0.82rem', color:'var(--text-muted)' }}><Clock size={14}/>{challenge.duration} days</div>
            <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:'0.82rem', color:'var(--text-muted)' }}><Trophy size={14}/>{challenge.tasks?.length||0} tasks · {totalPossible} pts total</div>
          </div>
        </div>
        <div>
          {!isJoined ? (
            <button className="btn btn-primary" onClick={joinChallenge}>Join Challenge</button>
          ) : (
            <div style={{ textAlign:'center' }}>
              <div style={{ fontSize:'0.78rem', color:'var(--text-muted)', marginBottom:4 }}>Your Score</div>
              <div style={{ fontSize:'2rem', fontWeight:900, color:'var(--primary-light)' }}>{myScore}<span style={{ fontSize:'1rem', color:'var(--text-muted)' }}>pts</span></div>
              <div style={{ fontSize:'0.75rem', color:'var(--success)' }}>{scorePercent}% complete</div>
            </div>
          )}
        </div>
      </div>

      <div className="grid-2">
        {/* Tasks */}
        <div>
          <h3 style={{ fontWeight:700, marginBottom:14 }}>Challenge Tasks</h3>
          {challenge.tasks?.length === 0 ? (
            <div className="card" style={{ textAlign:'center', color:'var(--text-muted)', padding:40 }}>No tasks defined</div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {challenge.tasks?.map(task => {
                const done = myP?.completedTasks?.includes(task._id);
                return (
                  <div key={task._id} className="card card-sm" style={{ display:'flex', alignItems:'center', gap:12, borderLeft:`3px solid ${done?'var(--success)':'var(--border)'}` }}>
                    <button onClick={() => isJoined && !done && completeTask(task._id)}
                      style={{ background:'none', border:'none', cursor:isJoined&&!done?'pointer':'default', color:done?'var(--success)':'var(--border)', flexShrink:0 }}>
                      {done ? <CheckCircle size={22}/> : <Circle size={22}/>}
                    </button>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:600, fontSize:'0.875rem', textDecoration:done?'line-through':'none', opacity:done?0.6:1 }}>{task.title}</div>
                      {task.description && <div style={{ fontSize:'0.75rem', color:'var(--text-muted)', marginTop:2 }}>{task.description}</div>}
                    </div>
                    <span className="badge badge-warning">+{task.points}pts</span>
                  </div>
                );
              })}
            </div>
          )}

          {challenge.benefits && (
            <div className="card" style={{ marginTop:16, borderLeft:'3px solid var(--success)' }}>
              <h4 style={{ fontWeight:700, marginBottom:8, fontSize:'0.875rem' }}>✨ Benefits</h4>
              <p style={{ fontSize:'0.85rem', color:'var(--text-muted)', lineHeight:1.6 }}>{challenge.benefits}</p>
            </div>
          )}
        </div>

        {/* Leaderboard */}
        <div>
          <h3 style={{ fontWeight:700, marginBottom:14 }}>Leaderboard</h3>
          <div className="card">
            {leaderboard.length === 0 ? (
              <div style={{ textAlign:'center', color:'var(--text-muted)', padding:20 }}>No participants yet</div>
            ) : leaderboard.map((p, idx) => (
              <div key={idx} className="leaderboard-item" style={{ marginBottom:8 }}>
                <div className={`rank ${idx<3?`rank-${idx+1}`:''}`} style={idx>=3?{background:'var(--bg)',color:'var(--text-muted)',fontSize:'0.8rem'}:{}}>
                  {idx<3?['🥇','🥈','🥉'][idx]:idx+1}
                </div>
                <div className="avatar">{p.user?.name?.charAt(0)||'?'}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:600, fontSize:'0.875rem' }}>
                    {p.user?.name||'Unknown'}
                    {(p.user?._id===user._id||p.user===user._id) && <span className="badge badge-primary" style={{ marginLeft:6, fontSize:'0.6rem' }}>You</span>}
                  </div>
                  <div style={{ fontSize:'0.72rem', color:'var(--text-muted)' }}>{p.completedTasks?.length||0} tasks done</div>
                </div>
                <div style={{ fontWeight:800, color:'var(--primary-light)', fontSize:'1.1rem' }}>{p.score||0}</div>
              </div>
            ))}
          </div>

          {/* Creator info */}
          <div className="card" style={{ marginTop:16 }}>
            <h4 style={{ fontWeight:700, marginBottom:12, fontSize:'0.875rem' }}>About the Creator</h4>
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <div className="avatar avatar-lg">{challenge.creator?.name?.charAt(0)}</div>
              <div>
                <div style={{ fontWeight:700 }}>{challenge.creator?.name}</div>
                <span className="badge badge-success" style={{ marginTop:4 }}>✓ Verified Creator</span>
                {challenge.creator?.bio && <p style={{ fontSize:'0.78rem', color:'var(--text-muted)', marginTop:6 }}>{challenge.creator.bio}</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
