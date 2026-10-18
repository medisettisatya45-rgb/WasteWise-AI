import api from './api';
import { RecyclingCenter } from '../types';

export const centerService = {
  async getNearbyCenters(params?: {
    lat?: number;
    lng?: number;
    radius_km?: number;
    material?: string;
    search?: string;
  }): Promise<RecyclingCenter[]> {
    const res = await api.get<RecyclingCenter[]>('/centers/nearby', { params });
    return res.data;
  },

  async getMaterialTypes(): Promise<string[]> {
    const res = await api.get<string[]>('/centers/materials');
    return res.data;
  },

  async getCenterById(id: number): Promise<RecyclingCenter> {
    const res = await api.get<RecyclingCenter>(`/centers/${id}`);
    return res.data;
  }
};
