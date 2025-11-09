// Audit logs statistics endpoint - calculated from PostgreSQL database
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

    // Get statistics from database
    const [totalResult, last24Result, last7Result, byActionResult, byEntityResult, byUserResult] = await Promise.all([
      // Total logs
      pool.query('SELECT COUNT(*) as total FROM audit_logs'),
      
      // Last 24 hours
      pool.query(`SELECT COUNT(*) as total FROM audit_logs WHERE timestamp >= NOW() - INTERVAL '24 hours'`),
      
      // Last 7 days
      pool.query(`SELECT COUNT(*) as total FROM audit_logs WHERE timestamp >= NOW() - INTERVAL '7 days'`),
      
      // By action
      pool.query(`
        SELECT action, COUNT(*) as count 
        FROM audit_logs 
        GROUP BY action 
        ORDER BY count DESC 
        LIMIT 10
      `),
      
      // By entity type
      pool.query(`
        SELECT entity_type as "entityType", COUNT(*) as count 
        FROM audit_logs 
        GROUP BY entity_type 
        ORDER BY count DESC 
        LIMIT 10
      `),
      
      // By user
      pool.query(`
        SELECT username, COUNT(*) as count 
        FROM audit_logs 
        GROUP BY username 
        ORDER BY count DESC 
        LIMIT 10
      `)
    ]);

    // Transform results
    const byAction = {};
    byActionResult.rows.forEach(row => {
      byAction[row.action] = parseInt(row.count);
    });

    const byEntityType = {};
    byEntityResult.rows.forEach(row => {
      byEntityType[row.entityType] = parseInt(row.count);
    });

    const byUser = {};
    byUserResult.rows.forEach(row => {
      byUser[row.username] = parseInt(row.count);
    });

    const stats = {
      totalLogs: parseInt(totalResult.rows[0].total),
      last24Hours: parseInt(last24Result.rows[0].total),
      last7Days: parseInt(last7Result.rows[0].total),
      byAction,
      byEntityType,
      byUser
    };

    console.log(`[Audit Logs Stats] Calculated stats: ${stats.totalLogs} total logs`);
    res.status(200).json(stats);
  } catch (error) {
    console.error('[Audit Logs Stats] Database error:', error);
    
    // Fallback to empty stats
    res.status(200).json({
      totalLogs: 0,
      last24Hours: 0,
      last7Days: 0,
      byAction: {},
      byEntityType: {},
      byUser: {}
    });
  }
};
