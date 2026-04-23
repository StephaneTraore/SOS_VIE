import api from './api';
import { normalizeUser } from './normalizers';
import { User } from '../types';

interface AuthResponse { token: string; user: any; }

export const authService = {
  async login(identifier: string, password: string): Promise<{ token: string; user: User }> {
    const { data } = await api.post<AuthResponse>('/api/auth/login', { identifier, password });
    return { token: data.token, user: normalizeUser(data.user) };
  },

  async register(payload: {
    firstName: string; lastName: string;
    email?: string; phone?: string;
    password: string; loginMethod?: string; role?: string;
  }): Promise<{ token: string; user: User }> {
    const { data } = await api.post<AuthResponse>('/api/auth/register', payload);
    return { token: data.token, user: normalizeUser(data.user) };
  },

  async getMe(): Promise<User> {
    const { data } = await api.get('/api/auth/me');
    return normalizeUser(data.user);
  },
};
