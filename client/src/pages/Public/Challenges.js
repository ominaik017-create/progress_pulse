import React, { useState, useEffect } from 'react';
import { Plus, Globe, Users, Clock, Star, X, ChevronRight, Search } from 'lucide-react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const CAT_ICONS  = { fitness:'💪', study:'📚', coding:'💻', reading:'📖', meditation:'🧘', diet:'🥗', other:'🎯' };
const CAT_COLORS = { fitness:'#f43f5e', study:'#8b5cf6', coding:'#10b981', reading:'#f59e0b', meditation:'#ec4899', diet:'#06b6d4', other:'#a78bfa' };
const CATEGORIES = ['all','fitness','study','coding','reading','meditation','diet','other'];

export default function Challenges() {
  const [challenges,   setChallenges]   = useState([]);
  const [myChallenges, setMyChallenges] = useState([]);
  const [tab,          setTab]          = useState('browse');
  const [showCreate,   setShowCreate]   = useState(false);
  const [filter,       setFilter]       = useState('all');
  const [search,       setSearch]       = useState('');
  const [form, setForm] = useState({ title:'', description:'', category:'fitness', benefits:'', duration:30, maxParticipants:50, tasks:[{title:'',points:10}], isPublic:true });
  const { user } = useAuth();
  const navigate  = useNavigate();

  useEffect(() => {
    api.get('/challenges/public').then(r=>setChallenges(r.data)).catch(()=>{});
    api.get('/challenges/my').then(r=>setMyChallenges(r.data)).catch(()=>{});
  }, []);

  const joinChallenge = async (id) => {
    try {
      await api.post(`/challenges/${id}/join`);
      const res = await api.get('/challenges/my');
      setMyChallenges(res.data);
      toast.success('Joined! 🎉');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const createChallenge = async (e) => {
    e.preventDefault();
    try {
      await api.post('/challenges', form);
      toast.success(form.isPublic ? 'Submitted for review! ✅' : 'Challenge created!');
      setShowCreate(false);
      const res = await api.get('/challenges/my');
      setMyChallenges(res.data);
    } catch { toast.error('Failed to create'); }
  };

  const isJoined = (id) => myChallenges.some(c => c._id===id);

  const filtered = challenges
    .filter(c => filter==='all' || c.category===filter)
    .filter(c => !search || c.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Public Challenges</h1>
          <p className="page-subtitle">Join expert-led productivity programs</p>
        </div>
        {(user?.isVerifiedCreator||user?.role==='admin') && (
          <button className="btn btn-primary" onClick={()=>setShowCreate(true)}><Plus size={15}/>Create Challenge</button>
        )}
      </div>

      <div className="tabs" style={{ marginBottom:18 }}>
        <button className={`tab ${tab==='browse'?'active':''}`} onClick={()=>setTab('browse')}>🌍 Browse</button>
        <button className={`tab ${tab==='joined'?'active':''}`} onClick={()=>setTab('joined')}>✅ Joined ({myChallenges.length})</button>
        {!user?.isVerifiedCreator && user?.role!=='admin' && (
          <button className={`tab ${tab==='apply'?'active':''}`} onClick={()=>setTab('apply')}>🎓 Become Creator</button>
        )}
      </div>

      {tab==='browse' && (
        <>
          {/* Search + filters */}
          <div style={{ display:'flex', gap:10, marginBottom:16, flexWrap:'wrap', alignItems:'center' }}>
            <div className="input-icon" style={{ flex:'1 1 200px' }}>
              <Search size={14}/>
              <input className="form-input" placeholder="Search challenges..." value={search}
                onChange={e=>setSearch(e.target.value)} style={{ paddingLeft:34 }}/>
            </div>
            <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
              {CATEGORIES.map(c=>(
                <button key={c} onClick={()=>setFilter(c)}
                  style={{ padding:'5px 12px', borderRadius:6, border:`1px solid ${filter===c?(CAT_COLORS[c]||'var(--primary)'):'var(--border)'}`,
                    background: filter===c ? `${CAT_COLORS[c]||'var(--primary)'}15` : 'var(--bg-card)',
                    color: filter===c ? (CAT_COLORS[c]||'var(--primary-light)') : 'var(--text-muted)',
                    fontSize:'0.74rem', fontWeight:600, cursor:'pointer', transition:'all 0.15s' }}>
                  {c!=='all' && CAT_ICONS[c]} {c}
                </button>
              ))}
            </div>
          </div>

          {filtered.length===0 ? (
            <div className="empty-state"><Globe size={52}/><h3>No challenges found</h3><p>Try a different filter or check back later</p></div>
          ) : (
            <div className="grid-auto">
              {filtered.map(ch => {
                const joined = isJoined(ch._id);
                const color  = CAT_COLORS[ch.category]||'#8b5cf6';
                return (
                  <div key={ch._id} className="challenge-card">
                    <div className="challenge-banner" style={{ background:`linear-gradient(135deg, ${color}dd, ${color}66)` }}>
                      <span style={{ fontSize:'2.8rem' }}>{CAT_ICONS[ch.category]||'🎯'}</span>
                    </div>
                    <div className="challenge-body">
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:7 }}>
                        <span className="badge" style={{ background:`${color}18`, color }}>{ch.category}</span>
                        <span style={{ fontSize:'0.7rem', color:'var(--text-dim)', display:'flex', alignItems:'center', gap:3 }}><Clock size={11}/>{ch.duration}d</span>
                      </div>
                      <h3 style={{ fontWeight:700, marginBottom:5, fontSize:'0.95rem', fontFamily:'Plus Jakarta Sans, sans-serif' }}>{ch.title}</h3>
                      <p style={{ fontSize:'0.78rem', color:'var(--text-muted)', marginBottom:11, lineHeight:1.5 }}>
                        {ch.description?.substring(0,90)}{ch.description?.length>90?'...':''}
                      </p>
                      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12, paddingBottom:10, borderBottom:'1px solid var(--border)' }}>
                        <div className="avatar" style={{ width:24, height:24, fontSize:'0.66rem' }}>{ch.creator?.name?.charAt(0)}</div>
                        <span style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>{ch.creator?.name}</span>
                      </div>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:11 }}>
                        <span style={{ fontSize:'0.74rem', color:'var(--text-muted)', display:'flex', alignItems:'center', gap:3 }}>
                          <Users size={12}/>{ch.participants?.filter(p=>p.status==='accepted').length||0}/{ch.maxParticipants}
                        </span>
                        <span style={{ fontSize:'0.74rem', color:'var(--warning)', display:'flex', alignItems:'center', gap:3 }}>
                          <Star size={12} fill="currentColor"/>{ch.tasks?.length||0} tasks
                        </span>
                      </div>
                      <div style={{ display:'flex', gap:7 }}>
                        <button className="btn btn-secondary btn-sm" style={{ flex:1 }} onClick={()=>navigate(`/challenges/${ch._id}`)}>
                          Details <ChevronRight size={13}/>
                        </button>
                        <button className={`btn btn-sm ${joined?'btn-success':'btn-primary'}`} style={{ flex:1 }}
                          onClick={()=>!joined&&joinChallenge(ch._id)} disabled={joined}>
                          {joined?'✓ Joined':'Join'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {tab==='joined' && (
        myChallenges.length===0 ? (
          <div className="empty-state"><Star size={52}/><h3>No challenges joined yet</h3>
            <button className="btn btn-primary" style={{ marginTop:14 }} onClick={()=>setTab('browse')}>Browse Challenges</button>
          </div>
        ) : (
          <div className="grid-auto">
            {myChallenges.map(ch => {
              const color = CAT_COLORS[ch.category]||'#8b5cf6';
              const myP   = ch.participants?.find(p=>p.user===user._id||p.user?._id===user._id);
              return (
                <div key={ch._id} className="challenge-card" onClick={()=>navigate(`/challenges/${ch._id}`)} style={{ cursor:'pointer' }}>
                  <div className="challenge-banner" style={{ background:`linear-gradient(135deg, ${color}cc, ${color}66)`, height:80 }}>
                    <span style={{ fontSize:'2.2rem' }}>{CAT_ICONS[ch.category]||'🎯'}</span>
                  </div>
                  <div className="challenge-body">
                    <h3 style={{ fontWeight:700, fontSize:'0.95rem', marginBottom:6 }}>{ch.title}</h3>
                    <div style={{ display:'flex', justifyContent:'space-between' }}>
                      <span className="badge badge-primary" style={{ textTransform:'capitalize' }}>{myP?.status||'joined'}</span>
                      <span style={{ fontSize:'0.82rem', fontWeight:800, color }}>Score: {myP?.score||0}pts</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {tab==='apply' && (
        <div className="card" style={{ maxWidth:580, margin:'0 auto', textAlign:'center', padding:'40px 32px' }}>
          <div style={{ fontSize:'4rem', marginBottom:16 }}>🎓</div>
          <h2 style={{ fontWeight:800, fontSize:'1.4rem', marginBottom:8, fontFamily:'Plus Jakarta Sans, sans-serif' }}>Become a Verified Creator</h2>
          <p style={{ color:'var(--text-muted)', marginBottom:24, lineHeight:1.7, fontSize:'0.875rem' }}>
            Are you a gym trainer, teacher, or mentor? Get verified to create public challenges and reach thousands of users on ProgressPulse.
          </p>
          <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:24, textAlign:'left' }}>
            {['Submit professional documents','Admin verifies credentials','Get verified creator badge','Create unlimited public challenges','Track participant progress'].map((s,i)=>(
              <div key={i} style={{ display:'flex', alignItems:'center', gap:11, padding:'9px 13px', background:'var(--bg)', borderRadius:9 }}>
                <div style={{ width:26, height:26, borderRadius:'50%', background:'linear-gradient(135deg, var(--primary-dark), var(--primary))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.75rem', fontWeight:800, color:'white', flexShrink:0 }}>{i+1}</div>
                <span style={{ fontSize:'0.84rem' }}>{s}</span>
              </div>
            ))}
          </div>
          <p style={{ fontSize:'0.8rem', color:'var(--text-muted)' }}>Contact: <strong style={{ color:'var(--primary-light)' }}>admin@progresspulse.com</strong></p>
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="modal-overlay" onClick={()=>setShowCreate(false)}>
          <div className="modal" style={{ maxWidth:540 }} onClick={e=>e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Create Public Challenge</h3>
              <button className="btn btn-icon btn-secondary btn-sm" onClick={()=>setShowCreate(false)}><X size={15}/></button>
            </div>
            <form onSubmit={createChallenge} style={{ display:'flex', flexDirection:'column', gap:13 }}>
              <div className="form-group"><label className="form-label">Title *</label>
                <input className="form-input" placeholder="e.g. 30-Day Fat Loss Program" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} required/></div>
              <div className="form-group"><label className="form-label">Description *</label>
                <textarea className="form-textarea" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} required placeholder="What participants will achieve..."/></div>
              <div className="form-group"><label className="form-label">Benefits</label>
                <input className="form-input" value={form.benefits} onChange={e=>setForm({...form,benefits:e.target.value})} placeholder="Key benefits..."/></div>
              <div className="grid-2">
                <div className="form-group"><label className="form-label">Category</label>
                  <select className="form-select" value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>
                    {Object.keys(CAT_ICONS).map(c=><option key={c} value={c}>{CAT_ICONS[c]} {c}</option>)}
                  </select></div>
                <div className="form-group"><label className="form-label">Duration (days)</label>
                  <input className="form-input" type="number" min={1} max={365} value={form.duration} onChange={e=>setForm({...form,duration:parseInt(e.target.value)})}/></div>
              </div>
              <div className="form-group">
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:7 }}>
                  <label className="form-label" style={{ marginBottom:0 }}>Tasks</label>
                  <button type="button" className="btn btn-sm btn-secondary" onClick={()=>setForm({...form,tasks:[...form.tasks,{title:'',points:10}]})}>
                    <Plus size={12}/>Add Task
                  </button>
                </div>
                {form.tasks.map((t,i)=>(
                  <div key={i} style={{ display:'flex', gap:7, marginBottom:7 }}>
                    <input className="form-input" placeholder={`Task ${i+1}`} value={t.title}
                      onChange={e=>{const ts=[...form.tasks];ts[i].title=e.target.value;setForm({...form,tasks:ts});}} style={{ flex:1 }} required/>
                    <input className="form-input" type="number" min={1} value={t.points}
                      onChange={e=>{const ts=[...form.tasks];ts[i].points=parseInt(e.target.value);setForm({...form,tasks:ts});}} style={{ width:65 }} placeholder="pts"/>
                    {form.tasks.length>1 && <button type="button" className="btn btn-icon btn-danger btn-sm" onClick={()=>setForm({...form,tasks:form.tasks.filter((_,j)=>j!==i)})}><X size={12}/></button>}
                  </div>
                ))}
              </div>
              <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={()=>setShowCreate(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary"><Plus size={14}/>Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
