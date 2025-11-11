// Disable 2FA endpoint for Vercel Serverless
module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        error: '2FA code is required'
      });
    }

    // In demo mode, accept any 6-digit code
    if (code.length === 6 && /^\d+$/.test(code)) {
      return res.status(200).json({
        success: true,
        message: '2FA disabled successfully'
      });
    }

    return res.status(400).json({
      success: false,
      error: 'Invalid 2FA code. Please enter a 6-digit code.'
    });
  } catch (error) {
    console.error('[Disable 2FA] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to disable 2FA',
      message: error.message
    });
  }
};



