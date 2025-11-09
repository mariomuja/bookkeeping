// Profit & Loss Report endpoint - calculated from PostgreSQL database
const { getPool } = require('../_db');

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
    const orgId = req.query.orgId || '550e8400-e29b-41d4-a716-446655440000';

    // Calculate P&L from journal entries (only posted entries)
    const result = await pool.query(
      `SELECT 
        at.category,
        at.name as "accountTypeName",
        a.account_number as "accountNumber",
        a.account_name as "accountName",
        CASE 
          WHEN at.category = 'REVENUE' THEN COALESCE(SUM(jel.credit_amount) - SUM(jel.debit_amount), 0)
          ELSE COALESCE(SUM(jel.debit_amount) - SUM(jel.credit_amount), 0)
        END as "amount"
      FROM accounts a
      LEFT JOIN account_types at ON a.account_type_id = at.id
      LEFT JOIN journal_entry_lines jel ON a.id = jel.account_id
      LEFT JOIN journal_entries je ON jel.journal_entry_id = je.id
      WHERE a.organization_id = $1 
        AND a.is_active = true
        AND at.is_balance_sheet = false
        AND (je.id IS NULL OR je.status = 'posted')
      GROUP BY a.id, a.account_number, a.account_name, at.category, at.name
      HAVING 
        (at.category = 'REVENUE' AND COALESCE(SUM(jel.credit_amount) - SUM(jel.debit_amount), 0) != 0)
        OR (at.category = 'EXPENSE' AND COALESCE(SUM(jel.debit_amount) - SUM(jel.credit_amount), 0) != 0)
      ORDER BY at.category DESC, a.account_number ASC`,
      [orgId]
    );

    // Convert decimal strings to numbers
    const profitLossData = result.rows.map(row => ({
      ...row,
      amount: parseFloat(row.amount)
    }));

    console.log(`[Profit & Loss] Calculated ${profitLossData.length} accounts for org ${orgId}`);
    res.status(200).json(profitLossData);
  } catch (error) {
    console.error('[Profit & Loss] Database error:', error);
    res.status(500).json({
      error: 'Failed to generate profit & loss statement',
      message: error.message
    });
  }
};
