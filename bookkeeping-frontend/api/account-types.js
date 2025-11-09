// Account Types endpoint for Vercel Serverless
module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Demo Account Types
    const accountTypes = [
      {
        id: '1',
        name: 'Asset',
        category: 'BALANCE_SHEET',
        normalBalance: 'DEBIT',
        description: 'Assets are resources owned by the business',
        sortOrder: 1
      },
      {
        id: '2',
        name: 'Liability',
        category: 'BALANCE_SHEET',
        normalBalance: 'CREDIT',
        description: 'Liabilities are obligations owed to others',
        sortOrder: 2
      },
      {
        id: '3',
        name: 'Equity',
        category: 'BALANCE_SHEET',
        normalBalance: 'CREDIT',
        description: 'Equity represents owner\'s interest in the business',
        sortOrder: 3
      },
      {
        id: '4',
        name: 'Revenue',
        category: 'INCOME_STATEMENT',
        normalBalance: 'CREDIT',
        description: 'Revenue from business operations',
        sortOrder: 4
      },
      {
        id: '5',
        name: 'Expense',
        category: 'INCOME_STATEMENT',
        normalBalance: 'DEBIT',
        description: 'Costs incurred in business operations',
        sortOrder: 5
      },
      {
        id: '6',
        name: 'Cost of Goods Sold',
        category: 'INCOME_STATEMENT',
        normalBalance: 'DEBIT',
        description: 'Direct costs attributable to production',
        sortOrder: 6
      }
    ];

    res.status(200).json(accountTypes);
  } catch (error) {
    console.error('[Account Types] Error:', error);
    res.status(500).json({
      error: 'Failed to get account types',
      message: error.message
    });
  }
};

