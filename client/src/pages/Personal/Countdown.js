import React, { useState, useEffect } from 'react';
import { Plus, Trash2, X, Calendar, CheckCircle } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const TYPES   = ['exam','meeting','deadline','event','other'];
const COLORS  = ['#8b5cf6','#10b981','#f59e0b','#ec4899','#06b6d4','#f43f5e','#a78bfa'];
const MONTHS  = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const HOURS   = Array.from({length:24},(_,i)=>i);
const MINUTES = ['0','15','30','45'];
const TYPE_EMOJI = { exam:'📝', meeting:'🤝', deadline:'⏰', event:'🎉', other:'📌' };

function DayTimeline({ targetDate, createdAt, color }) {
  const start = new Date(createdAt); start.setHours(0,0,0,0);
  const end   = new Date(targetDate);
  const today = new Date(); today.setHours(0,0,0,0);
  const totalDays = Math.max(1, Math.ceil((end - start)/(1000*60*60*24)));
  const showDays  = Math.min(totalDays, 60);

  const circles = Array.from({length: showDays}, (_, i) => {
    const day = new Date(start); day.setDate(start.getDate()+i);
    const isPast  = day < today;
    const isToday = day.getTime() === today.getTime();
    return { day, isPast, isToday, num: i+1 };
  });

  const showLabel = (c) => c.num===1 || c.num%5===0 || c.isToday || c.num===showDays;

  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
        <span style={{ fontSize:'0.7rem', fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.1em' }}>
          Day-by-Day Progress · {totalDays} days total
        </span>
        <div style={{ display:'flex', gap:12 }}>
          {[{color:'var(--success)',label:'Done'},{color:'var(--warning)',label:'Today'},{color:'var(--border-light)',label:'Upcoming'}].map(l=>(
            <div key={l.label} style={{ display:'flex', alignItems:'center', gap:4 }}>
              <div style={{ width:8, height:8, borderRadius:'50%', background:l.color }}/>
              <span style={{ fontSize:'0.62rem', color:'var(--text-dim)', fontWeight:600 }}>{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="timeline-track" style={{ gap:0 }}>
        {circles.map((c, idx) => (
          <React.Fragment key={idx}>
            {idx > 0 && (
              <div style={{ height:2, minWidth:10, flex:1, background: circles[idx-1].isPast ? color : 'var(--border)', alignSelf:'center', marginBottom:22, flexShrink:0 }} />
            )}
            <div className="timeline-day">
              <div className={`timeline-circle ${c.isPast?'done':c.isToday?'today':'future'}`}
                style={c.isPast ? {background:color, borderColor:color, boxShadow:`0 0 8px ${color}60`} : c.isToday ? {borderColor:color} : {}}
                title={c.day.toLocaleDateString('en-IN',{day:'numeric',month:'short'})}>
                {c.isPast
                  ? <CheckCircle size={13} strokeWidth={2.5}/>
                  : c.isToday ? <span style={{fontSize:'0.55rem',fontWeight:900}}>NOW</span>
                  : <span style={{fontSize:'0.6rem'}}>{c.num}</span>}
              </div>
              {showLabel(c) && (
                <div className="timeline-day-label" style={{ color: c.isToday ? 'var(--warning)' : 'var(--text-dim)', fontWeight: c.isToday ? 800 : 600 }}>
                  {c.isToday ? 'TODAY' : `D${c.num}`}
                </div>
              )}
            </div>
          </React.Fragment>
        ))}
        {totalDays > 60 && (
          <div style={{ fontSize:'0.7rem', color:'var(--text-dim)', whiteSpace:'nowrap', alignSelf:'center', marginLeft:10, marginBottom:22 }}>
            +{totalDays-60} more
          </div>
        )}
      </div>
    </div>
  );
}

export default function Countdown() {
  const [countdowns, setCountdowns] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [now, setNow] = useState(new Date());
  const [form, setForm] = useState({ title:'', day:'', month:'', year:'', hour:'9', minute:'0', type:'exam', color:'#8b5cf6' });

  useEffect(() => {
    api.get('/notifications/countdowns').then(r=>setCountdowns(r.data)).catch(()=>{});
    const t = setInterval(()=>setNow(new Date()), 30000);
    return ()=>clearInterval(t);
  }, []);

  const create = async (e) => {
    e.preventDefault();
    const { title, day, month, year, hour, minute, type, color } = form;
    if (!day||!month||!year) return toast.error('Please fill in the complete date');
    if (+year<2024||+year>2100) return toast.error('Enter a valid year (2024–2100)');
    if (+month<1||+month>12)   return toast.error('Month must be between 1–12');
    if (+day<1||+day>31)       return toast.error('Day must be between 1–31');
    const targetDate = new Date(+year, +month-1, +day, +hour, +minute);
    if (isNaN(targetDate.getTime())) return toast.error('Invalid date entered');
    if (targetDate <= new Date())    return toast.error('Date must be in the future');
    try {
      const res = await api.post('/notifications/countdowns', { title, targetDate, type, color });
      setCountdowns(prev=>[...prev, res.data]);
      setShowModal(false);
      setForm({ title:'', day:'', month:'', year:'', hour:'9', minute:'0', type:'exam', color:'#8b5cf6' });
      toast.success('Countdown added! 🎯');
    } catch { toast.error('Failed to save'); }
  };

  const remove = async (id) => {
    try {
      await api.delete(`/notifications/countdowns/${id}`);
      setCountdowns(prev=>prev.filter(c=>c._id!==id));
    } catch { toast.error('Failed'); }
  };

  const getTimeLeft = (td) => {
    const diff = new Date(td) - now;
    if (diff <= 0) return { days:0, hours:0, minutes:0, expired:true };
    return {
      days:    Math.floor(diff/(1000*60*60*24)),
      hours:   Math.floor((diff%(1000*60*60*24))/(1000*60*60)),
      minutes: Math.floor((diff%(1000*60*60))/(1000*60)),
      expired: false
    };
  };

  const urgencyColor = (days, color) => {
    if (days<=1) return 'var(--danger)';
    if (days<=3) return 'var(--warning)';
    return color;
  };

  const elapsed = (c) => {
    const total = new Date(c.targetDate) - new Date(c.createdAt);
    const done  = now - new Date(c.createdAt);
    return Math.min(100, Math.max(0, Math.round((done/total)*100)));
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Countdown Timers</h1>
          <p className="page-subtitle">Track every single day towards your important events</p>
        </div>
        <button className="btn btn-primary" onClick={()=>setShowModal(true)}><Plus size={15}/>Add Countdown</button>
      </div>

      {countdowns.length === 0 ? (
        <div className="empty-state">
          <Calendar size={52}/>
          <h3>No countdowns yet</h3>
          <p>Add exams, deadlines or events to track day-by-day</p>
          <button className="btn btn-primary" style={{marginTop:14}} onClick={()=>setShowModal(true)}><Plus size={15}/>Add Countdown</button>
        </div>
      ) : (
        <div style={{display:'flex', flexDirection:'column', gap:14}}>
          {countdowns.map(c => {
            const {days, hours, minutes, expired} = getTimeLeft(c.targetDate);
            const pct = elapsed(c);

            return (
              <div key={c._id} className="card" style={{borderLeft:`3px solid ${c.color}`}}>
                {/* Header row */}
                <div style={{display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12}}>
                  <div style={{flex:1}}>
                    <div style={{display:'flex', alignItems:'center', gap:7, marginBottom:5}}>
                      <span style={{fontSize:'1.2rem'}}>{TYPE_EMOJI[c.type]||'📌'}</span>
                      <span className="badge badge-primary" style={{textTransform:'capitalize', background:`${c.color}18`, color:c.color}}>{c.type}</span>
                      {!expired && days<=3 && <span className="badge badge-danger">🔥 Very soon!</span>}
                    </div>
                    <h3 style={{fontWeight:800, fontSize:'1.1rem', marginBottom:3, fontFamily:'Plus Jakarta Sans, sans-serif'}}>{c.title}</h3>
                    <p style={{fontSize:'0.75rem', color:'var(--text-muted)'}}>
                      {new Date(c.targetDate).toLocaleDateString('en-IN',{weekday:'long', year:'numeric', month:'long', day:'numeric'})}
                    </p>
                  </div>

                  {/* Countdown boxes */}
                  <div style={{display:'flex', gap:6, flexShrink:0, alignItems:'flex-start'}}>
                    {!expired ? (
                      [{v:days,l:'Days'},{v:hours,l:'Hrs'},{v:minutes,l:'Min'}].map(({v,l})=>(
                        <div key={l} style={{textAlign:'center', background:'var(--bg)', borderRadius:10, padding:'8px 10px', minWidth:52, border:`1px solid ${c.color}25`}}>
                          <div style={{fontSize:'1.7rem', fontWeight:900, lineHeight:1, color: l==='Days' ? urgencyColor(days,c.color) : c.color, fontFamily:'Plus Jakarta Sans, sans-serif'}}>
                            {String(v).padStart(2,'0')}
                          </div>
                          <div style={{fontSize:'0.56rem', color:'var(--text-dim)', marginTop:3, textTransform:'uppercase', letterSpacing:'0.08em', fontWeight:700}}>{l}</div>
                        </div>
                      ))
                    ) : (
                      <div style={{padding:'8px 16px', background:'var(--bg-hover)', borderRadius:8, color:'var(--text-dim)', fontWeight:700, fontSize:'0.85rem'}}>Expired</div>
                    )}
                    <button className="btn btn-icon btn-danger btn-sm" style={{marginLeft:4}} onClick={()=>remove(c._id)}><Trash2 size={13}/></button>
                  </div>
                </div>

                {/* Progress bar */}
                {!expired && (
                  <div style={{marginTop:14}}>
                    <div style={{display:'flex', justifyContent:'space-between', marginBottom:5}}>
                      <span style={{fontSize:'0.68rem', color:'var(--text-dim)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em'}}>Time elapsed</span>
                      <span style={{fontSize:'0.72rem', fontWeight:700, color:c.color}}>{pct}%</span>
                    </div>
                    <div className="progress-bar" style={{height:5}}>
                      <div className="progress-fill" style={{width:`${pct}%`, background:`linear-gradient(90deg, ${c.color}cc, ${c.color})`}}/>
                    </div>
                  </div>
                )}

                {/* Timeline — always visible */}
                {!expired && <DayTimeline targetDate={c.targetDate} createdAt={c.createdAt} color={c.color}/>}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={()=>setShowModal(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Add Countdown</h3>
              <button className="btn btn-icon btn-secondary btn-sm" onClick={()=>setShowModal(false)}><X size={15}/></button>
            </div>
            <form onSubmit={create} style={{display:'flex', flexDirection:'column', gap:14}}>

              <div className="form-group">
                <label className="form-label">Event Name *</label>
                <input className="form-input" placeholder="e.g. Final Exam, Project Deadline" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} required/>
              </div>

              <div className="form-group">
                <label className="form-label">Target Date *</label>
                <div style={{display:'grid', gridTemplateColumns:'1fr 1.5fr 1.1fr', gap:8}}>
                  {[
                    {placeholder:'Day', field:'day', min:1, max:31, label:'DAY'},
                    {label:'MONTH', isSelect:true},
                    {placeholder:'Year', field:'year', min:2024, max:2100, label:'YEAR'},
                  ].map((f,i)=> f.isSelect ? (
                    <div key={i}>
                      <select className="form-select" value={form.month} onChange={e=>setForm({...form,month:e.target.value})} required style={{textAlign:'center'}}>
                        <option value="">Month</option>
                        {MONTHS.map((m,mi)=><option key={m} value={mi+1}>{m}</option>)}
                      </select>
                      <div style={{fontSize:'0.6rem',color:'var(--text-dim)',textAlign:'center',marginTop:4,fontWeight:700,letterSpacing:'0.06em'}}>MONTH</div>
                    </div>
                  ) : (
                    <div key={i}>
                      <input className="form-input" type="number" placeholder={f.placeholder} min={f.min} max={f.max}
                        value={form[f.field]} onChange={e=>setForm({...form,[f.field]:e.target.value})} required
                        style={{textAlign:'center', fontWeight:700}}/>
                      <div style={{fontSize:'0.6rem',color:'var(--text-dim)',textAlign:'center',marginTop:4,fontWeight:700,letterSpacing:'0.06em'}}>{f.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Time (Optional)</label>
                <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8}}>
                  <div>
                    <select className="form-select" value={form.hour} onChange={e=>setForm({...form,hour:e.target.value})}>
                      {HOURS.map(h=><option key={h} value={h}>{String(h).padStart(2,'0')}:00 {h<12?'AM':'PM'}</option>)}
                    </select>
                    <div style={{fontSize:'0.6rem',color:'var(--text-dim)',textAlign:'center',marginTop:4,fontWeight:700,letterSpacing:'0.06em'}}>HOUR</div>
                  </div>
                  <div>
                    <select className="form-select" value={form.minute} onChange={e=>setForm({...form,minute:e.target.value})}>
                      {MINUTES.map(m=><option key={m} value={m}>:{String(m).padStart(2,'0')}</option>)}
                    </select>
                    <div style={{fontSize:'0.6rem',color:'var(--text-dim)',textAlign:'center',marginTop:4,fontWeight:700,letterSpacing:'0.06em'}}>MINUTE</div>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Type</label>
                <select className="form-select" value={form.type} onChange={e=>setForm({...form,type:e.target.value})}>
                  {TYPES.map(t=><option key={t} value={t}>{TYPE_EMOJI[t]} {t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Color</label>
                <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
                  {COLORS.map(col=>(
                    <button key={col} type="button" onClick={()=>setForm({...form,color:col})}
                      style={{width:32, height:32, borderRadius:'50%', background:col,
                        border:`3px solid ${form.color===col?'white':'transparent'}`,
                        cursor:'pointer', outline:form.color===col?`2px solid ${col}`:'none', transition:'all 0.15s'}}/>
                  ))}
                </div>
              </div>

              {form.day && form.month && form.year && (
                <div style={{padding:'9px 13px', background:`${form.color}12`, border:`1px solid ${form.color}30`, borderRadius:8, fontSize:'0.8rem', color:form.color, fontWeight:600}}>
                  {TYPE_EMOJI[form.type]} {form.day} {MONTHS[+form.month-1]} {form.year} at {String(form.hour).padStart(2,'0')}:{String(form.minute).padStart(2,'0')}
                </div>
              )}

              <div style={{display:'flex', gap:8, justifyContent:'flex-end', marginTop:4}}>
                <button type="button" className="btn btn-secondary" onClick={()=>setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary"><Plus size={14}/>Add Countdown</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
