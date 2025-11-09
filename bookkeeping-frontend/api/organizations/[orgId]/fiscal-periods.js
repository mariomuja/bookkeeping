// Fiscal Periods endpoint - using PostgreSQL database
const { getPool } = require('../../_db');

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

  const { orgId } = req.query;

  if (req.method === 'GET') {
    try {
      const pool = getPool();
      
      // Check if fiscal_periods table exists
      const tableCheck = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'fiscal_periods'
        )
      `);
      
      if (!tableCheck.rows[0].exists) {
        // Return demo data if table doesn't exist
        const currentYear = new Date().getFullYear();
        return res.status(200).json([
          {
            id: 'fp-2024',
            organizationId: orgId,
            name: `FY ${currentYear}`,
            startDate: `${currentYear}-01-01`,
            endDate: `${currentYear}-12-31`,
            isClosed: false,
            closedAt: null,
            closedBy: null,
            createdAt: `${currentYear}-01-01T00:00:00Z`
          }
        ]);
      }

      const result = await pool.query(
        `SELECT 
          id, organization_id as "organizationId", name,
          start_date as "startDate", end_date as "endDate",
          is_closed as "isClosed",
          closed_at as "closedAt", closed_by as "closedBy",
          created_at as "createdAt"
        FROM fiscal_periods
        WHERE organization_id = $1
        ORDER BY start_date DESC`,
        [orgId]
      );

      console.log(`[Fiscal Periods GET] Found ${result.rows.length} periods for org ${orgId}`);
      return res.status(200).json(result.rows);
    } catch (error) {
      console.error('[Fiscal Periods GET] Database error:', error);
      
      // Return demo data on error
      const currentYear = new Date().getFullYear();
      return res.status(200).json([
        {
          id: 'fp-demo',
          organizationId: orgId,
          name: `FY ${currentYear}`,
          startDate: `${currentYear}-01-01`,
          endDate: `${currentYear}-12-31`,
          isClosed: false
        }
      ]);
    }
  }

  if (req.method === 'POST') {
    try {
      const pool = getPool();
      const { name, startDate, endDate } = req.body;

      if (!name || !startDate || !endDate) {
        return res.status(400).json({ 
          error: 'name, startDate, and endDate are required' 
        });
      }

      const result = await pool.query(
        `INSERT INTO fiscal_periods (
          organization_id, name, start_date, end_date
        ) VALUES ($1, $2, $3, $4)
        RETURNING 
          id, organization_id as "organizationId", name,
          start_date as "startDate", end_date as "endDate",
          is_closed as "isClosed",
          closed_at as "closedAt", closed_by as "closedBy",
          created_at as "createdAt"`,
        [orgId, name, startDate, endDate]
      );

      console.log(`[Fiscal Periods POST] Created period ${result.rows[0].id}`);
      return res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('[Fiscal Periods POST] Database error:', error);
      return res.status(500).json({
        error: 'Failed to create fiscal period',
        message: error.message
      });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
};
