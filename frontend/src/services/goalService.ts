import { api } from './api';
import { Goal, GoalFormData, ApiResponse } from '../types';

export const goalService = {
  // Get all goals
  getGoals: async (params?: { status?: string; type?: string }): Promise<Goal[]> => {
    const response = await api.get<ApiResponse<Goal[]>>('/goals', { params });
    return response.data.data;
  },

  // Get single goal
  getGoal: async (id: string): Promise<Goal> => {
    const response = await api.get<ApiResponse<Goal>>(`/goals/${id}`);
    return response.data.data;
  },

  // Create goal
  createGoal: async (data: GoalFormData): Promise<Goal> => {
    const response = await api.post<ApiResponse<Goal>>('/goals', data);
    return response.data.data;
  },

  // Update goal
  updateGoal: async (id: string, data: Partial<GoalFormData>): Promise<Goal> => {
    const response = await api.put<ApiResponse<Goal>>(`/goals/${id}`, data);
    return response.data.data;
  },

  // Delete goal
  deleteGoal: async (id: string): Promise<void> => {
    await api.delete(`/goals/${id}`);
  },

  // Add contribution
  addContribution: async (id: string, amount: number, note?: string): Promise<Goal> => {
    const response = await api.post<ApiResponse<Goal>>(`/goals/${id}/contribute`, { amount, note });
    return response.data.data;
  },

  // Get goal progress
  getGoalProgress: async (id: string): Promise<any> => {
    const response = await api.get<ApiResponse<any>>(`/goals/${id}/progress`);
    return response.data.data;
  },
};
