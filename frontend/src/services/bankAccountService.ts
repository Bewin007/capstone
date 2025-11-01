import { api } from './api';
import { ApiResponse } from '../types';

export interface BankAccount {
  _id: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  accountType: 'checking' | 'savings' | 'credit';
  bankUserId: string;
  isActive: boolean;
  lastSyncDate: string;
  balance: number;
  currency: string;
  connectionStatus: 'connected' | 'disconnected' | 'error';
  createdAt: string;
  updatedAt: string;
}

export interface AvailableBank {
  bankUserId: string;
  accountNumber: string;
  accountHolder: string;
  bankName: string;
  balance: number;
}

export interface AddBankAccountData {
  bankName: string;
  accountName: string;
  accountNumber: string;
  accountType: 'checking' | 'savings' | 'credit';
  bankUserId: string;
}

export const bankAccountService = {
  // Get all bank accounts for user
  getBankAccounts: async (): Promise<ApiResponse<BankAccount[]>> => {
    const response = await api.get<ApiResponse<BankAccount[]>>('/bank-accounts');
    return response.data;
  },

  // Add new bank account
  addBankAccount: async (data: AddBankAccountData): Promise<ApiResponse<BankAccount>> => {
    const response = await api.post<ApiResponse<BankAccount>>('/bank-accounts', data);
    return response.data;
  },

  // Update bank account
  updateBankAccount: async (id: string, data: Partial<AddBankAccountData>): Promise<ApiResponse<BankAccount>> => {
    const response = await api.put<ApiResponse<BankAccount>>(`/bank-accounts/${id}`, data);
    return response.data;
  },

  // Delete bank account
  deleteBankAccount: async (id: string): Promise<ApiResponse<any>> => {
    const response = await api.delete<ApiResponse<any>>(`/bank-accounts/${id}`);
    return response.data;
  },

  // Sync bank account balance
  syncBankAccount: async (id: string): Promise<ApiResponse<BankAccount>> => {
    const response = await api.post<ApiResponse<BankAccount>>(`/bank-accounts/${id}/sync`);
    return response.data;
  },

  // Get available banks for connection
  getAvailableBanks: async (): Promise<ApiResponse<AvailableBank[]>> => {
    const response = await api.get<ApiResponse<AvailableBank[]>>('/bank-accounts/available-banks');
    return response.data;
  },
};