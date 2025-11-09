// Profit & Loss Report endpoint for Vercel Serverless
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
    // Demo Profit & Loss data
    const profitLossData = [
      // Revenue
      {
        category: 'Revenue',
        subcategory: 'Sales',
        accountNumber: '4000',
        accountName: 'Product Sales',
        amount: 30000.00
      },
      {
        category: 'Revenue',
        subcategory: 'Sales',
        accountNumber: '4100',
        accountName: 'Service Revenue',
        amount: 15000.00
      },
      {
        category: 'Revenue',
        subcategory: 'Other Income',
        accountNumber: '4900',
        accountName: 'Interest Income',
        amount: 500.00
      },
      // Cost of Goods Sold
      {
        category: 'Cost of Goods Sold',
        subcategory: 'Direct Costs',
        accountNumber: '5000',
        accountName: 'Product Costs',
        amount: 12000.00
      },
      {
        category: 'Cost of Goods Sold',
        subcategory: 'Direct Costs',
        accountNumber: '5100',
        accountName: 'Service Costs',
        amount: 5000.00
      },
      // Operating Expenses
      {
        category: 'Operating Expenses',
        subcategory: 'General & Administrative',
        accountNumber: '6000',
        accountName: 'Salaries',
        amount: 15000.00
      },
      {
        category: 'Operating Expenses',
        subcategory: 'General & Administrative',
        accountNumber: '6100',
        accountName: 'Rent',
        amount: 3000.00
      },
      {
        category: 'Operating Expenses',
        subcategory: 'Marketing',
        accountNumber: '6200',
        accountName: 'Advertising',
        amount: 2000.00
      },
      {
        category: 'Operating Expenses',
        subcategory: 'General & Administrative',
        accountNumber: '6300',
        accountName: 'Utilities',
        amount: 800.00
      },
      {
        category: 'Operating Expenses',
        subcategory: 'General & Administrative',
        accountNumber: '6400',
        accountName: 'Office Supplies',
        amount: 500.00
      }
    ];

    res.status(200).json(profitLossData);
  } catch (error) {
    console.error('[Profit & Loss] Error:', error);
    res.status(500).json({
      error: 'Failed to generate profit & loss statement',
      message: error.message
    });
  }
};

