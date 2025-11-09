// Account Types endpoint - using PostgreSQL database
const { getPool } = require('./_db');

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
    const pool = getPool();
    const result = await pool.query(
      `SELECT 
        id, code, name, category,
        normal_balance as "normalBalance",
        is_balance_sheet as "isBalanceSheet",
        display_order as "displayOrder"
      FROM account_types 
      ORDER BY display_order ASC`
    );

    console.log(`[Account Types] Fetched ${result.rows.length} account types from database`);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('[Account Types] Database error:', error);
    
    // Fallback to hardcoded data if database fails
    const accountTypes = [
      { id: 1, code: 'CASH', name: 'Cash', category: 'ASSET', normalBalance: 'DEBIT', isBalanceSheet: true, displayOrder: 1 },
      { id: 2, code: 'AR', name: 'Accounts Receivable', category: 'ASSET', normalBalance: 'DEBIT', isBalanceSheet: true, displayOrder: 2 },
      { id: 5, code: 'AP', name: 'Accounts Payable', category: 'LIABILITY', normalBalance: 'CREDIT', isBalanceSheet: true, displayOrder: 5 },
      { id: 7, code: 'EQUITY', name: 'Owner Equity', category: 'EQUITY', normalBalance: 'CREDIT', isBalanceSheet: true, displayOrder: 7 },
      { id: 9, code: 'SALES_REV', name: 'Sales Revenue', category: 'REVENUE', normalBalance: 'CREDIT', isBalanceSheet: false, displayOrder: 9 },
      { id: 12, code: 'OP_EXP', name: 'Operating Expenses', category: 'EXPENSE', normalBalance: 'DEBIT', isBalanceSheet: false, displayOrder: 12 }
    ];
    
    console.warn('[Account Types] Using fallback data due to database error');
    res.status(200).json(accountTypes);
  }
};
