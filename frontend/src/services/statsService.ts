import api from './api';
import { DashboardStats, SustainabilityScoreResponse } from '../types';

export const statsService = {
  async getDashboardStats(): Promise<DashboardStats> {
    const res = await api.get<DashboardStats>('/stats/dashboard');
    return res.data;
  },

  async getSustainability(): Promise<SustainabilityScoreResponse> {
    const res = await api.get<SustainabilityScoreResponse>('/stats/sustainability');
    return res.data;
  }
};
