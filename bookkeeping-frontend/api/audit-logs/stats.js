// Audit logs statistics endpoint for Vercel Serverless
// Returns demo statistics

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
    // Demo statistics
    const stats = {
      totalLogs: 5,
      last24Hours: 5,
      last7Days: 5,
      byAction: {
        'LOGIN': 1,
        'CREATE': 1,
        'UPDATE': 1,
        'POST': 1,
        'GENERATE': 1
      },
      byEntityType: {
        'USER': 1,
        'JOURNAL_ENTRY': 2,
        'ACCOUNT': 1,
        'REPORT': 1
      },
      byUser: {
        'demo': 5
      }
    };

    res.status(200).json(stats);
  } catch (error) {
    console.error('[Audit Logs Stats] Error:', error);
    res.status(500).json({
      error: 'Failed to fetch audit logs statistics',
      message: error.message
    });
  }
};
