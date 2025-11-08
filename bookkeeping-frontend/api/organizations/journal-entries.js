// Journal entries endpoint - now using Neon PostgreSQL
const { getPool } = require('../_db');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const pool = getPool();
    const orgId = '550e8400-e29b-41d4-a716-446655440000';
    
    // Fetch journal entries with their lines
    const result = await pool.query(`
      SELECT 
        je.id,
        je.entry_number,
        je.entry_date,
        je.description,
        je.reference_number,
        je.status,
        je.posted_at,
        je.created_at,
        json_agg(
          json_build_object(
            'id', jel.id,
            'accountId', jel.account_id,
            'accountNumber', a.account_number,
            'accountName', a.account_name,
            'debitAmount', jel.debit_amount,
            'creditAmount', jel.credit_amount,
            'currency', jel.currency,
            'lineNumber', jel.line_number
          ) ORDER BY jel.line_number
        ) as lines
      FROM journal_entries je
      LEFT JOIN journal_entry_lines jel ON je.id = jel.journal_entry_id
      LEFT JOIN accounts a ON jel.account_id = a.id
      WHERE je.organization_id = $1
      GROUP BY je.id, je.entry_number, je.entry_date, je.description, je.reference_number, 
               je.status, je.posted_at, je.created_at
      ORDER BY je.entry_date DESC, je.entry_number DESC
      LIMIT 1000
    `, [orgId]);

    // Transform to frontend format
    const entries = result.rows.map(row => ({
      id: row.id,
      entryNumber: row.entry_number,
      entryDate: row.entry_date,
      date: row.entry_date,
      description: row.description,
      referenceNumber: row.reference_number,
      status: row.status,
      postedAt: row.posted_at,
      createdAt: row.created_at,
      lines: row.lines.map(line => ({
        id: line.id,
        accountId: line.accountId,
        account: {
          accountNumber: line.accountNumber,
          accountName: line.accountName
        },
        debitAmount: parseFloat(line.debitAmount) || 0,
        creditAmount: parseFloat(line.creditAmount) || 0,
        debit: parseFloat(line.debitAmount) || 0,
        credit: parseFloat(line.creditAmount) || 0,
        currency: line.currency
      })),
      totalDebit: row.lines.reduce((sum, l) => sum + (parseFloat(l.debitAmount) || 0), 0),
      totalCredit: row.lines.reduce((sum, l) => sum + (parseFloat(l.creditAmount) || 0), 0)
    }));

    res.status(200).json(entries);
  } catch (error) {
    console.error('[Journal Entries API] Error:', error);
    
    // Fallback to mock data
    const entries = [
      {
        id: '1',
        entryNumber: 'JE-001',
        date: '2025-01-15',
        description: 'Initial revenue entry',
        status: 'posted',
        totalDebit: 5000,
        totalCredit: 5000,
        lines: [
          {
            accountId: '1',
            accountCode: '1000',
            accountName: 'Cash',
            debit: 5000,
            credit: 0
          },
          {
            accountId: '4',
            accountCode: '4000',
            accountName: 'Sales Revenue',
            debit: 0,
            credit: 5000
          }
        ]
      }
    ];

    console.warn('[Journal Entries API] Using fallback mock data');
    res.status(200).json(entries);
  }
};

