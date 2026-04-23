import api from './api';
import { normalizeAlert } from './normalizers';
import { Alert, AlertStatus } from '../types';

interface CreatePayload {
  type: string; title: string; description: string; priority: string;
  address: string; city: string; lat?: number; lng?: number; facilityId?: string;
}

interface GetParams {
  status?: string; type?: string; service?: string; search?: string; sortBy?: string;
}

export const alertService = {
  async getAll(params?: GetParams): Promise<Alert[]> {
    const { data } = await api.get('/api/alerts', { params });
    return data.map(normalizeAlert);
  },

  async getMy(): Promise<Alert[]> {
    const { data } = await api.get('/api/alerts/my');
    return data.map(normalizeAlert);
  },

  async create(payload: CreatePayload): Promise<Alert> {
    const { data } = await api.post('/api/alerts', payload);
    return normalizeAlert(data);
  },

  async updateStatus(id: string, status: AlertStatus, notes?: string): Promise<Alert> {
    const { data } = await api.patch(`/api/alerts/${id}/status`, { status, notes });
    return normalizeAlert(data);
  },

  async assign(id: string, responderId?: string): Promise<Alert> {
    const { data } = await api.patch(`/api/alerts/${id}/assign`, responderId ? { responderId } : {});
    return normalizeAlert(data);
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/api/alerts/${id}`);
  },
};
