// Accounts endpoint
module.exports = (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const accounts = [
    {
      id: '1',
      code: '1000',
      name: 'Cash',
      accountType: 'asset',
      subType: 'current-asset',
      currency: 'USD',
      balance: 50000,
      isActive: true
    },
    {
      id: '2',
      code: '1200',
      name: 'Accounts Receivable',
      accountType: 'asset',
      subType: 'current-asset',
      currency: 'USD',
      balance: 35000,
      isActive: true
    },
    {
      id: '3',
      code: '2000',
      name: 'Accounts Payable',
      accountType: 'liability',
      subType: 'current-liability',
      currency: 'USD',
      balance: 22000,
      isActive: true
    },
    {
      id: '4',
      code: '4000',
      name: 'Sales Revenue',
      accountType: 'revenue',
      subType: 'operating-revenue',
      currency: 'USD',
      balance: 62000,
      isActive: true
    },
    {
      id: '5',
      code: '5000',
      name: 'Operating Expenses',
      accountType: 'expense',
      subType: 'operating-expense',
      currency: 'USD',
      balance: 38200,
      isActive: true
    }
  ];

  res.status(200).json(accounts);
};


