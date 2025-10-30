// User Types
export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  currency: string;
  timezone: string;
  settings: {
    notifications: {
      budgetAlerts: boolean;
      goalAchievements: boolean;
      weeklyReports: boolean;
    };
    theme: 'light' | 'dark' | 'auto';
  };
  createdAt: string;
  updatedAt: string;
}

// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  currency?: string;
  timezone?: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
  };
}

// Category Types
export interface Category {
  _id: string;
  name: string;
  icon: string;
  color: string;
  type: 'expense' | 'income' | 'both';
  owner: 'system' | 'user';
  userId?: string;
  parentCategory?: Category;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Expense Types
export interface Expense {
  _id: string;
  userId: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category: Category;
  date: string;
  source: 'manual' | 'imported' | 'recurring';
  merchant?: string;
  notes?: string;
  tags?: string[];
  isRecurring: boolean;
  recurringConfig?: RecurringConfig;
  attachments?: Attachment[];
  createdAt: string;
  updatedAt: string;
}

export interface RecurringConfig {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number;
  startDate: string;
  endDate?: string;
  nextDate?: string;
}

export interface Attachment {
  filename: string;
  path: string;
  mimetype: string;
}

export interface ExpenseFormData {
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category: string;
  date: string;
  merchant?: string;
  notes?: string;
  tags?: string[];
  isRecurring?: boolean;
  recurringConfig?: RecurringConfig;
}

// Budget Types
export interface Budget {
  _id: string;
  userId: string;
  name: string;
  category: Category;
  targetAmount: number;
  spentAmount: number;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
  startDate: string;
  endDate: string;
  isRecurring: boolean;
  recurringConfig?: {
    frequency: 'weekly' | 'monthly' | 'yearly';
    autoRenew: boolean;
  };
  alertThreshold: number;
  alertTriggered: boolean;
  status: 'active' | 'exceeded' | 'completed' | 'archived';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetFormData {
  name: string;
  category: string;
  targetAmount: number;
  period: string;
  startDate: string;
  endDate: string;
  isRecurring?: boolean;
  recurringConfig?: {
    frequency: string;
    autoRenew: boolean;
  };
  alertThreshold?: number;
  notes?: string;
}

// Goal Types
export interface Goal {
  _id: string;
  userId: string;
  name: string;
  description?: string;
  type: 'savings' | 'debt_repayment' | 'investment' | 'purchase' | 'emergency_fund' | 'other';
  targetAmount: number;
  currentAmount: number;
  startDate: string;
  targetDate: string;
  status: 'active' | 'completed' | 'cancelled' | 'paused';
  priority: 'low' | 'medium' | 'high';
  linkedCategory?: Category;
  milestones?: Milestone[];
  contributions?: Contribution[];
  icon: string;
  color: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Milestone {
  name: string;
  amount: number;
  date: string;
  isCompleted: boolean;
  completedAt?: string;
}

export interface Contribution {
  amount: number;
  date: string;
  note?: string;
  expenseId?: string;
}

export interface GoalFormData {
  name: string;
  description?: string;
  type: string;
  targetAmount: number;
  currentAmount?: number;
  targetDate: string;
  priority?: string;
  linkedCategory?: string;
  icon?: string;
  color?: string;
  notes?: string;
}

// Stats and Summary Types
export interface ExpenseSummary {
  totalIncome: number;
  totalExpense: number;
  transactionCount: number;
  netBalance: number;
  categoryBreakdown: CategoryBreakdown[];
}

export interface CategoryBreakdown {
  _id: string;
  total: number;
  count: number;
  categoryInfo: Category;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  count?: number;
  total?: number;
  page?: number;
  pages?: number;
}

export interface ErrorResponse {
  success: false;
  message: string;
  error?: any;
}

// Notification Types
export interface Notification {
  _id: string;
  userId: string;
  type: 'budget_alert' | 'budget_exceeded' | 'goal_achieved' | 'goal_milestone' | 'import_completed' | 'import_failed' | 'recurring_reminder' | 'weekly_report' | 'monthly_report';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  isRead: boolean;
  readAt?: string;
  relatedData?: {
    budgetId?: string;
    goalId?: string;
    expenseId?: string;
    bankImportId?: string;
  };
  actionUrl?: string;
  expiresAt?: string;
  createdAt: string;
}
