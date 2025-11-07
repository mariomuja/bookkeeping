// Dashboard metrics endpoint
module.exports = (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const metrics = {
    totalAssets: 245680.50,
    totalLiabilities: 128450.25,
    totalEquity: 117230.25,
    revenue: 62000.00,
    expenses: 38200.00,
    netIncome: 23800.00,
    accountsCount: 45,
    journalEntriesCount: 128,
    pendingEntries: 3
  };

  res.status(200).json(metrics);
};


