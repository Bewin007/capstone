import { api } from './api';
import { Budget, BudgetFormData, ApiResponse } from '../types';

export const budgetService = {
  // Get all budgets
  getBudgets: async (params?: {
    status?: string;
    period?: string;
    category?: string;
  }): Promise<Budget[]> => {
    const response = await api.get<ApiResponse<Budget[]>>('/budgets', { params });
    return response.data.data;
  },

  // Get single budget
  getBudget: async (id: string): Promise<Budget> => {
    const response = await api.get<ApiResponse<Budget>>(`/budgets/${id}`);
    return response.data.data;
  },

  // Create budget
  createBudget: async (data: BudgetFormData): Promise<Budget> => {
    const response = await api.post<ApiResponse<Budget>>('/budgets', data);
    return response.data.data;
  },

  // Update budget
  updateBudget: async (id: string, data: Partial<BudgetFormData>): Promise<Budget> => {
    const response = await api.put<ApiResponse<Budget>>(`/budgets/${id}`, data);
    return response.data.data;
  },

  // Delete budget
  deleteBudget: async (id: string): Promise<void> => {
    await api.delete(`/budgets/${id}`);
  },

  // Get budget performance
  getBudgetPerformance: async (id: string): Promise<any> => {
    const response = await api.get<ApiResponse<any>>(`/budgets/${id}/performance`);
    return response.data.data;
  },

  // Renew recurring budgets
  renewRecurringBudgets: async (): Promise<Budget[]> => {
    const response = await api.post<ApiResponse<Budget[]>>('/budgets/renew-recurring');
    return response.data.data;
  },
};
