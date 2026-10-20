import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, logoutUser } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('uniassist_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('uniassist_user');
  });
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const data = await getCurrentUser();
      if (data && data.authenticated && data.user) {
        setUser(data.user);
        setIsAuthenticated(true);
        localStorage.setItem('uniassist_user', JSON.stringify(data.user));
      } else {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('uniassist_user');
      }
    } catch (err) {
      console.warn('Auth check failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('uniassist_user', JSON.stringify(userData));
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch (e) {
      console.warn('Logout API error:', e);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('uniassist_user');
      localStorage.removeItem('uniassist_current_chat');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        checkAuth,
        login,
        logout,
        setUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
