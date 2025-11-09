// Single Account endpoint - using PostgreSQL database
const { getPool } = require('../_db');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const pool = getPool();
      const result = await pool.query(
        `SELECT 
          a.id, a.organization_id as "organizationId",
          a.account_number as "accountNumber",
          a.account_name as "accountName",
          a.account_type_id as "accountTypeId",
          a.currency, a.description,
          a.is_system_account as "isSystemAccount",
          a.is_active as "isActive",
          a.created_at as "createdAt",
          a.updated_at as "updatedAt",
          at.name as "accountTypeName"
        FROM accounts a
        LEFT JOIN account_types at ON a.account_type_id = at.id
        WHERE a.id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Account not found' });
      }

      return res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error('[Account GET] Database error:', error);
      return res.status(500).json({
        error: 'Failed to get account',
        message: error.message
      });
    }
  }

  if (req.method === 'PUT') {
    try {
      const pool = getPool();
      const {
        accountNumber,
        accountName,
        accountTypeId,
        currency,
        description,
        isActive
      } = req.body;

      const result = await pool.query(
        `UPDATE accounts 
        SET 
          account_number = COALESCE($2, account_number),
          account_name = COALESCE($3, account_name),
          account_type_id = COALESCE($4, account_type_id),
          currency = COALESCE($5, currency),
          description = $6,
          is_active = COALESCE($7, is_active),
          updated_at = NOW()
        WHERE id = $1
        RETURNING 
          id, organization_id as "organizationId",
          account_number as "accountNumber",
          account_name as "accountName",
          account_type_id as "accountTypeId",
          currency, description,
          is_system_account as "isSystemAccount",
          is_active as "isActive",
          created_at as "createdAt",
          updated_at as "updatedAt"`,
        [id, accountNumber, accountName, accountTypeId, currency, description, isActive]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Account not found' });
      }

      console.log(`[Account PUT] Updated account ${id}`);
      return res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error('[Account PUT] Database error:', error);
      
      // Check for unique constraint violation
      if (error.code === '23505') {
        return res.status(400).json({
          error: 'An account with this number already exists',
          message: error.message
        });
      }
      
      return res.status(500).json({
        error: 'Failed to update account',
        message: error.message
      });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const pool = getPool();
      
      // Soft delete by setting is_active = false
      const result = await pool.query(
        'UPDATE accounts SET is_active = false, updated_at = NOW() WHERE id = $1 RETURNING id',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Account not found' });
      }

      console.log(`[Account DELETE] Deleted account ${id}`);
      return res.status(200).json({ success: true, message: 'Account deleted' });
    } catch (error) {
      console.error('[Account DELETE] Database error:', error);
      return res.status(500).json({
        error: 'Failed to delete account',
        message: error.message
      });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
};
