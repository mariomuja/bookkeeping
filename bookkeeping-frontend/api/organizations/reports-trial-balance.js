// Trial Balance Report endpoint - calculated from PostgreSQL database
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
    const fiscalPeriodId = req.query.fiscalPeriodId;

    // Build query to calculate trial balance from journal entries
    let query = `
      SELECT 
        a.id as "accountId",
        a.account_number as "accountNumber",
        a.account_name as "accountName",
        at.category as "accountCategory",
        at.normal_balance as "normalBalance",
        COALESCE(SUM(jel.debit_amount), 0) as "totalDebits",
        COALESCE(SUM(jel.credit_amount), 0) as "totalCredits",
        COALESCE(SUM(jel.debit_amount) - SUM(jel.credit_amount), 0) as "balance"
      FROM accounts a
      LEFT JOIN account_types at ON a.account_type_id = at.id
      LEFT JOIN journal_entry_lines jel ON a.id = jel.account_id
      LEFT JOIN journal_entries je ON jel.journal_entry_id = je.id
      WHERE a.organization_id = $1 
        AND a.is_active = true
        AND (je.id IS NULL OR je.status = 'posted')
    `;

    const params = [orgId];

    if (fiscalPeriodId) {
      query += ` AND je.fiscal_period_id = $2`;
      params.push(fiscalPeriodId);
    }

    query += `
      GROUP BY a.id, a.account_number, a.account_name, at.category, at.normal_balance
      HAVING COALESCE(SUM(jel.debit_amount), 0) != 0 OR COALESCE(SUM(jel.credit_amount), 0) != 0
      ORDER BY a.account_number ASC
    `;

    const result = await pool.query(query, params);

    // Convert decimal strings to numbers
    const trialBalanceData = result.rows.map(row => ({
      ...row,
      totalDebits: parseFloat(row.totalDebits),
      totalCredits: parseFloat(row.totalCredits),
      balance: parseFloat(row.balance)
    }));

    console.log(`[Trial Balance] Calculated ${trialBalanceData.length} accounts for org ${orgId}`);
    res.status(200).json(trialBalanceData);
  } catch (error) {
    console.error('[Trial Balance] Database error:', error);
    res.status(500).json({
      error: 'Failed to generate trial balance',
      message: error.message
    });
  }
};
