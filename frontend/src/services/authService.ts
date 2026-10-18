import api from './api';
import { AuthResponse, User } from '../types';

export const authService = {
  async register(data: { email: string; password: string; full_name: string }): Promise<AuthResponse> {
    const res = await api.post<AuthResponse>('/auth/register', data);
    return res.data;
  },

  async login(data: { email: string; password: string }): Promise<AuthResponse> {
    const res = await api.post<AuthResponse>('/auth/login', data);
    return res.data;
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('wastewise_token');
      localStorage.removeItem('wastewise_user');
      window.dispatchEvent(new Event('auth-change'));
    }
  },

  async getMe(): Promise<User> {
    const res = await api.get<User>('/auth/me');
    return res.data;
  },

  async updateProfile(data: { full_name?: string; avatar_url?: string }): Promise<User> {
    const res = await api.put<User>('/auth/profile', data);
    return res.data;
  },

  async changePassword(data: { current_password: string; new_password: string }): Promise<{ success: boolean; message: string }> {
    const res = await api.post<{ success: boolean; message: string }>('/auth/change-password', data);
    return res.data;
  }
};
