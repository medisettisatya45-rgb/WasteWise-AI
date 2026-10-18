import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('wastewise_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('wastewise_token');
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    if (!localStorage.getItem('wastewise_token')) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    try {
      const freshUser = await authService.getMe();
      setUser(freshUser);
      localStorage.setItem('wastewise_user', JSON.stringify(freshUser));
    } catch {
      setUser(null);
      setToken(null);
      localStorage.removeItem('wastewise_token');
      localStorage.removeItem('wastewise_user');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();

    const handleAuthChange = () => {
      const curToken = localStorage.getItem('wastewise_token');
      setToken(curToken);
      if (!curToken) {
        setUser(null);
      }
    };

    window.addEventListener('auth-change', handleAuthChange);
    return () => window.removeEventListener('auth-change', handleAuthChange);
  }, []);

  const login = async (email: string, password: string) => {
    const res = await authService.login({ email, password });
    localStorage.setItem('wastewise_token', res.access_token);
    localStorage.setItem('wastewise_user', JSON.stringify(res.user));
    setToken(res.access_token);
    setUser(res.user);
  };

  const register = async (email: string, password: string, fullName: string) => {
    const res = await authService.register({ email, password, full_name: fullName });
    localStorage.setItem('wastewise_token', res.access_token);
    localStorage.setItem('wastewise_user', JSON.stringify(res.user));
    setToken(res.access_token);
    setUser(res.user);
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
