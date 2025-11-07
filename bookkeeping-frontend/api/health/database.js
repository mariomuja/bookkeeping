const db = require('../_db');

module.exports = async (req, res) => {
  try {
    const startTime = Date.now();
    
    // Test database query
    const result = await db.query('SELECT NOW() as current_time, version() as version');
    
    const responseTime = Date.now() - startTime;
    
    res.status(200).json({
      connected: true,
      database: 'Neon PostgreSQL',
      responseTime: `${responseTime}ms`,
      currentTime: result.rows[0].current_time,
      version: result.rows[0].version.split(' ')[0], // e.g., "PostgreSQL 15.3"
      status: 'OK'
    });
  } catch (error) {
    console.error('[Database Health] Error:', error);
    res.status(503).json({
      connected: false,
      error: error.message,
      status: 'ERROR'
    });
  }
};


