import api from './api';
import { AdminStats, User, AIModelStatus, RecyclingCenter } from '../types';

export const adminService = {
  async getStats(): Promise<AdminStats> {
    const res = await api.get<AdminStats>('/admin/stats');
    return res.data;
  },

  async getUsers(limit: number = 50, offset: number = 0): Promise<User[]> {
    const res = await api.get<User[]>('/admin/users', { params: { limit, offset } });
    return res.data;
  },

  async updateUserRole(userId: number, role: 'USER' | 'ADMIN'): Promise<User> {
    const res = await api.put<User>(`/admin/users/${userId}/role`, null, { params: { role } });
    return res.data;
  },

  async toggleUserStatus(userId: number, isActive: boolean): Promise<User> {
    const res = await api.put<User>(`/admin/users/${userId}/status`, null, { params: { is_active: isActive } });
    return res.data;
  },

  async getModelStatus(): Promise<AIModelStatus> {
    const res = await api.get<AIModelStatus>('/admin/model/status');
    return res.data;
  },

  async updateThreshold(threshold: number): Promise<{ success: boolean; new_threshold: number; message: string }> {
    const res = await api.put<{ success: boolean; new_threshold: number; message: string }>(
      '/admin/model/threshold',
      null,
      { params: { threshold } }
    );
    return res.data;
  },

  async triggerRetrain(): Promise<{ success: boolean; message: string; dataset_size: number }> {
    const res = await api.post<{ success: boolean; message: string; dataset_size: number }>('/admin/model/retrain');
    return res.data;
  },

  async createCenter(data: any): Promise<RecyclingCenter> {
    const res = await api.post<RecyclingCenter>('/admin/centers', data);
    return res.data;
  },

  async updateCenter(id: number, data: any): Promise<RecyclingCenter> {
    const res = await api.put<RecyclingCenter>(`/admin/centers/${id}`, data);
    return res.data;
  },

  async deleteCenter(id: number): Promise<void> {
    await api.delete(`/admin/centers/${id}`);
  },

  async getAuditLogs(limit: number = 50): Promise<any[]> {
    const res = await api.get<any[]>('/admin/audit-logs', { params: { limit } });
    return res.data;
  }
};
