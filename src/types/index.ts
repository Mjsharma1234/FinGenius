// User Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  phone?: string;
  dateOfBirth?: string;
  currency: string;
  timezone: string;
  isPremium: boolean;
  createdAt: string;
  updatedAt: string;
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  language: string;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
  budgetAlerts: boolean;
  fraudAlerts: boolean;
  goalUpdates: boolean;
  weeklyReports: boolean;
}

export interface PrivacySettings {
  shareData: boolean;
  allowAnalytics: boolean;
  publicProfile: boolean;
}

// Authentication Types
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  agreeToTerms: boolean;
}

// Transaction Types
export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  type: 'income' | 'expense' | 'transfer';
  category: string;
  subcategory?: string;
  description: string;
  date: string;
  accountId: string;
  tags: string[];
  isRecurring: boolean;
  recurringId?: string;
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  merchant?: string;
  receipt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: 'income' | 'expense';
  subcategories?: string[];
}

// Account Types
export interface Account {
  id: string;
  userId: string;
  name: string;
  type: 'bank' | 'credit' | 'investment' | 'crypto' | 'cash';
  institution?: string;
  accountNumber?: string;
  balance: number;
  currency: string;
  isActive: boolean;
  syncEnabled: boolean;
  lastSync?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CryptoAccount extends Account {
  walletAddress: string;
  blockchain: string;
  tokens: CryptoToken[];
}

export interface CryptoToken {
  symbol: string;
  name: string;
  balance: number;
  price: number;
  value: number;
  change24h: number;
  change7d: number;
}

// Budget Types
export interface Budget {
  id: string;
  userId: string;
  name: string;
  amount: number;
  currency: string;
  period: 'weekly' | 'monthly' | 'yearly';
  categories: BudgetCategory[];
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetCategory {
  categoryId: string;
  amount: number;
  spent: number;
  remaining: number;
}

// Goal Types
export interface Goal {
  id: string;
  userId: string;
  name: string;
  description?: string;
  targetAmount: number;
  currentAmount: number;
  currency: string;
  targetDate: string;
  type: 'savings' | 'debt' | 'investment' | 'custom';
  icon: string;
  color: string;
  isPublic: boolean;
  progress: number;
  status: 'active' | 'completed' | 'paused';
  createdAt: string;
  updatedAt: string;
}

// Analytics Types
export interface AnalyticsData {
  netWorth: NetWorthData;
  spending: SpendingData;
  income: IncomeData;
  savings: SavingsData;
  trends: TrendData[];
}

export interface NetWorthData {
  current: number;
  change: number;
  changePercentage: number;
  history: NetWorthPoint[];
}

export interface NetWorthPoint {
  date: string;
  value: number;
}

export interface SpendingData {
  total: number;
  byCategory: CategorySpending[];
  byMonth: MonthlySpending[];
  topMerchants: MerchantSpending[];
}

export interface CategorySpending {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

export interface MonthlySpending {
  month: string;
  amount: number;
  budget: number;
}

export interface MerchantSpending {
  merchant: string;
  amount: number;
  transactions: number;
}

export interface IncomeData {
  total: number;
  bySource: SourceIncome[];
  byMonth: MonthlyIncome[];
}

export interface SourceIncome {
  source: string;
  amount: number;
  percentage: number;
}

export interface MonthlyIncome {
  month: string;
  amount: number;
}

export interface SavingsData {
  total: number;
  rate: number;
  goalProgress: number;
  history: SavingsPoint[];
}

export interface SavingsPoint {
  date: string;
  amount: number;
}

export interface TrendData {
  metric: string;
  value: number;
  change: number;
  changePercentage: number;
  trend: 'up' | 'down' | 'stable';
}

// AI Types
export interface AIInsight {
  id: string;
  type: 'spending' | 'saving' | 'budget' | 'fraud' | 'opportunity';
  title: string;
  description: string;
  confidence: number;
  action?: string;
  data?: any;
  createdAt: string;
}

export interface FraudAlert {
  id: string;
  transactionId: string;
  type: 'unusual_amount' | 'unusual_location' | 'unusual_time' | 'duplicate';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  isResolved: boolean;
  createdAt: string;
}

// API Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form Types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'date' | 'textarea';
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  validation?: any;
}

// UI Types
export interface MenuItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  badge?: number;
  children?: MenuItem[];
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }[];
}

// Error Types
export interface AppError {
  code: string;
  message: string;
  details?: any;
}

// Notification Types
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  action?: {
    label: string;
    url: string;
  };
} 