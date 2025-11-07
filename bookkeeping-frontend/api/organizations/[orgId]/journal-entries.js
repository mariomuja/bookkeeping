// Journal entries endpoint
module.exports = (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const entries = [
    {
      id: '1',
      entryNumber: 'JE-001',
      date: '2025-01-15',
      description: 'Initial revenue entry',
      status: 'posted',
      totalDebit: 5000,
      totalCredit: 5000,
      lines: [
        {
          accountId: '1',
          accountCode: '1000',
          accountName: 'Cash',
          debit: 5000,
          credit: 0
        },
        {
          accountId: '4',
          accountCode: '4000',
          accountName: 'Sales Revenue',
          debit: 0,
          credit: 5000
        }
      ]
    }
  ];

  res.status(200).json(entries);
};

