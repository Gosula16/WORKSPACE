import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/apiClient';
const AuthContext = createContext();

export function AuthProvider({ children }){
  const [user, setUser] = useState(() => {
    const s = localStorage.getItem('auth');
    return s ? JSON.parse(s).user : null;
  });

  useEffect(() => {
    // optionally refresh token logic
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('auth', JSON.stringify({ accessToken: data.accessToken, user: data.user }));
    setUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('auth');
    setUser(null);
  };

  const register = async (payload) => {
    return api.post('/auth/register', payload);
  };

  return <AuthContext.Provider value={{ user, login, logout, register }}>{children}</AuthContext.Provider>;
}

export function useAuth(){
  return useContext(AuthContext);
}
