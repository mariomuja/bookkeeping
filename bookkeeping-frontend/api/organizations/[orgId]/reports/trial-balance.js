// Trial Balance Report endpoint for Vercel Serverless
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
    // Demo Trial Balance data
    const trialBalanceData = [
      {
        accountId: 'acc-1000',
        accountNumber: '1000',
        accountName: 'Cash',
        accountCategory: 'Asset',
        normalBalance: 'DEBIT',
        totalDebits: 25000.00,
        totalCredits: 0,
        balance: 25000.00
      },
      {
        accountId: 'acc-1200',
        accountNumber: '1200',
        accountName: 'Accounts Receivable',
        accountCategory: 'Asset',
        normalBalance: 'DEBIT',
        totalDebits: 15000.00,
        totalCredits: 0,
        balance: 15000.00
      },
      {
        accountId: 'acc-1500',
        accountNumber: '1500',
        accountName: 'Equipment',
        accountCategory: 'Asset',
        normalBalance: 'DEBIT',
        totalDebits: 50000.00,
        totalCredits: 0,
        balance: 50000.00
      },
      {
        accountId: 'acc-2000',
        accountNumber: '2000',
        accountName: 'Accounts Payable',
        accountCategory: 'Liability',
        normalBalance: 'CREDIT',
        totalDebits: 0,
        totalCredits: 10000.00,
        balance: -10000.00
      },
      {
        accountId: 'acc-3000',
        accountNumber: '3000',
        accountName: 'Owner\'s Equity',
        accountCategory: 'Equity',
        normalBalance: 'CREDIT',
        totalDebits: 0,
        totalCredits: 60000.00,
        balance: -60000.00
      },
      {
        accountId: 'acc-4000',
        accountNumber: '4000',
        accountName: 'Revenue',
        accountCategory: 'Revenue',
        normalBalance: 'CREDIT',
        totalDebits: 0,
        totalCredits: 35000.00,
        balance: -35000.00
      },
      {
        accountId: 'acc-5000',
        accountNumber: '5000',
        accountName: 'Cost of Goods Sold',
        accountCategory: 'Expense',
        normalBalance: 'DEBIT',
        totalDebits: 12000.00,
        totalCredits: 0,
        balance: 12000.00
      },
      {
        accountId: 'acc-6000',
        accountNumber: '6000',
        accountName: 'Operating Expenses',
        accountCategory: 'Expense',
        normalBalance: 'DEBIT',
        totalDebits: 8000.00,
        totalCredits: 0,
        balance: 8000.00
      }
    ];

    res.status(200).json(trialBalanceData);
  } catch (error) {
    console.error('[Trial Balance] Error:', error);
    res.status(500).json({
      error: 'Failed to generate trial balance',
      message: error.message
    });
  }
};

