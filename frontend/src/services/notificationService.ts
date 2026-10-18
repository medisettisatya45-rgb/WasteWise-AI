import api from './api';
import { Notification } from '../types';

export const notificationService = {
  async getNotifications(limit: number = 30): Promise<Notification[]> {
    const res = await api.get<Notification[]>('/notifications', { params: { limit } });
    return res.data;
  },

  async getUnreadCount(): Promise<{ unread_count: number }> {
    const res = await api.get<{ unread_count: number }>('/notifications/unread-count');
    return res.data;
  },

  async markAsRead(id: number): Promise<Notification> {
    const res = await api.put<Notification>(`/notifications/${id}/read`);
    return res.data;
  },

  async markAllRead(): Promise<void> {
    await api.put('/notifications/read-all');
  }
};
