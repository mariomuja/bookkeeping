export interface AccountType {
  id: number;
  code: string;
  name: string;
  category: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';
  normalBalance: 'DEBIT' | 'CREDIT';
  isBalanceSheet: boolean;
  displayOrder: number;
}

export interface Account {
  id: string;
  organizationId: string;
  accountNumber: string;
  accountName: string;
  accountTypeId: number;
  accountType?: AccountType;
  parentAccountId?: string;
  currency: string;
  description?: string;
  isSystemAccount: boolean;
  isActive: boolean;
  taxCode?: string;
  costCenter?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AccountBalance {
  id: string;
  organizationId: string;
  accountId: string;
  fiscalPeriodId: string;
  periodStartDate: Date;
  periodEndDate: Date;
  openingBalance: number;
  debitTotal: number;
  creditTotal: number;
  closingBalance: number;
  currency: string;
  lastUpdated: Date;
}

