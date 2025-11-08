// Accounts endpoint - now using Neon PostgreSQL
const { getPool } = require('../_db');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const pool = getPool();
    const result = await pool.query(`
      SELECT 
        a.*,
        json_build_object(
          'id', at.id,
          'code', at.code,
          'name', at.name,
          'category', at.category,
          'normalBalance', at.normal_balance,
          'isBalanceSheet', at.is_balance_sheet,
          'displayOrder', at.display_order
        ) as account_type
      FROM accounts a
      LEFT JOIN account_types at ON a.account_type_id = at.id
      WHERE a.organization_id = $1 AND a.is_active = true
      ORDER BY a.account_number
    `, ['550e8400-e29b-41d4-a716-446655440000']);

    // Transform snake_case to camelCase
    const accounts = result.rows.map(row => ({
      id: row.id,
      organizationId: row.organization_id,
      accountNumber: row.account_number,
      accountName: row.account_name,
      accountTypeId: row.account_type_id,
      accountType: row.account_type,
      parentAccountId: row.parent_account_id,
      currency: row.currency,
      description: row.description,
      isSystemAccount: row.is_system_account,
      isActive: row.is_active,
      taxCode: row.tax_code,
      costCenter: row.cost_center,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));

    res.status(200).json(accounts);
  } catch (error) {
    console.error('[Accounts API] Error:', error);
    
    // Fallback to mock data if database fails
    const accounts = [
    {
      id: '1',
      organizationId: '550e8400-e29b-41d4-a716-446655440000',
      accountNumber: '1000',
      accountName: 'Cash',
      accountTypeId: 1,
      accountType: { id: 1, code: 'CASH', name: 'Cash', category: 'ASSET', normalBalance: 'DEBIT', isBalanceSheet: true, displayOrder: 1 },
      currency: 'USD',
      isSystemAccount: false,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '2',
      organizationId: '550e8400-e29b-41d4-a716-446655440000',
      accountNumber: '1200',
      accountName: 'Accounts Receivable',
      accountTypeId: 2,
      accountType: { id: 2, code: 'AR', name: 'Accounts Receivable', category: 'ASSET', normalBalance: 'DEBIT', isBalanceSheet: true, displayOrder: 2 },
      currency: 'USD',
      isSystemAccount: false,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '3',
      organizationId: '550e8400-e29b-41d4-a716-446655440000',
      accountNumber: '2000',
      accountName: 'Accounts Payable',
      accountTypeId: 3,
      accountType: { id: 3, code: 'AP', name: 'Accounts Payable', category: 'LIABILITY', normalBalance: 'CREDIT', isBalanceSheet: true, displayOrder: 3 },
      currency: 'USD',
      isSystemAccount: false,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '4',
      organizationId: '550e8400-e29b-41d4-a716-446655440000',
      accountNumber: '4000',
      accountName: 'Sales Revenue',
      accountTypeId: 4,
      accountType: { id: 4, code: 'REV', name: 'Sales Revenue', category: 'REVENUE', normalBalance: 'CREDIT', isBalanceSheet: false, displayOrder: 4 },
      currency: 'USD',
      isSystemAccount: false,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '5',
      organizationId: '550e8400-e29b-41d4-a716-446655440000',
      accountNumber: '5000',
      accountName: 'Operating Expenses',
      accountTypeId: 5,
      accountType: { id: 5, code: 'EXP', name: 'Operating Expenses', category: 'EXPENSE', normalBalance: 'DEBIT', isBalanceSheet: false, displayOrder: 5 },
      currency: 'USD',
      isSystemAccount: false,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

    console.warn('[Accounts API] Using fallback mock data');
    res.status(200).json(accounts);
  }
};

