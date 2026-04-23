import api from './api';
import { normalizeFacility } from './normalizers';
import { Facility } from '../types';

export type FacilityInput = {
  name: string;
  type: 'hospital' | 'police' | 'fire';
  address: string;
  city?: string;
  phone?: string;
  lat: number;
  lng: number;
  isActive?: boolean;
};

export const facilityService = {
  async getAll(type?: string): Promise<Facility[]> {
    const params = type && type !== 'all' ? { type } : {};
    const { data } = await api.get('/api/facilities', { params });
    return data.map(normalizeFacility);
  },

  async create(input: FacilityInput): Promise<Facility> {
    const { data } = await api.post('/api/facilities', input);
    return normalizeFacility(data);
  },

  async update(id: string, input: Partial<FacilityInput>): Promise<Facility> {
    const { data } = await api.patch(`/api/facilities/${id}`, input);
    return normalizeFacility(data);
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/api/facilities/${id}`);
  },
};
