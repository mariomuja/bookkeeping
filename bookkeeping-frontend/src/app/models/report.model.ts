export interface TrialBalanceItem {
  accountId: string;
  accountNumber: string;
  accountName: string;
  accountCategory: string;
  normalBalance: 'DEBIT' | 'CREDIT';
  totalDebits: number;
  totalCredits: number;
  balance: number;
}

export interface BalanceSheetItem {
  category: string;
  accountTypeName: string;
  accountNumber: string;
  accountName: string;
  balance: number;
}

export interface ProfitLossItem {
  category: string;
  accountTypeName: string;
  accountNumber: string;
  accountName: string;
  amount: number;
}

export interface DashboardMetrics {
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  entryCount: number;
  accountCount: number;
}

