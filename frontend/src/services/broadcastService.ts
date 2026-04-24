import api from './api';
import { Broadcast, BroadcastCategory, ServiceType } from '../types';

interface RawBroadcast {
  _id?: string;
  id?: string;
  title: string;
  message: string;
  category: BroadcastCategory;
  author?: string;
  authorName?: string;
  authorRole?: string;
  authorService?: ServiceType | null;
  isActive?: boolean;
  expiresAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

const normalize = (b: RawBroadcast): Broadcast => ({
  id: b.id || b._id || '',
  title: b.title,
  message: b.message,
  category: b.category,
  authorId: b.author || '',
  authorName: b.authorName || '',
  authorRole: b.authorRole || '',
  authorService: b.authorService || null,
  isActive: b.isActive ?? true,
  expiresAt: b.expiresAt || null,
  createdAt: b.createdAt,
  updatedAt: b.updatedAt,
});

export interface CreateBroadcastPayload {
  title: string;
  message: string;
  category: BroadcastCategory;
  expiresAt?: string | null;
}

export const broadcastService = {
  async list(): Promise<Broadcast[]> {
    const { data } = await api.get<RawBroadcast[]>('/api/broadcasts');
    return data.map(normalize);
  },
  async listMine(): Promise<Broadcast[]> {
    const { data } = await api.get<RawBroadcast[]>('/api/broadcasts/mine');
    return data.map(normalize);
  },
  async create(payload: CreateBroadcastPayload): Promise<Broadcast> {
    const { data } = await api.post<RawBroadcast>('/api/broadcasts', payload);
    return normalize(data);
  },
  async remove(id: string): Promise<void> {
    await api.delete(`/api/broadcasts/${id}`);
  },
};
