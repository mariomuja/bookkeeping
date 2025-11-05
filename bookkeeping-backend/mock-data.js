// Mock Data for International Bookkeeping
const { v4: uuidv4 } = require('uuid');
const config = require('./config');

const demoOrgId = config.demoOrgId;

// Organizations
const organizations = [
  {
    id: demoOrgId,
    name: 'Demo Company',
    countryCode: 'US',
    defaultCurrency: 'USD',
    defaultTimezone: 'America/New_York',
    fiscalYearStart: 1,
    fiscalYearEnd: 12,
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true
  }
];

// Account Types
const accountTypes = [
  { id: 1, code: 'ASSET_CURRENT', name: 'Current Assets', category: 'ASSET', normalBalance: 'DEBIT', isBalanceSheet: true, displayOrder: 100 },
  { id: 2, code: 'ASSET_FIXED', name: 'Fixed Assets', category: 'ASSET', normalBalance: 'DEBIT', isBalanceSheet: true, displayOrder: 200 },
  { id: 3, code: 'ASSET_INTANGIBLE', name: 'Intangible Assets', category: 'ASSET', normalBalance: 'DEBIT', isBalanceSheet: true, displayOrder: 300 },
  { id: 4, code: 'LIABILITY_CURRENT', name: 'Current Liabilities', category: 'LIABILITY', normalBalance: 'CREDIT', isBalanceSheet: true, displayOrder: 400 },
  { id: 5, code: 'LIABILITY_LONG_TERM', name: 'Long-term Liabilities', category: 'LIABILITY', normalBalance: 'CREDIT', isBalanceSheet: true, displayOrder: 500 },
  { id: 6, code: 'EQUITY_CAPITAL', name: 'Share Capital', category: 'EQUITY', normalBalance: 'CREDIT', isBalanceSheet: true, displayOrder: 600 },
  { id: 7, code: 'EQUITY_RETAINED', name: 'Retained Earnings', category: 'EQUITY', normalBalance: 'CREDIT', isBalanceSheet: true, displayOrder: 700 },
  { id: 8, code: 'REVENUE_SALES', name: 'Sales Revenue', category: 'REVENUE', normalBalance: 'CREDIT', isBalanceSheet: false, displayOrder: 800 },
  { id: 9, code: 'EXPENSE_COGS', name: 'Cost of Goods Sold', category: 'EXPENSE', normalBalance: 'DEBIT', isBalanceSheet: false, displayOrder: 900 },
  { id: 10, code: 'EXPENSE_OPERATING', name: 'Operating Expenses', category: 'EXPENSE', normalBalance: 'DEBIT', isBalanceSheet: false, displayOrder: 1000 }
];

// Accounts
const accounts = [
  { id: uuidv4(), organizationId: demoOrgId, accountNumber: '1000', accountName: 'Cash', accountTypeId: 1, currency: 'USD', isSystemAccount: false, isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: uuidv4(), organizationId: demoOrgId, accountNumber: '1200', accountName: 'Accounts Receivable', accountTypeId: 1, currency: 'USD', isSystemAccount: false, isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: uuidv4(), organizationId: demoOrgId, accountNumber: '1500', accountName: 'Investments', accountTypeId: 1, currency: 'USD', isSystemAccount: false, isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: uuidv4(), organizationId: demoOrgId, accountNumber: '2000', accountName: 'Accounts Payable', accountTypeId: 4, currency: 'USD', isSystemAccount: false, isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: uuidv4(), organizationId: demoOrgId, accountNumber: '2100', accountName: 'Accrued Expenses', accountTypeId: 4, currency: 'USD', isSystemAccount: false, isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: uuidv4(), organizationId: demoOrgId, accountNumber: '3000', accountName: 'Owner Equity', accountTypeId: 6, currency: 'USD', isSystemAccount: false, isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: uuidv4(), organizationId: demoOrgId, accountNumber: '4000', accountName: 'Sales Revenue', accountTypeId: 8, currency: 'USD', isSystemAccount: false, isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: uuidv4(), organizationId: demoOrgId, accountNumber: '4100', accountName: 'Other Income', accountTypeId: 8, currency: 'USD', isSystemAccount: false, isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: uuidv4(), organizationId: demoOrgId, accountNumber: '6000', accountName: 'Cost of Services', accountTypeId: 10, currency: 'USD', isSystemAccount: false, isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: uuidv4(), organizationId: demoOrgId, accountNumber: '6100', accountName: 'Operating Expenses', accountTypeId: 10, currency: 'USD', isSystemAccount: false, isActive: true, createdAt: new Date(), updatedAt: new Date() }
];

// Custom Field Definitions (initially empty, can be created via API)
const customFieldDefinitions = [];

// Cost Centers (Kostenstellen)
const costCenters = [
  {
    id: uuidv4(),
    organizationId: demoOrgId,
    costCenterNumber: '100',
    name: 'Administration',
    description: 'General administration and management',
    parentId: null,
    type: 'COST_CENTER',
    isActive: true,
    displayOrder: 1,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: uuidv4(),
    organizationId: demoOrgId,
    costCenterNumber: '200',
    name: 'Sales & Marketing',
    description: 'Sales and marketing department',
    parentId: null,
    type: 'PROFIT_CENTER',
    isActive: true,
    displayOrder: 2,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: uuidv4(),
    organizationId: demoOrgId,
    costCenterNumber: '300',
    name: 'Operations',
    description: 'Operational activities',
    parentId: null,
    type: 'COST_CENTER',
    isActive: true,
    displayOrder: 3,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Journal Entries with sample data
const journalEntries = [
  {
    id: uuidv4(),
    organizationId: demoOrgId,
    entryNumber: 'JE-2024-001',
    entryDate: new Date('2024-01-15'),
    description: 'Sales revenue for January',
    currency: 'USD',
    status: 'POSTED',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: uuidv4(),
    organizationId: demoOrgId,
    entryNumber: 'JE-2024-002',
    entryDate: new Date('2024-01-20'),
    description: 'Other income received',
    currency: 'USD',
    status: 'POSTED',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20')
  },
  {
    id: uuidv4(),
    organizationId: demoOrgId,
    entryNumber: 'JE-2024-003',
    entryDate: new Date('2024-02-01'),
    description: 'Cost of services',
    currency: 'USD',
    status: 'POSTED',
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01')
  },
  {
    id: uuidv4(),
    organizationId: demoOrgId,
    entryNumber: 'JE-2024-004',
    entryDate: new Date('2024-02-15'),
    description: 'Operating expenses - February',
    currency: 'USD',
    status: 'POSTED',
    createdAt: new Date('2024-02-15'),
    updatedAt: new Date('2024-02-15')
  }
];

// Get account IDs for journal entry lines
const cashAccount = accounts.find(a => a.accountNumber === '1000');
const salesRevenueAccount = accounts.find(a => a.accountNumber === '4000');
const otherIncomeAccount = accounts.find(a => a.accountNumber === '4100');
const costOfServicesAccount = accounts.find(a => a.accountNumber === '6000');
const operatingExpensesAccount = accounts.find(a => a.accountNumber === '6100');

const journalEntryLines = [
  // JE-2024-001: Sales revenue
  {
    id: uuidv4(),
    journalEntryId: journalEntries[0].id,
    accountId: cashAccount.id,
    lineNumber: 1,
    description: 'Cash received',
    debitAmount: 50000,
    creditAmount: 0,
    costCenter: null,
    costObject: null,
    createdAt: new Date('2024-01-15')
  },
  {
    id: uuidv4(),
    journalEntryId: journalEntries[0].id,
    accountId: salesRevenueAccount.id,
    lineNumber: 2,
    description: 'Sales revenue',
    debitAmount: 0,
    creditAmount: 50000,
    costCenter: null,
    costObject: null,
    createdAt: new Date('2024-01-15')
  },
  // JE-2024-002: Other income
  {
    id: uuidv4(),
    journalEntryId: journalEntries[1].id,
    accountId: cashAccount.id,
    lineNumber: 1,
    description: 'Other income received',
    debitAmount: 5000,
    creditAmount: 0,
    costCenter: null,
    costObject: null,
    createdAt: new Date('2024-01-20')
  },
  {
    id: uuidv4(),
    journalEntryId: journalEntries[1].id,
    accountId: otherIncomeAccount.id,
    lineNumber: 2,
    description: 'Other income',
    debitAmount: 0,
    creditAmount: 5000,
    costCenter: null,
    costObject: null,
    createdAt: new Date('2024-01-20')
  },
  // JE-2024-003: Cost of services
  {
    id: uuidv4(),
    journalEntryId: journalEntries[2].id,
    accountId: costOfServicesAccount.id,
    lineNumber: 1,
    description: 'Cost of services',
    debitAmount: 15000,
    creditAmount: 0,
    costCenter: null,
    costObject: null,
    createdAt: new Date('2024-02-01')
  },
  {
    id: uuidv4(),
    journalEntryId: journalEntries[2].id,
    accountId: cashAccount.id,
    lineNumber: 2,
    description: 'Cash paid for services',
    debitAmount: 0,
    creditAmount: 15000,
    costCenter: null,
    costObject: null,
    createdAt: new Date('2024-02-01')
  },
  // JE-2024-004: Operating expenses
  {
    id: uuidv4(),
    journalEntryId: journalEntries[3].id,
    accountId: operatingExpensesAccount.id,
    lineNumber: 1,
    description: 'Operating expenses',
    debitAmount: 8000,
    creditAmount: 0,
    costCenter: null,
    costObject: null,
    createdAt: new Date('2024-02-15')
  },
  {
    id: uuidv4(),
    journalEntryId: journalEntries[3].id,
    accountId: cashAccount.id,
    lineNumber: 2,
    description: 'Cash paid for expenses',
    debitAmount: 0,
    creditAmount: 8000,
    costCenter: null,
    costObject: null,
    createdAt: new Date('2024-02-15')
  }
];

const customFieldValues = [];

// Helper functions for reports
async function getDashboardMetrics(orgId, targetCurrency = 'USD') {
  const exchangeRateService = require('./exchange-rate-service');
  const entries = journalEntries.filter(e => e.organizationId === orgId && e.status === 'POSTED');
  const lines = journalEntryLines.filter(l => 
    entries.some(e => e.id === l.journalEntryId)
  );
  
  let totalAssets = 0, totalLiabilities = 0, totalEquity = 0;
  let totalRevenue = 0, totalExpenses = 0;
  
  for (const line of lines) {
    const account = accounts.find(a => a.id === line.accountId);
    if (!account) continue;
    
    const accountType = accountTypes.find(t => t.id === account.accountTypeId);
    if (!accountType) continue;
    
    // Get entry currency
    const entry = entries.find(e => e.id === line.journalEntryId);
    const entryCurrency = entry?.currency || 'USD';
    
    // Convert to target currency
    const rate = await exchangeRateService.getExchangeRate(entryCurrency, targetCurrency);
    const debitConverted = line.debitAmount * rate;
    const creditConverted = line.creditAmount * rate;
    const balance = debitConverted - creditConverted;
    
    if (accountType.category === 'ASSET') totalAssets += balance;
    if (accountType.category === 'LIABILITY') totalLiabilities += Math.abs(balance);
    if (accountType.category === 'EQUITY') totalEquity += Math.abs(balance);
    if (accountType.category === 'REVENUE') totalRevenue += Math.abs(balance);
    if (accountType.category === 'EXPENSE') totalExpenses += balance;
  }
  
  return {
    totalAssets,
    totalLiabilities,
    totalEquity,
    totalRevenue,
    totalExpenses,
    netIncome: totalRevenue - totalExpenses,
    entryCount: entries.length,
    accountCount: accounts.filter(a => a.organizationId === orgId && a.isActive).length,
    currency: targetCurrency
  };
}

async function getTrialBalance(orgId, targetCurrency = 'USD') {
  const exchangeRateService = require('./exchange-rate-service');
  const result = [];
  const orgAccounts = accounts.filter(a => a.organizationId === orgId && a.isActive);
  const orgEntries = journalEntries.filter(e => e.organizationId === orgId && e.status === 'POSTED');
  
  for (const account of orgAccounts) {
    const lines = journalEntryLines.filter(l => l.accountId === account.id);
    let totalDebits = 0;
    let totalCredits = 0;
    
    // Convert each line to target currency
    for (const line of lines) {
      const entry = orgEntries.find(e => e.id === line.journalEntryId);
      const entryCurrency = entry?.currency || 'USD';
      const rate = await exchangeRateService.getExchangeRate(entryCurrency, targetCurrency);
      
      totalDebits += (line.debitAmount || 0) * rate;
      totalCredits += (line.creditAmount || 0) * rate;
    }
    
    const accountType = accountTypes.find(t => t.id === account.accountTypeId);
    const balance = accountType?.normalBalance === 'DEBIT' 
      ? totalDebits - totalCredits 
      : totalCredits - totalDebits;
    
    result.push({
      accountId: account.id,
      accountNumber: account.accountNumber,
      accountName: account.accountName,
      accountCategory: accountType?.category || 'UNKNOWN',
      normalBalance: accountType?.normalBalance || 'DEBIT',
      totalDebits,
      totalCredits,
      balance,
      currency: targetCurrency
    });
  }
  
  return result;
}

async function getBalanceSheet(orgId, targetCurrency = 'USD') {
  const exchangeRateService = require('./exchange-rate-service');
  const result = [];
  const orgAccounts = accounts.filter(a => a.organizationId === orgId && a.isActive);
  const orgEntries = journalEntries.filter(e => e.organizationId === orgId && e.status === 'POSTED');
  
  for (const account of orgAccounts) {
    const accountType = accountTypes.find(t => t.id === account.accountTypeId);
    if (!accountType?.isBalanceSheet) continue;
    
    const lines = journalEntryLines.filter(l => l.accountId === account.id);
    let totalDebits = 0;
    let totalCredits = 0;
    
    // Convert to target currency
    for (const line of lines) {
      const entry = orgEntries.find(e => e.id === line.journalEntryId);
      const entryCurrency = entry?.currency || 'USD';
      const rate = await exchangeRateService.getExchangeRate(entryCurrency, targetCurrency);
      
      totalDebits += (line.debitAmount || 0) * rate;
      totalCredits += (line.creditAmount || 0) * rate;
    }
    
    const balance = accountType.normalBalance === 'DEBIT'
      ? totalDebits - totalCredits
      : totalCredits - totalDebits;
    
    result.push({
      category: accountType.category,
      accountTypeName: accountType.name,
      accountNumber: account.accountNumber,
      accountName: account.accountName,
      balance,
      currency: targetCurrency
    });
  }
  
  return result;
}

async function getProfitLoss(orgId, targetCurrency = 'USD') {
  const exchangeRateService = require('./exchange-rate-service');
  const result = [];
  const orgAccounts = accounts.filter(a => a.organizationId === orgId && a.isActive);
  const orgEntries = journalEntries.filter(e => e.organizationId === orgId && e.status === 'POSTED');
  
  for (const account of orgAccounts) {
    const accountType = accountTypes.find(t => t.id === account.accountTypeId);
    if (accountType?.isBalanceSheet) continue; // Skip balance sheet accounts
    
    const lines = journalEntryLines.filter(l => l.accountId === account.id);
    let totalDebits = 0;
    let totalCredits = 0;
    
    // Convert to target currency
    for (const line of lines) {
      const entry = orgEntries.find(e => e.id === line.journalEntryId);
      const entryCurrency = entry?.currency || 'USD';
      const rate = await exchangeRateService.getExchangeRate(entryCurrency, targetCurrency);
      
      totalDebits += (line.debitAmount || 0) * rate;
      totalCredits += (line.creditAmount || 0) * rate;
    }
    
    const amount = accountType?.category === 'EXPENSE'
      ? totalDebits - totalCredits
      : totalCredits - totalDebits;
    
    if (amount !== 0) {
      result.push({
        category: accountType?.category || 'UNKNOWN',
        accountTypeName: accountType?.name || 'Unknown',
        accountNumber: account.accountNumber,
        accountName: account.accountName,
        amount,
        currency: targetCurrency
      });
    }
  }
  
  return result;
}

module.exports = {
  organizations,
  accountTypes,
  accounts,
  customFieldDefinitions,
  journalEntries,
  journalEntryLines,
  customFieldValues,
  costCenters,
  getDashboardMetrics,
  getTrialBalance,
  getBalanceSheet,
  getProfitLoss
};

