// Account frameworks endpoint - returns list of standard chart of accounts frameworks
module.exports = (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const frameworks = [
    {
      id: 'skr03',
      name: 'SKR 03',
      country: 'DE',
      description: 'Standard Chart of Accounts for Trade and Service Companies (Germany)',
      accountCount: 95
    },
    {
      id: 'skr04',
      name: 'SKR 04',
      country: 'DE',
      description: 'Standard Chart of Accounts for Industrial Companies (Germany)',
      accountCount: 102
    },
    {
      id: 'ifrs',
      name: 'IFRS',
      country: 'INT',
      description: 'International Financial Reporting Standards Chart of Accounts',
      accountCount: 78
    },
    {
      id: 'us-gaap',
      name: 'US GAAP',
      country: 'US',
      description: 'Generally Accepted Accounting Principles (United States)',
      accountCount: 85
    },
    {
      id: 'uk-gaap',
      name: 'UK GAAP',
      country: 'GB',
      description: 'Generally Accepted Accounting Practice (United Kingdom)',
      accountCount: 72
    }
  ];

  res.status(200).json(frameworks);
};



