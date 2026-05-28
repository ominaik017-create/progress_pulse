import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { User, Mail, Lock, Zap } from 'lucide-react';

export default function Register() {
  const [form,    setForm]    = useState({ name:'', email:'', password:'', confirm:'' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) return toast.error('Passwords do not match');
    if (form.password.length < 6)       return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success('Account created! Welcome 🎉');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10, marginBottom:8 }}>
            <div style={{ width:46, height:46, borderRadius:13, background:'linear-gradient(135deg, #7c3aed, #ec4899)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 0 20px rgba(124,58,237,0.4)' }}>
              <Zap size={22} color="white" fill="white"/>
            </div>
            <h1>ProgressPulse</h1>
          </div>
          <p style={{ color:'var(--text-muted)', fontSize:'0.82rem' }}>Join thousands of productive people</p>
        </div>

        <h2 style={{ fontSize:'1.2rem', fontWeight:800, marginBottom:4, fontFamily:'Plus Jakarta Sans, sans-serif' }}>Create account</h2>
        <p style={{ color:'var(--text-muted)', fontSize:'0.82rem', marginBottom:22 }}>Free forever · No credit card required</p>

        <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:13 }}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div className="input-icon"><User size={14}/><input className="form-input" placeholder="Omkar Naik" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required/></div>
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <div className="input-icon"><Mail size={14}/><input className="form-input" type="email" placeholder="you@example.com" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required/></div>
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-icon"><Lock size={14}/><input className="form-input" type="password" placeholder="Min 6 characters" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required/></div>
          </div>
          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <div className="input-icon"><Lock size={14}/><input className="form-input" type="password" placeholder="Repeat password" value={form.confirm} onChange={e=>setForm({...form,confirm:e.target.value})} required/></div>
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading}
            style={{ width:'100%', justifyContent:'center', marginTop:4, padding:'10px' }}>
            {loading ? 'Creating...' : 'Create Account →'}
          </button>
        </form>

        <div className="divider"/>
        <p style={{ textAlign:'center', fontSize:'0.82rem', color:'var(--text-muted)' }}>
          Already have an account? <Link to="/login" style={{ color:'var(--primary-light)', fontWeight:700 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
