import { api } from './api';
import { Expense, ExpenseFormData, ExpenseSummary, ApiResponse } from '../types';

export const expenseService = {
  // Get all expenses
  getExpenses: async (params?: {
    type?: string;
    category?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<Expense[]>> => {
    const response = await api.get<ApiResponse<Expense[]>>('/expenses', { params });
    return response.data;
  },

  // Get single expense
  getExpense: async (id: string): Promise<Expense> => {
    const response = await api.get<ApiResponse<Expense>>(`/expenses/${id}`);
    return response.data.data;
  },

  // Create expense
  createExpense: async (data: ExpenseFormData): Promise<Expense> => {
    const response = await api.post<ApiResponse<Expense>>('/expenses', data);
    return response.data.data;
  },

  // Update expense
  updateExpense: async (id: string, data: Partial<ExpenseFormData>): Promise<Expense> => {
    const response = await api.put<ApiResponse<Expense>>(`/expenses/${id}`, data);
    return response.data.data;
  },

  // Delete expense
  deleteExpense: async (id: string): Promise<void> => {
    await api.delete(`/expenses/${id}`);
  },

  // Get expense summary
  getExpenseSummary: async (params?: {
    period?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<ExpenseSummary> => {
    const response = await api.get<ApiResponse<ExpenseSummary>>('/expenses/stats/summary', { params });
    return response.data.data;
  },
};
