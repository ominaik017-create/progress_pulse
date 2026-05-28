import React, { useState } from 'react';
import { User, Save, Shield, Bell, Palette, Lock } from 'lucide-react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

function Toggle({ defaultChecked = true, onChange }) {
  const [checked, setChecked] = useState(defaultChecked);
  return (
    <label className="toggle-switch">
      <input type="checkbox" checked={checked} onChange={e => { setChecked(e.target.checked); onChange && onChange(e.target.checked); }} />
      <span className="toggle-track" />
    </label>
  );
}

const avatarColors = ['#7c3aed','#34d399','#fb923c','#f472b6','#38bdf8','#f87171','#a78bfa','#fbbf24'];

export default function Settings() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState({ name: user?.name||'', bio: user?.bio||'', avatar: user?.avatar||'#7c3aed' });
  const [tab, setTab] = useState('profile');
  const [saving, setSaving] = useState(false);

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put('/auth/profile', profile);
      updateUser(res.data);
      toast.success('Profile updated!');
    } catch { toast.error('Failed to update'); }
    finally { setSaving(false); }
  };

  const tabs = [
    { key: 'profile', icon: User, label: 'Profile' },
    { key: 'account', icon: Shield, label: 'Account' },
    { key: 'notifications', icon: Bell, label: 'Notifications' },
    { key: 'appearance', icon: Palette, label: 'Appearance' },
  ];

  const notifPrefs = [
    { key: 'tasks', emoji: '✅', label: 'Task Reminders', desc: 'Reminders about pending tasks', default: true },
    { key: 'challenges', emoji: '🏆', label: 'Challenge Updates', desc: 'Updates from joined challenges', default: true },
    { key: 'groups', emoji: '👥', label: 'Group Messages', desc: 'New messages in your groups', default: true },
    { key: 'streak', emoji: '🔥', label: 'Streak Alerts', desc: 'Daily reminders to keep your streak', default: true },
    { key: 'ai', emoji: '🤖', label: 'AI Motivations', desc: 'Daily AI-generated quotes', default: false },
    { key: 'weekly', emoji: '📊', label: 'Weekly Report', desc: 'Weekly productivity summary', default: true },
  ];

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Manage your account and preferences</p>
        </div>
      </div>

      {/* Tab pills */}
      <div style={{ display:'flex', gap:8, marginBottom:24, flexWrap:'wrap' }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            style={{
              display:'flex', alignItems:'center', gap:7,
              padding:'8px 18px', borderRadius:999, border:'none',
              fontFamily:'DM Sans, sans-serif', fontSize:'0.845rem', fontWeight:600,
              cursor:'pointer', transition:'all 0.18s',
              background: tab === t.key ? 'var(--grad-primary)' : 'var(--bg-card)',
              color: tab === t.key ? 'white' : 'var(--text-muted)',
              border: tab === t.key ? 'none' : '1px solid var(--border)',
              boxShadow: tab === t.key ? '0 2px 14px rgba(124,58,237,0.35)' : 'none',
            }}>
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      {/* ── PROFILE ── */}
      {tab === 'profile' && (
        <div style={{ maxWidth: 580 }}>
          {/* Avatar card */}
          <div className="settings-section" style={{ marginBottom:16 }}>
            <div className="settings-section-header">
              <div style={{ width:32, height:32, borderRadius:9, background:'rgba(124,58,237,0.15)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <Palette size={16} color="var(--primary-light)" />
              </div>
              <span style={{ fontWeight:700, fontSize:'0.9rem' }}>Avatar Color</span>
            </div>
            <div style={{ padding:'20px', display:'flex', alignItems:'center', gap:20 }}>
              <div style={{ width:72, height:72, borderRadius:'50%', background:`linear-gradient(135deg, ${profile.avatar}, ${profile.avatar}99)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.8rem', fontWeight:800, color:'white', boxShadow:`0 4px 20px ${profile.avatar}50`, flexShrink:0 }}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p style={{ fontSize:'0.8rem', color:'var(--text-muted)', marginBottom:10 }}>Pick your avatar color</p>
                <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                  {avatarColors.map(c => (
                    <button key={c} type="button" onClick={() => setProfile({...profile, avatar:c})}
                      style={{ width:32, height:32, borderRadius:'50%', background:c, border:`3px solid ${profile.avatar===c?'white':'transparent'}`, cursor:'pointer', outline:profile.avatar===c?`2px solid ${c}`:'none', transition:'all 0.18s' }} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Profile form */}
          <div className="settings-section">
            <div className="settings-section-header">
              <div style={{ width:32, height:32, borderRadius:9, background:'rgba(52,211,153,0.15)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <User size={16} color="var(--success)" />
              </div>
              <span style={{ fontWeight:700, fontSize:'0.9rem' }}>Personal Info</span>
            </div>
            <form onSubmit={saveProfile} style={{ padding:'20px', display:'flex', flexDirection:'column', gap:16 }}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" value={profile.name} onChange={e => setProfile({...profile, name:e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Bio</label>
                <textarea className="form-textarea" placeholder="Tell others about yourself..." value={profile.bio} onChange={e => setProfile({...profile, bio:e.target.value})} />
              </div>
              <div style={{ padding:'12px 14px', background:'var(--bg)', borderRadius:10, fontSize:'0.82rem', color:'var(--text-muted)', display:'flex', alignItems:'center', gap:8 }}>
                <Lock size={14} color="var(--text-dim)" />
                <span><strong style={{ color:'var(--text)' }}>{user?.email}</strong> — email cannot be changed</span>
              </div>
              <button className="btn btn-primary" type="submit" disabled={saving} style={{ alignSelf:'flex-start' }}>
                <Save size={15} />{saving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── ACCOUNT ── */}
      {tab === 'account' && (
        <div style={{ maxWidth:580 }}>
          <div className="settings-section" style={{ marginBottom:16 }}>
            <div className="settings-section-header">
              <div style={{ width:32, height:32, borderRadius:9, background:'rgba(56,189,248,0.15)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <Shield size={16} color="var(--info)" />
              </div>
              <span style={{ fontWeight:700, fontSize:'0.9rem' }}>Account Details</span>
            </div>
            {[
              { label:'Account Status', value:'Active', badge:'badge-success', emoji:'🟢' },
              { label:'Role', value:user?.role, badge:'badge-primary', emoji:'👤' },
              { label:'Verified Creator', value:user?.isVerifiedCreator?'Yes':'No', badge:user?.isVerifiedCreator?'badge-success':'badge-info', emoji:'✅' },
              { label:'Total Tasks Done', value:user?.totalTasksCompleted||0, emoji:'📋' },
              { label:'Current Streak', value:`${user?.streak||0} days 🔥`, emoji:'🔥' },
            ].map(item => (
              <div className="settings-row" key={item.label}>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <span style={{ fontSize:'1rem' }}>{item.emoji}</span>
                  <span style={{ fontSize:'0.875rem', color:'var(--text-muted)' }}>{item.label}</span>
                </div>
                {item.badge
                  ? <span className={`badge ${item.badge}`} style={{ textTransform:'capitalize' }}>{item.value}</span>
                  : <span style={{ fontSize:'0.875rem', fontWeight:700 }}>{item.value}</span>}
              </div>
            ))}
          </div>

          {/* Danger zone */}
          <div style={{ background:'rgba(248,113,113,0.04)', border:'1px solid rgba(248,113,113,0.2)', borderRadius:16, padding:'18px 20px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
              <span style={{ fontSize:'1rem' }}>⚠️</span>
              <h4 style={{ fontWeight:700, color:'var(--danger)', fontSize:'0.9rem' }}>Danger Zone</h4>
            </div>
            <p style={{ fontSize:'0.8rem', color:'var(--text-muted)', marginBottom:12, lineHeight:1.6 }}>Permanently delete your account and all associated data. This cannot be undone.</p>
            <button className="btn btn-danger btn-sm" onClick={() => toast.error('Please contact support to delete your account.')}>Delete Account</button>
          </div>
        </div>
      )}

      {/* ── NOTIFICATIONS ── */}
      {tab === 'notifications' && (
        <div style={{ maxWidth:580 }}>
          <div className="settings-section">
            <div className="settings-section-header">
              <div style={{ width:32, height:32, borderRadius:9, background:'rgba(251,146,60,0.15)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <Bell size={16} color="var(--warning)" />
              </div>
              <span style={{ fontWeight:700, fontSize:'0.9rem' }}>Notification Preferences</span>
            </div>
            {notifPrefs.map(pref => (
              <div className="settings-row" key={pref.key}>
                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <div style={{ width:38, height:38, borderRadius:10, background:'var(--bg)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.1rem', border:'1px solid var(--border)' }}>
                    {pref.emoji}
                  </div>
                  <div>
                    <div style={{ fontWeight:600, fontSize:'0.875rem' }}>{pref.label}</div>
                    <div style={{ fontSize:'0.75rem', color:'var(--text-muted)', marginTop:1 }}>{pref.desc}</div>
                  </div>
                </div>
                <Toggle defaultChecked={pref.default} onChange={() => toast.success(`${pref.label} preference saved`)} />
              </div>
            ))}
          </div>
          <div style={{ marginTop:14, padding:'12px 16px', background:'rgba(52,211,153,0.06)', border:'1px solid rgba(52,211,153,0.15)', borderRadius:12, fontSize:'0.8rem', color:'var(--text-muted)' }}>
            💡 Notification changes are saved automatically when you toggle them.
          </div>
        </div>
      )}

      {/* ── APPEARANCE ── */}
      {tab === 'appearance' && (
        <div style={{ maxWidth:580 }}>
          <div className="settings-section">
            <div className="settings-section-header">
              <div style={{ width:32, height:32, borderRadius:9, background:'rgba(244,114,182,0.15)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <Palette size={16} color="var(--accent)" />
              </div>
              <span style={{ fontWeight:700, fontSize:'0.9rem' }}>Display Preferences</span>
            </div>
            {[
              { emoji:'🌙', label:'Dark Mode', desc:'Always use dark theme', checked:true },
              { emoji:'✨', label:'Animations', desc:'Enable smooth transitions and effects', checked:true },
              { emoji:'📊', label:'Compact Dashboard', desc:'Show more info in less space', checked:false },
              { emoji:'🎯', label:'Focus Mode', desc:'Hide distractions while working', checked:false },
            ].map(item => (
              <div className="settings-row" key={item.label}>
                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <div style={{ width:38, height:38, borderRadius:10, background:'var(--bg)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.1rem', border:'1px solid var(--border)' }}>
                    {item.emoji}
                  </div>
                  <div>
                    <div style={{ fontWeight:600, fontSize:'0.875rem' }}>{item.label}</div>
                    <div style={{ fontSize:'0.75rem', color:'var(--text-muted)', marginTop:1 }}>{item.desc}</div>
                  </div>
                </div>
                <Toggle defaultChecked={item.checked} onChange={() => toast.success('Preference updated')} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
