import React, { createContext, useContext, useState } from 'react';
import api from '../utils/api';
const AuthContext = createContext();
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try { const s = localStorage.getItem('pp_user'); return s ? JSON.parse(s) : null; }
    catch { return null; }
  });
  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('pp_token', res.data.token);
    localStorage.setItem('pp_user', JSON.stringify(res.data.user));
    setUser(res.data.user); return res.data;
  };
  const register = async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });
    localStorage.setItem('pp_token', res.data.token);
    localStorage.setItem('pp_user', JSON.stringify(res.data.user));
    setUser(res.data.user); return res.data;
  };
  const logout = () => {
    localStorage.removeItem('pp_token'); localStorage.removeItem('pp_user'); setUser(null);
  };
  const updateUser = (updated) => {
    const merged = { ...user, ...updated };
    localStorage.setItem('pp_user', JSON.stringify(merged)); setUser(merged);
  };
  return <AuthContext.Provider value={{ user, login, register, logout, updateUser }}>{children}</AuthContext.Provider>;
};
export const useAuth = () => useContext(AuthContext);
