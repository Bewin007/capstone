import { api } from './api';
import { ApiResponse } from '../types';

// Analytics types
export interface OverviewData {
  summary: {
    totalIncome: number;
    totalExpenses: number;
    balance: number;
    transactionCount: number;
  };
  budgetUtilization: Array<{
    name: string;
    category: string;
    target: number;
    spent: number;
    percentage: string;
  }>;
  goalProgress: Array<{
    name: string;
    current: number;
    target: number;
    percentage: string;
  }>;
}

export interface TrendData {
  period: string;
  income: number;
  expense: number;
}

export interface CategoryBreakdownData {
  _id: string;
  total: number;
  count: number;
  name: string;
  icon: string;
  color: string;
  percentage: string;
}

export interface IncomeExpenseData {
  income: {
    total: number;
    count: number;
    average: string;
  };
  expense: {
    total: number;
    count: number;
    average: string;
  };
  netSavings: number;
  savingsRate: string;
}

export interface MonthlyComparisonData {
  month: string;
  income: number;
  expense: number;
  net: number;
}

export interface TopMerchantData {
  merchant: string;
  total: number;
  count: number;
}

export const analyticsService = {
  getOverview: async (startDate?: string, endDate?: string): Promise<OverviewData> => {
    try {
      const params: any = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      const response = await api.get<ApiResponse<OverviewData>>('/analytics/overview', { params });
      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching overview:', error);
      throw error;
    }
  },

  getSpendingTrends: async (
    period: 'day' | 'week' | 'month' | 'year',
    startDate?: string,
    endDate?: string
  ): Promise<TrendData[]> => {
    try {
      const params: any = { period };
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      const response = await api.get<ApiResponse<TrendData[]>>('/analytics/trends', { params });
      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching spending trends:', error);
      throw error;
    }
  },

  getCategoryBreakdown: async (
    type?: 'income' | 'expense',
    startDate?: string,
    endDate?: string
  ): Promise<CategoryBreakdownData[]> => {
    try {
      const params: any = {};
      if (type) params.type = type;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      const response = await api.get<ApiResponse<CategoryBreakdownData[]>>('/analytics/categories', { params });
      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching category breakdown:', error);
      throw error;
    }
  },

  getIncomeExpenseComparison: async (startDate?: string, endDate?: string): Promise<IncomeExpenseData> => {
    try {
      const params: any = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      const response = await api.get<ApiResponse<IncomeExpenseData>>('/analytics/comparison', { params });
      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching income/expense comparison:', error);
      throw error;
    }
  },

  getMonthlyComparison: async (months?: number): Promise<MonthlyComparisonData[]> => {
    try {
      const params: any = {};
      if (months) params.months = months;
      const response = await api.get<ApiResponse<MonthlyComparisonData[]>>('/analytics/monthly-comparison', { params });
      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching monthly comparison:', error);
      throw error;
    }
  },

  getTopMerchants: async (limit?: number, startDate?: string, endDate?: string): Promise<TopMerchantData[]> => {
    try {
      const params: any = {};
      if (limit) params.limit = limit;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      const response = await api.get<ApiResponse<TopMerchantData[]>>('/analytics/top-merchants', { params });
      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching top merchants:', error);
      throw error;
    }
  },
};
