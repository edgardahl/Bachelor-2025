// src/context/AuthProvider.jsx
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from '../api/axiosInstance';
import { AuthContext } from './AuthContext';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    axios
      .get('/auth/me')
      .then(res => {
        console.log('[AuthProvider] ✅ Authenticated user:', res.data.user);
        setUser(res.data.user);
      })
      .catch(err => {
        // Avoid console spam on login page
        if (location.pathname !== '/login') {
          console.warn('[AuthProvider] ❌ Not authenticated:', err?.response?.data || err.message);
        }
        setUser(null);
      })
      .finally(() => {
        console.log('[AuthProvider] 🟡 Finished loading');
        setLoading(false);
      });
  }, [location.pathname]);

  // ✅ Logout function (clears cookie + localStorage)
  const logout = async () => {
    try {
      await axios.post('/auth/logout'); // Clears refresh token cookie
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('accessToken');
      setUser(null);
      window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
