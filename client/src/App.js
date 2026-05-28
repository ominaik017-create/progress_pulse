import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';

import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Dashboard from './pages/Personal/Dashboard';
import Tasks from './pages/Personal/Tasks';
import Habits from './pages/Personal/Habits';
import Analytics from './pages/Personal/Analytics';
import Countdown from './pages/Personal/Countdown';
import Notifications from './pages/Personal/Notifications';
import Settings from './pages/Personal/Settings';
import Groups from './pages/Academic/Groups';
import GroupDetail from './pages/Academic/GroupDetail';
import Challenges from './pages/Public/Challenges';
import ChallengeDetail from './pages/Public/ChallengeDetail';
import AdminPanel from './pages/Admin/AdminPanel';

const PAGE_TITLES = {
  '/': 'Dashboard',
  '/tasks': 'Tasks',
  '/habits': 'Habits',
  '/countdown': 'Countdown',
  '/analytics': 'Analytics',
  '/notifications': 'Notifications',
  '/settings': 'Settings',
  '/groups': 'Academic Groups',
  '/challenges': 'Public Challenges',
  '/admin': 'Admin Panel',
};

function ProtectedLayout() {
  const { user } = useAuth();
  const [mode, setMode] = useState('personal');

  if (!user) return <Navigate to="/login" replace />;

  const path = window.location.pathname;
  const title = PAGE_TITLES[path] || 'ProgressPulse';

  return (
    <div className="app-layout">
      <Sidebar mode={mode} setMode={setMode} />
      <div className="main-content">
        <Topbar mode={mode} setMode={setMode} title={title} />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/habits" element={<Habits />} />
          <Route path="/countdown" element={<Countdown />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/groups" element={<Groups />} />
          <Route path="/groups/:id" element={<GroupDetail />} />
          <Route path="/challenges" element={<Challenges />} />
          <Route path="/challenges/:id" element={<ChallengeDetail />} />
          {user.role === 'admin' && <Route path="/admin" element={<AdminPanel />} />}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
      <Route path="/*" element={<ProtectedLayout />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background:'#1a1a2e', color:'#e2e8f0', border:'1px solid #2a2a4a', borderRadius:12 },
            success: { iconTheme: { primary:'#10b981', secondary:'white' } },
            error: { iconTheme: { primary:'#ef4444', secondary:'white' } },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}
