import api from './api';
import { normalizeUser } from './normalizers';
import { User } from '../types';

interface CreateUserPayload {
  firstName: string; lastName: string;
  email?: string; phone?: string;
  password: string; role: string; region?: string; facilityId?: string;
}

export const userService = {
  async getAll(params?: { role?: string; search?: string }): Promise<User[]> {
    const { data } = await api.get('/api/users', { params });
    return data.map(normalizeUser);
  },

  async create(payload: CreateUserPayload): Promise<User> {
    const { data } = await api.post('/api/users/create', payload);
    return normalizeUser(data);
  },

  async toggleActive(id: string, isActive: boolean): Promise<User> {
    const { data } = await api.patch(`/api/users/${id}`, { isActive });
    return normalizeUser(data);
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/api/users/${id}`);
  },
};
