// Organizations endpoint - using PostgreSQL database
const { getPool } = require('./_db');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

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
        WHERE is_active = true
        ORDER BY name ASC`
      );

      console.log(`[Organizations GET] Fetched ${result.rows.length} organizations from database`);
      return res.status(200).json(result.rows);
    } catch (error) {
      console.error('[Organizations GET] Database error:', error);
      
      // Fallback to demo org
      const organizations = [
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          name: 'Demo Company',
          countryCode: 'US',
          defaultCurrency: 'USD',
          defaultTimezone: 'America/New_York',
          fiscalYearStart: 1,
          fiscalYearEnd: 12,
          isActive: true
        }
      ];
      
      console.warn('[Organizations GET] Using fallback data due to database error');
      return res.status(200).json(organizations);
    }
  }

  if (req.method === 'POST') {
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

      if (!name || !countryCode || !defaultCurrency) {
        return res.status(400).json({ 
          error: 'name, countryCode, and defaultCurrency are required' 
        });
      }

      const result = await pool.query(
        `INSERT INTO organizations (
          name, country_code, default_currency, default_timezone,
          fiscal_year_start, fiscal_year_end
        ) VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING 
          id, name, country_code as "countryCode",
          default_currency as "defaultCurrency",
          default_timezone as "defaultTimezone",
          fiscal_year_start as "fiscalYearStart",
          fiscal_year_end as "fiscalYearEnd",
          is_active as "isActive",
          created_at as "createdAt",
          updated_at as "updatedAt"`,
        [
          name,
          countryCode,
          defaultCurrency,
          defaultTimezone || 'UTC',
          fiscalYearStart || 1,
          fiscalYearEnd || 12
        ]
      );

      console.log(`[Organizations POST] Created organization ${result.rows[0].id}`);
      return res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('[Organizations POST] Database error:', error);
      return res.status(500).json({
        error: 'Failed to create organization',
        message: error.message
      });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
};
