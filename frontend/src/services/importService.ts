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
};
