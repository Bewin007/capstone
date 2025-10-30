import { api } from './api';
import { Notification, ApiResponse } from '../types';

export const notificationService = {
  // Get all notifications
  getNotifications: async (params?: { isRead?: boolean; limit?: number }): Promise<ApiResponse<Notification[]> & { unreadCount: number }> => {
    const response = await api.get<ApiResponse<Notification[]> & { unreadCount: number }>('/notifications', { params });
    return response.data;
  },

  // Mark as read
  markAsRead: async (id: string): Promise<Notification> => {
    const response = await api.put<ApiResponse<Notification>>(`/notifications/${id}/read`);
    return response.data.data;
  },

  // Mark all as read
  markAllAsRead: async (): Promise<void> => {
    await api.put('/notifications/read-all');
  },

  // Delete notification
  deleteNotification: async (id: string): Promise<void> => {
    await api.delete(`/notifications/${id}`);
  },
};
