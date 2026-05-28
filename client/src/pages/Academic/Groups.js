import React, { useState, useEffect } from 'react';
import { Plus, Users, Copy, X, ArrowRight, Hash } from 'lucide-react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Groups() {
  const [groups,    setGroups]    = useState([]);
  const [showCreate,setShowCreate]= useState(false);
  const [showJoin,  setShowJoin]  = useState(false);
  const [createForm,setCreateForm]= useState({ name:'', description:'' });
  const [joinCode,  setJoinCode]  = useState('');
  const { user } = useAuth();
  const navigate  = useNavigate();

  useEffect(() => { api.get('/groups').then(r=>setGroups(r.data)).catch(()=>{}); }, []);

  const createGroup = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/groups', createForm);
      setGroups(prev=>[...prev, res.data]);
      setShowCreate(false);
      setCreateForm({ name:'', description:'' });
      toast.success('Group created! 🎓');
    } catch { toast.error('Failed to create group'); }
  };

  const joinGroup = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/groups/join', { inviteCode: joinCode.toUpperCase() });
      setGroups(prev=>[...prev, res.data]);
      setShowJoin(false);
      setJoinCode('');
      toast.success('Joined group! 🎉');
    } catch (err) { toast.error(err.response?.data?.message || 'Invalid code'); }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success('Code copied!');
  };

  const GROUP_COLORS = ['#8b5cf6','#10b981','#f59e0b','#ec4899','#06b6d4','#f43f5e'];

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Academic Groups</h1>
          <p className="page-subtitle">Compete and collaborate with your squad</p>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button className="btn btn-secondary" onClick={()=>setShowJoin(true)}><Hash size={15}/>Join with Code</button>
          <button className="btn btn-primary"   onClick={()=>setShowCreate(true)}><Plus size={15}/>Create Group</button>
        </div>
      </div>

      {groups.length === 0 ? (
        <div className="empty-state">
          <Users size={52}/>
          <h3>No groups yet</h3>
          <p>Create a group and invite friends, or enter an invite code</p>
          <div style={{ display:'flex', gap:10, justifyContent:'center', marginTop:14 }}>
            <button className="btn btn-secondary" onClick={()=>setShowJoin(true)}>Join with Code</button>
            <button className="btn btn-primary"   onClick={()=>setShowCreate(true)}><Plus size={15}/>Create Group</button>
          </div>
        </div>
      ) : (
        <div className="grid-auto">
          {groups.map((g, gi) => {
            const isAdmin = g.admin?._id === user?._id;
            const accent  = GROUP_COLORS[gi % GROUP_COLORS.length];
            return (
              <div key={g._id} className="card card-hover" style={{ cursor:'pointer', borderTop:`3px solid ${accent}` }}
                onClick={()=>navigate(`/groups/${g._id}`)}>
                <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:14 }}>
                  <div style={{ width:46, height:46, borderRadius:13, background:`${accent}18`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.3rem', border:`1px solid ${accent}25` }}>
                    🎓
                  </div>
                  {isAdmin && <span className="badge badge-primary">Admin</span>}
                </div>
                <h3 style={{ fontWeight:700, fontSize:'0.95rem', marginBottom:4 }}>{g.name}</h3>
                {g.description && <p style={{ fontSize:'0.78rem', color:'var(--text-muted)', marginBottom:10, lineHeight:1.5 }}>{g.description}</p>}

                <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:12 }}>
                  {g.members?.slice(0,4).map((m,i) => (
                    <div key={i} className="avatar" style={{ width:26, height:26, fontSize:'0.68rem', marginLeft: i>0?-8:0, border:'2px solid var(--bg-card)', background:`linear-gradient(135deg, ${GROUP_COLORS[(gi+i)%GROUP_COLORS.length]}, ${GROUP_COLORS[(gi+i+1)%GROUP_COLORS.length]})` }}>
                      {m.name?.charAt(0)}
                    </div>
                  ))}
                  <span style={{ fontSize:'0.74rem', color:'var(--text-muted)', marginLeft:4 }}>
                    {g.members?.length}/{g.maxMembers} members
                  </span>
                </div>

                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', paddingTop:10, borderTop:'1px solid var(--border)' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                    <span style={{ fontSize:'0.7rem', color:'var(--text-dim)', fontFamily:'monospace', fontWeight:700, letterSpacing:'0.12em', background:'var(--bg)', padding:'2px 8px', borderRadius:5 }}>
                      {g.inviteCode}
                    </span>
                    <button className="btn btn-icon btn-secondary btn-sm"
                      onClick={e=>{ e.stopPropagation(); copyCode(g.inviteCode); }}>
                      <Copy size={11}/>
                    </button>
                  </div>
                  <ArrowRight size={15} color={accent}/>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="modal-overlay" onClick={()=>setShowCreate(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Create Group</h3>
              <button className="btn btn-icon btn-secondary btn-sm" onClick={()=>setShowCreate(false)}><X size={15}/></button>
            </div>
            <form onSubmit={createGroup} style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div className="form-group">
                <label className="form-label">Group Name *</label>
                <input className="form-input" placeholder="e.g. NEET Warriors 2025" value={createForm.name}
                  onChange={e=>setCreateForm({...createForm,name:e.target.value})} required/>
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-textarea" placeholder="What is this group about?" value={createForm.description}
                  onChange={e=>setCreateForm({...createForm,description:e.target.value})}/>
              </div>
              <div style={{ padding:'10px 13px', background:'rgba(139,92,246,0.06)', border:'1px solid rgba(139,92,246,0.15)', borderRadius:9, fontSize:'0.78rem', color:'var(--text-muted)' }}>
                💡 You'll be the admin. A 6-character invite code is generated automatically. Max 4 members.
              </div>
              <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={()=>setShowCreate(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary"><Plus size={14}/>Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Join Modal */}
      {showJoin && (
        <div className="modal-overlay" onClick={()=>setShowJoin(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Join Group</h3>
              <button className="btn btn-icon btn-secondary btn-sm" onClick={()=>setShowJoin(false)}><X size={15}/></button>
            </div>
            <form onSubmit={joinGroup} style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div className="form-group">
                <label className="form-label">6-Digit Invite Code</label>
                <input className="form-input" placeholder="e.g. PRO482" value={joinCode}
                  onChange={e=>setJoinCode(e.target.value.toUpperCase())} maxLength={6} required
                  style={{ fontSize:'1.4rem', letterSpacing:'0.3em', textTransform:'uppercase', fontWeight:800, textAlign:'center', fontFamily:'monospace' }}/>
              </div>
              <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={()=>setShowJoin(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Join Group</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
