import api from './api';
import { WastePrediction, WasteScan } from '../types';

export const scanService = {
  async classifyImage(file: File): Promise<WastePrediction> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post<WastePrediction>('/scan/classify', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  async uploadAndSaveScan(file: File, notes?: string): Promise<WasteScan> {
    const formData = new FormData();
    formData.append('file', file);
    if (notes) {
      formData.append('notes', notes);
    }
    const res = await api.post<WasteScan>('/scan/upload-and-save', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  async getHistory(params?: {
    category?: string;
    is_recyclable?: boolean;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ total: number; items: WasteScan[] }> {
    const res = await api.get<{ total: number; items: WasteScan[] }>('/history', { params });
    return res.data;
  },

  async getScanDetail(scanId: number): Promise<WasteScan> {
    const res = await api.get<WasteScan>(`/history/${scanId}`);
    return res.data;
  },

  async submitFeedback(scanId: number, isCorrect: boolean, notes?: string): Promise<WasteScan> {
    const res = await api.post<WasteScan>(`/history/${scanId}/feedback`, {
      user_feedback_correct: isCorrect,
      notes
    });
    return res.data;
  },

  async deleteScan(scanId: number): Promise<void> {
    await api.delete(`/history/${scanId}`);
  }
};
