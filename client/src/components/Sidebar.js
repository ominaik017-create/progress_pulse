import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, CheckSquare, Flame, Calendar, BarChart3, Users, Globe, Bell, Settings, LogOut, Zap } from 'lucide-react';

const NAV = [
  { section: 'Personal Mode', items: [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: CheckSquare,     label: 'Tasks',     path: '/tasks' },
    { icon: Flame,           label: 'Habits',    path: '/habits' },
    { icon: Calendar,        label: 'Countdown', path: '/countdown' },
    { icon: BarChart3,       label: 'Analytics', path: '/analytics' },
  ]},
  { section: 'Academic Mode', items: [
    { icon: Users, label: 'My Groups', path: '/groups' },
  ]},
  { section: 'Public Mode', items: [
    { icon: Globe, label: 'Public Challenges', path: '/challenges' },
  ]},
  { section: 'Account', items: [
    { icon: Bell,     label: 'Notifications', path: '/notifications' },
    { icon: Settings, label: 'Settings',      path: '/settings' },
  ]},
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <Zap size={17} color="white" fill="white" />
        </div>
        <div className="sidebar-logo-text">
          <h1>ProgressPulse</h1>
          <span>Smart Productivity</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        {NAV.map(section => (
          <div className="nav-section" key={section.section}>
            <div className="nav-label">{section.section}</div>
            {section.items.map(item => (
              <button
                key={item.path}
                className={`nav-item ${pathname === item.path ? 'active' : ''}`}
                onClick={() => navigate(item.path)}
              >
                <item.icon size={16} />
                {item.label}
              </button>
            ))}
          </div>
        ))}

        {user?.role === 'admin' && (
          <div className="nav-section">
            <div className="nav-label">Admin</div>
            <button className={`nav-item ${pathname === '/admin' ? 'active' : ''}`} onClick={() => navigate('/admin')}>
              <Settings size={16} /> Admin Panel
            </button>
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="avatar" style={{ background: `linear-gradient(135deg, ${user?.avatar || '#7c3aed'}, #a78bfa)` }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: '0.82rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
            <div style={{ fontSize: '0.67rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{user?.role}</div>
          </div>
        </div>
        <button className="btn btn-secondary btn-sm" style={{ width: '100%', justifyContent: 'center' }} onClick={logout}>
          <LogOut size={13} /> Sign Out
        </button>
      </div>
    </aside>
  );
}
