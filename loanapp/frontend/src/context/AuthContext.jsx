import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('rcr_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('rcr_token');
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.data?.user) {
            setUser(res.data.user);
            localStorage.setItem('rcr_user', JSON.stringify(res.data.user));
          }
        } catch (e) {
          console.warn('Auth validation failed', e);
          setUser(null);
          localStorage.removeItem('rcr_token');
          localStorage.removeItem('rcr_user');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (loginId, password) => {
    const res = await api.post('/auth/login', { login: loginId, password });
    if (res.data?.token) {
      localStorage.setItem('rcr_token', res.data.token);
      localStorage.setItem('rcr_user', JSON.stringify(res.data.user));
      setUser(res.data.user);
    }
    return res.data;
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    if (res.data?.token) {
      localStorage.setItem('rcr_token', res.data.token);
      localStorage.setItem('rcr_user', JSON.stringify(res.data.user));
      setUser(res.data.user);
    }
    return res.data;
  };

  const updateUser = (updatedData) => {
    setUser((prev) => {
      const merged = { ...prev, ...updatedData };
      localStorage.setItem('rcr_user', JSON.stringify(merged));
      return merged;
    });
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // ignore
    } finally {
      localStorage.removeItem('rcr_token');
      localStorage.removeItem('rcr_user');
      setUser(null);
    }
  };

  const setAuthSession = (token, user) => {
    localStorage.setItem('rcr_token', token);
    localStorage.setItem('rcr_user', JSON.stringify(user));
    setUser(user);
  };

  const hasPermission = (permissionKey) => {
    if (!user) return false;
    if (user.role === 'super_admin') return true;
    const perms = Array.isArray(user.effective_permissions) ? user.effective_permissions : [];
    return perms.includes(permissionKey);
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      updateUser,
      setAuthSession,
      logout,
      isStaff: user?.role !== 'customer',
      isSuperAdmin: user?.role === 'super_admin',
      hasPermission
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
