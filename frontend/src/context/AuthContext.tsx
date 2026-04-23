import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { User, Role } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  logout: () => void;
  register: (data: RegisterData) => Promise<void>;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  role: Role;
  loginMethod?: 'email' | 'phone';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  // Start true so we verify the stored token before rendering protected routes
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('sos_token');
    if (!token) { setIsLoading(false); return; }
    authService.getMe()
      .then(u => {
        setUser(u);
        localStorage.setItem('sos_user', JSON.stringify(u));
      })
      .catch(() => {
        localStorage.removeItem('sos_token');
        localStorage.removeItem('sos_user');
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (identifier: string, password: string) => {
    setIsLoading(true);
    try {
      const { token, user: u } = await authService.login(identifier, password);
      localStorage.setItem('sos_token', token);
      localStorage.setItem('sos_user', JSON.stringify(u));
      setUser(u);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('sos_token');
    localStorage.removeItem('sos_user');
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    setIsLoading(true);
    try {
      const payload = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.loginMethod !== 'phone' ? data.email : undefined,
        phone: data.phone || undefined,
        password: data.password,
        loginMethod: data.loginMethod,
        role: data.role,
      };
      const { token, user: u } = await authService.register(payload);
      localStorage.setItem('sos_token', token);
      localStorage.setItem('sos_user', JSON.stringify(u));
      setUser(u);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
