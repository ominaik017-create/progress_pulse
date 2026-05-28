import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Mail, Lock, Eye, EyeOff, Zap } from 'lucide-react';

export default function Login() {
  const [form,    setForm]    = useState({ email:'', password:'' });
  const [show,    setShow]    = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back! 👋');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo">
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10, marginBottom:8 }}>
            <div style={{ width:46, height:46, borderRadius:13, background:'linear-gradient(135deg, #7c3aed, #ec4899)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 0 20px rgba(124,58,237,0.4)' }}>
              <Zap size={22} color="white" fill="white"/>
            </div>
            <h1>ProgressPulse</h1>
          </div>
          <p style={{ color:'var(--text-muted)', fontSize:'0.82rem' }}>Your Smart Productivity Ecosystem</p>
        </div>

        <h2 style={{ fontSize:'1.2rem', fontWeight:800, marginBottom:4, fontFamily:'Plus Jakarta Sans, sans-serif' }}>Sign in</h2>
        <p style={{ color:'var(--text-muted)', fontSize:'0.82rem', marginBottom:22 }}>Welcome back — let's get productive</p>

        <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <div className="input-icon">
              <Mail size={14}/>
              <input className="form-input" type="email" placeholder="you@example.com"
                value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required/>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position:'relative' }}>
              <div className="input-icon">
                <Lock size={14}/>
                <input className="form-input" type={show?'text':'password'} placeholder="••••••••"
                  value={form.password} onChange={e=>setForm({...form,password:e.target.value})}
                  required style={{ paddingRight:40 }}/>
              </div>
              <button type="button" onClick={()=>setShow(!show)}
                style={{ position:'absolute', right:11, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'var(--text-dim)' }}>
                {show?<EyeOff size={15}/>:<Eye size={15}/>}
              </button>
            </div>
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading}
            style={{ width:'100%', justifyContent:'center', marginTop:4, padding:'10px' }}>
            {loading ? 'Signing in...' : 'Sign In →'}
          </button>
        </form>

        <div className="divider"/>
        <p style={{ textAlign:'center', fontSize:'0.82rem', color:'var(--text-muted)' }}>
          No account? <Link to="/register" style={{ color:'var(--primary-light)', fontWeight:700 }}>Create one free</Link>
        </p>

        {/* Demo hint */}
        <div style={{ marginTop:18, padding:'12px 14px', background:'var(--bg)', borderRadius:10, border:'1px solid var(--border)' }}>
          <p style={{ fontSize:'0.68rem', color:'var(--text-dim)', marginBottom:5, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em' }}>🔑 Demo Admin</p>
          <p style={{ fontSize:'0.78rem', color:'var(--text-muted)' }}>admin@progresspulse.com · admin123</p>
        </div>
      </div>
    </div>
  );
}
