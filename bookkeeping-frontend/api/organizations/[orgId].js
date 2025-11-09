// Single Organization endpoint - using PostgreSQL database
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

  const { orgId } = req.query;

  if (req.method === 'GET') {
    try {
      const pool = getPool();
      const result = await pool.query(
        `SELECT 
          id, name, country_code as "countryCode",
          default_currency as "defaultCurrency",
          default_timezone as "defaultTimezone",
          fiscal_year_start as "fiscalYearStart",
          fiscal_year_end as "fiscalYearEnd",
          is_active as "isActive",
          created_at as "createdAt",
          updated_at as "updatedAt"
        FROM organizations 
        WHERE id = $1`,
        [orgId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Organization not found' });
      }

      return res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error('[Organization GET] Database error:', error);
      
      // Fallback to demo org if it's the demo ID
      if (orgId === '550e8400-e29b-41d4-a716-446655440000') {
        return res.status(200).json({
          id: orgId,
          name: 'Demo Company',
          countryCode: 'US',
          defaultCurrency: 'USD',
          defaultTimezone: 'America/New_York',
          fiscalYearStart: 1,
          fiscalYearEnd: 12,
          isActive: true
        });
      }
      
      return res.status(500).json({
        error: 'Failed to get organization',
        message: error.message
      });
    }
  }

  if (req.method === 'PUT') {
    try {
      const pool = getPool();
      const {
        name,
        countryCode,
        defaultCurrency,
        defaultTimezone,
        fiscalYearStart,
        fiscalYearEnd
      } = req.body;

      const result = await pool.query(
        `UPDATE organizations 
        SET 
          name = COALESCE($2, name),
          country_code = COALESCE($3, country_code),
          default_currency = COALESCE($4, default_currency),
          default_timezone = COALESCE($5, default_timezone),
          fiscal_year_start = COALESCE($6, fiscal_year_start),
          fiscal_year_end = COALESCE($7, fiscal_year_end),
          updated_at = NOW()
        WHERE id = $1
        RETURNING 
          id, name, country_code as "countryCode",
          default_currency as "defaultCurrency",
          default_timezone as "defaultTimezone",
          fiscal_year_start as "fiscalYearStart",
          fiscal_year_end as "fiscalYearEnd",
          is_active as "isActive",
          created_at as "createdAt",
          updated_at as "updatedAt"`,
        [orgId, name, countryCode, defaultCurrency, defaultTimezone, fiscalYearStart, fiscalYearEnd]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Organization not found' });
      }

      console.log(`[Organization PUT] Updated organization ${orgId}`);
      return res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error('[Organization PUT] Database error:', error);
      return res.status(500).json({
        error: 'Failed to update organization',
        message: error.message
      });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const pool = getPool();
      
      // Soft delete
      const result = await pool.query(
        'UPDATE organizations SET is_active = false, updated_at = NOW() WHERE id = $1 RETURNING id',
        [orgId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Organization not found' });
      }

      console.log(`[Organization DELETE] Deleted organization ${orgId}`);
      return res.status(200).json({ success: true, message: 'Organization deleted' });
    } catch (error) {
      console.error('[Organization DELETE] Database error:', error);
      return res.status(500).json({
        error: 'Failed to delete organization',
        message: error.message
      });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
};
