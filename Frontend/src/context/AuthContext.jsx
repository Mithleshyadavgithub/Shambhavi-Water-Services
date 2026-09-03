import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('sws_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('sws_theme') || 'light';
  });

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.remove('light-mode');
    }
    localStorage.setItem('sws_theme', theme);
  }, [theme]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token, user: userData } = res.data;
      localStorage.setItem('sws_token', token);
      localStorage.setItem('sws_user', JSON.stringify(userData));
      setUser(userData);
      return { success: true, user: userData };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (data) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/register', data);
      const { token, user: userData } = res.data;
      localStorage.setItem('sws_token', token);
      localStorage.setItem('sws_user', JSON.stringify(userData));
      setUser(userData);
      return { success: true, user: userData };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Registration failed' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('sws_token');
    localStorage.removeItem('sws_user');
    setUser(null);
  };

  const updateUser = (userData) => {
    // Merge new user data with existing
    const updatedUser = { ...user, ...userData };
    localStorage.setItem('sws_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const isAdmin = user?.role === 'admin';
  const isManager = user?.role === 'manager';
  const isDelivery = user?.role === 'delivery';
  const isCustomer = user?.role === 'customer';

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, isAdmin, isManager, isDelivery, isCustomer, theme, toggleTheme }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
