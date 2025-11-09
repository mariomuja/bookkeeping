// Balance Sheet Report endpoint for Vercel Serverless
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
    // Demo Balance Sheet data
    const balanceSheetData = [
      // Assets
      {
        category: 'Asset',
        subcategory: 'Current Assets',
        accountNumber: '1000',
        accountName: 'Cash',
        amount: 25000.00
      },
      {
        category: 'Asset',
        subcategory: 'Current Assets',
        accountNumber: '1200',
        accountName: 'Accounts Receivable',
        amount: 15000.00
      },
      {
        category: 'Asset',
        subcategory: 'Fixed Assets',
        accountNumber: '1500',
        accountName: 'Equipment',
        amount: 50000.00
      },
      // Liabilities
      {
        category: 'Liability',
        subcategory: 'Current Liabilities',
        accountNumber: '2000',
        accountName: 'Accounts Payable',
        amount: 10000.00
      },
      {
        category: 'Liability',
        subcategory: 'Current Liabilities',
        accountNumber: '2100',
        accountName: 'Accrued Expenses',
        amount: 5000.00
      },
      // Equity
      {
        category: 'Equity',
        subcategory: 'Owner\'s Equity',
        accountNumber: '3000',
        accountName: 'Capital',
        amount: 60000.00
      },
      {
        category: 'Equity',
        subcategory: 'Retained Earnings',
        accountNumber: '3100',
        accountName: 'Retained Earnings',
        amount: 15000.00
      }
    ];

    res.status(200).json(balanceSheetData);
  } catch (error) {
    console.error('[Balance Sheet] Error:', error);
    res.status(500).json({
      error: 'Failed to generate balance sheet',
      message: error.message
    });
  }
};

