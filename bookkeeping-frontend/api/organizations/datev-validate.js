// DATEV Validation endpoint for Vercel Serverless
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
    console.log('[DATEV Validation] Request received');
    
    // Demo validation response - all valid
    const validationResult = {
      valid: true,
      errors: [],
      warnings: [
        {
          type: 'INFO',
          message: 'Demo-Modus: Es werden nur Beispieldaten exportiert',
          code: 'DEMO_MODE'
        }
      ],
      summary: {
        totalEntries: 5,
        validEntries: 5,
        invalidEntries: 0,
        dateRange: {
          from: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
          to: new Date().toISOString().split('T')[0]
        }
      }
    };

    console.log('[DATEV Validation] Validation passed');
    res.status(200).json(validationResult);
  } catch (error) {
    console.error('[DATEV Validation] Error:', error);
    res.status(500).json({
      error: 'Failed to validate DATEV data',
      message: error.message
    });
  }
};

