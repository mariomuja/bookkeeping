// Mock Data for BookKeeper Pro
const { v4: uuidv4 } = require('uuid');
const config = require('./config');

const demoOrgId = config.demoOrgId;

// Organizations
const organizations = [
  {
    id: demoOrgId,
    name: 'Demo Insurance Company',
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
  { id: uuidv4(), organizationId: demoOrgId, accountNumber: '2100', accountName: 'Claims Payable', accountTypeId: 4, currency: 'USD', isSystemAccount: false, isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: uuidv4(), organizationId: demoOrgId, accountNumber: '3000', accountName: 'Owner Equity', accountTypeId: 6, currency: 'USD', isSystemAccount: false, isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: uuidv4(), organizationId: demoOrgId, accountNumber: '4000', accountName: 'Premium Revenue', accountTypeId: 8, currency: 'USD', isSystemAccount: false, isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: uuidv4(), organizationId: demoOrgId, accountNumber: '4100', accountName: 'Investment Income', accountTypeId: 8, currency: 'USD', isSystemAccount: false, isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: uuidv4(), organizationId: demoOrgId, accountNumber: '6000', accountName: 'Claims Expense', accountTypeId: 10, currency: 'USD', isSystemAccount: false, isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: uuidv4(), organizationId: demoOrgId, accountNumber: '6100', accountName: 'Operating Expenses', accountTypeId: 10, currency: 'USD', isSystemAccount: false, isActive: true, createdAt: new Date(), updatedAt: new Date() }
];

// Custom Field Definitions (initially empty, can be created via API)
const customFieldDefinitions = [];

// Journal Entries (initially empty, will be populated by generator)
const journalEntries = [];
const journalEntryLines = [];
const customFieldValues = [];

// Helper functions for reports
function getDashboardMetrics(orgId) {
  const entries = journalEntries.filter(e => e.organizationId === orgId && e.status === 'POSTED');
  const lines = journalEntryLines.filter(l => 
    entries.some(e => e.id === l.journalEntryId)
  );
  
  let totalAssets = 0, totalLiabilities = 0, totalEquity = 0;
  let totalRevenue = 0, totalExpenses = 0;
  
  lines.forEach(line => {
    const account = accounts.find(a => a.id === line.accountId);
    if (!account) return;
    
    const accountType = accountTypes.find(t => t.id === account.accountTypeId);
    if (!accountType) return;
    
    const balance = line.debitAmount - line.creditAmount;
    
    if (accountType.category === 'ASSET') totalAssets += balance;
    if (accountType.category === 'LIABILITY') totalLiabilities += Math.abs(balance);
    if (accountType.category === 'EQUITY') totalEquity += Math.abs(balance);
    if (accountType.category === 'REVENUE') totalRevenue += Math.abs(balance);
    if (accountType.category === 'EXPENSE') totalExpenses += balance;
  });
  
  return {
    totalAssets,
    totalLiabilities,
    totalEquity,
    totalRevenue,
    totalExpenses,
    netIncome: totalRevenue - totalExpenses,
    entryCount: entries.length,
    accountCount: accounts.filter(a => a.organizationId === orgId && a.isActive).length
  };
}

function getTrialBalance(orgId) {
  const result = [];
  const orgAccounts = accounts.filter(a => a.organizationId === orgId && a.isActive);
  
  orgAccounts.forEach(account => {
    const lines = journalEntryLines.filter(l => l.accountId === account.id);
    const totalDebits = lines.reduce((sum, l) => sum + (l.debitAmount || 0), 0);
    const totalCredits = lines.reduce((sum, l) => sum + (l.creditAmount || 0), 0);
    
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
      balance
    });
  });
  
  return result;
}

function getBalanceSheet(orgId) {
  const result = [];
  const orgAccounts = accounts.filter(a => a.organizationId === orgId && a.isActive);
  
  orgAccounts.forEach(account => {
    const accountType = accountTypes.find(t => t.id === account.accountTypeId);
    if (!accountType?.isBalanceSheet) return;
    
    const lines = journalEntryLines.filter(l => l.accountId === account.id);
    const totalDebits = lines.reduce((sum, l) => sum + (l.debitAmount || 0), 0);
    const totalCredits = lines.reduce((sum, l) => sum + (l.creditAmount || 0), 0);
    
    const balance = accountType.normalBalance === 'DEBIT'
      ? totalDebits - totalCredits
      : totalCredits - totalDebits;
    
    result.push({
      category: accountType.category,
      accountTypeName: accountType.name,
      accountNumber: account.accountNumber,
      accountName: account.accountName,
      balance
    });
  });
  
  return result;
}

function getProfitLoss(orgId) {
  const result = [];
  const orgAccounts = accounts.filter(a => a.organizationId === orgId && a.isActive);
  
  orgAccounts.forEach(account => {
    const accountType = accountTypes.find(t => t.id === account.accountTypeId);
    if (accountType?.isBalanceSheet) return; // Skip balance sheet accounts
    
    const lines = journalEntryLines.filter(l => l.accountId === account.id);
    const totalDebits = lines.reduce((sum, l) => sum + (l.debitAmount || 0), 0);
    const totalCredits = lines.reduce((sum, l) => sum + (l.creditAmount || 0), 0);
    
    const amount = accountType?.category === 'EXPENSE'
      ? totalDebits - totalCredits
      : totalCredits - totalDebits;
    
    if (amount !== 0) {
      result.push({
        category: accountType?.category || 'UNKNOWN',
        accountTypeName: accountType?.name || 'Unknown',
        accountNumber: account.accountNumber,
        accountName: account.accountName,
        amount
      });
    }
  });
  
  return result;
}

function getPolicySummary(orgId) {
  const policyField = customFieldDefinitions.find(f => 
    f.organizationId === orgId && f.fieldName === 'policy_number'
  );
  
  if (!policyField) return [];
  
  const entriesWithPolicies = customFieldValues
    .filter(cf => cf.fieldDefinitionId === policyField.id)
    .map(cf => ({
      policyNumber: cf.fieldValue,
      entryId: cf.journalEntryId
    }));
  
  // Group by policy number
  const grouped = {};
  entriesWithPolicies.forEach(item => {
    if (!grouped[item.policyNumber]) {
      grouped[item.policyNumber] = {
        policyNumber: item.policyNumber,
        entryCount: 0,
        totalDebits: 0,
        totalCredits: 0,
        entries: []
      };
    }
    grouped[item.policyNumber].entries.push(item.entryId);
  });
  
  // Calculate totals
  Object.values(grouped).forEach(policy => {
    policy.entryCount = policy.entries.length;
    policy.entries.forEach(entryId => {
      const lines = journalEntryLines.filter(l => l.journalEntryId === entryId);
      policy.totalDebits += lines.reduce((sum, l) => sum + (l.debitAmount || 0), 0);
      policy.totalCredits += lines.reduce((sum, l) => sum + (l.creditAmount || 0), 0);
    });
    delete policy.entries; // Remove from response
  });
  
  return Object.values(grouped);
}

function getClaimSummary(orgId) {
  const claimField = customFieldDefinitions.find(f => 
    f.organizationId === orgId && f.fieldName === 'claim_number'
  );
  
  if (!claimField) return [];
  
  const entriesWithClaims = customFieldValues
    .filter(cf => cf.fieldDefinitionId === claimField.id)
    .map(cf => ({
      claimNumber: cf.fieldValue,
      entryId: cf.journalEntryId
    }));
  
  // Group by claim number
  const grouped = {};
  entriesWithClaims.forEach(item => {
    if (!grouped[item.claimNumber]) {
      grouped[item.claimNumber] = {
        claimNumber: item.claimNumber,
        entryCount: 0,
        totalClaimPayments: 0,
        entries: []
      };
    }
    grouped[item.claimNumber].entries.push(item.entryId);
  });
  
  // Calculate totals
  Object.values(grouped).forEach(claim => {
    claim.entryCount = claim.entries.length;
    claim.entries.forEach(entryId => {
      const lines = journalEntryLines.filter(l => l.journalEntryId === entryId);
      claim.totalClaimPayments += lines.reduce((sum, l) => sum + (l.creditAmount || 0), 0);
    });
    delete claim.entries;
  });
  
  return Object.values(grouped);
}

module.exports = {
  organizations,
  accountTypes,
  accounts,
  customFieldDefinitions,
  journalEntries,
  journalEntryLines,
  customFieldValues,
  getDashboardMetrics,
  getTrialBalance,
  getBalanceSheet,
  getProfitLoss,
  getPolicySummary,
  getClaimSummary
};

