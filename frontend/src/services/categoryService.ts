import { api } from './api';
import { Category, ApiResponse } from '../types';

export const categoryService = {
  // Get all categories
  getCategories: async (type?: string): Promise<Category[]> => {
    const params = type ? { type } : undefined;
    const response = await api.get<ApiResponse<Category[]>>('/categories', { params });
    return response.data.data;
  },

  // Get single category
  getCategory: async (id: string): Promise<Category> => {
    const response = await api.get<ApiResponse<Category>>(`/categories/${id}`);
    return response.data.data;
  },

  // Create category
  createCategory: async (data: {
    name: string;
    icon?: string;
    color?: string;
    type?: string;
    parentCategory?: string;
  }): Promise<Category> => {
    const response = await api.post<ApiResponse<Category>>('/categories', data);
    return response.data.data;
  },

  // Update category
  updateCategory: async (id: string, data: Partial<Category>): Promise<Category> => {
    const response = await api.put<ApiResponse<Category>>(`/categories/${id}`, data);
    return response.data.data;
  },

  // Delete category
  deleteCategory: async (id: string): Promise<void> => {
    await api.delete(`/categories/${id}`);
  },
};
