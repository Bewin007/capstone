import { api } from './api';
import { ApiResponse } from '../types';

export const importService = {
  // Import expenses from CSV
  importExpensesFromCSV: async (file: File): Promise<ApiResponse<any>> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<ApiResponse<any>>('/import/expenses/csv', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  // Import expenses from bank
  importExpensesFromBank: async (bankUserId: string, startDate?: string, endDate?: string): Promise<ApiResponse<any>> => {
    const response = await api.post<ApiResponse<any>>('/import/expenses/bank', {
      bankUserId,
      startDate,
      endDate,
    });

    return response.data;
  },

  // Categorize pending transactions
  categorizePendingTransactions: async (transactions: any[]): Promise<ApiResponse<any>> => {
    const response = await api.post<ApiResponse<any>>('/import/expenses/categorize', {
      transactions,
    });

    return response.data;
  },
};
