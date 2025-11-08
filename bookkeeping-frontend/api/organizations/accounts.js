// Accounts endpoint
module.exports = (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const accounts = [
    {
      id: '1',
      organizationId: '550e8400-e29b-41d4-a716-446655440000',
      accountNumber: '1000',
      accountName: 'Cash',
      accountTypeId: 1,
      accountType: { id: 1, code: 'CASH', name: 'Cash', category: 'ASSET', normalBalance: 'DEBIT', isBalanceSheet: true, displayOrder: 1 },
      currency: 'USD',
      isSystemAccount: false,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '2',
      organizationId: '550e8400-e29b-41d4-a716-446655440000',
      accountNumber: '1200',
      accountName: 'Accounts Receivable',
      accountTypeId: 2,
      accountType: { id: 2, code: 'AR', name: 'Accounts Receivable', category: 'ASSET', normalBalance: 'DEBIT', isBalanceSheet: true, displayOrder: 2 },
      currency: 'USD',
      isSystemAccount: false,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '3',
      organizationId: '550e8400-e29b-41d4-a716-446655440000',
      accountNumber: '2000',
      accountName: 'Accounts Payable',
      accountTypeId: 3,
      accountType: { id: 3, code: 'AP', name: 'Accounts Payable', category: 'LIABILITY', normalBalance: 'CREDIT', isBalanceSheet: true, displayOrder: 3 },
      currency: 'USD',
      isSystemAccount: false,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '4',
      organizationId: '550e8400-e29b-41d4-a716-446655440000',
      accountNumber: '4000',
      accountName: 'Sales Revenue',
      accountTypeId: 4,
      accountType: { id: 4, code: 'REV', name: 'Sales Revenue', category: 'REVENUE', normalBalance: 'CREDIT', isBalanceSheet: false, displayOrder: 4 },
      currency: 'USD',
      isSystemAccount: false,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '5',
      organizationId: '550e8400-e29b-41d4-a716-446655440000',
      accountNumber: '5000',
      accountName: 'Operating Expenses',
      accountTypeId: 5,
      accountType: { id: 5, code: 'EXP', name: 'Operating Expenses', category: 'EXPENSE', normalBalance: 'DEBIT', isBalanceSheet: false, displayOrder: 5 },
      currency: 'USD',
      isSystemAccount: false,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  res.status(200).json(accounts);
};

