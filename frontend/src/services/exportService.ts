import { api } from './api';

export const exportService = {
  // Export expenses to CSV
  exportExpenses: async (startDate: string, endDate: string, type?: string, category?: string): Promise<void> => {
    const params: any = { startDate, endDate };
    if (type) params.type = type;
    if (category) params.category = category;

    const response = await api.get('/export/expenses', {
      params,
      responseType: 'blob',
    });

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `expenses_${startDate}_to_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  // Export budgets
  exportBudgets: async (): Promise<void> => {
    const response = await api.get('/export/budgets', {
      responseType: 'blob',
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'budgets_report.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  // Export goals
  exportGoals: async (): Promise<void> => {
    const response = await api.get('/export/goals', {
      responseType: 'blob',
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'goals_report.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
  },
};
