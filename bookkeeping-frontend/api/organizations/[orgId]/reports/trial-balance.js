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
        accountNumber: '1000',
        accountName: 'Cash',
        accountType: 'Asset',
        debit: 25000.00,
        credit: 0,
        balance: 25000.00
      },
      {
        accountNumber: '1200',
        accountName: 'Accounts Receivable',
        accountType: 'Asset',
        debit: 15000.00,
        credit: 0,
        balance: 15000.00
      },
      {
        accountNumber: '1500',
        accountName: 'Equipment',
        accountType: 'Asset',
        debit: 50000.00,
        credit: 0,
        balance: 50000.00
      },
      {
        accountNumber: '2000',
        accountName: 'Accounts Payable',
        accountType: 'Liability',
        debit: 0,
        credit: 10000.00,
        balance: -10000.00
      },
      {
        accountNumber: '3000',
        accountName: 'Owner\'s Equity',
        accountType: 'Equity',
        debit: 0,
        credit: 60000.00,
        balance: -60000.00
      },
      {
        accountNumber: '4000',
        accountName: 'Revenue',
        accountType: 'Revenue',
        debit: 0,
        credit: 35000.00,
        balance: -35000.00
      },
      {
        accountNumber: '5000',
        accountName: 'Cost of Goods Sold',
        accountType: 'Expense',
        debit: 12000.00,
        credit: 0,
        balance: 12000.00
      },
      {
        accountNumber: '6000',
        accountName: 'Operating Expenses',
        accountType: 'Expense',
        debit: 8000.00,
        credit: 0,
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

