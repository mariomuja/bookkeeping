// Login endpoint for Vercel Serverless
const { v4: uuidv4 } = require('uuid');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username, password } = req.body;

    // Demo credentials validation
    const DEMO_USERNAME = 'demo';
    const DEMO_PASSWORD = 'DemoUser2025!Secure';

    if (username === DEMO_USERNAME && password === DEMO_PASSWORD) {
      // Create a simple session ID
      const sessionId = 'vercel-session-' + uuidv4();
      const token = 'jwt-token-' + uuidv4();

      res.status(200).json({
        success: true,
        token,
        sessionId,
        user: {
          id: 'demo-user',
          username: DEMO_USERNAME,
          name: 'Demo User',
          email: 'demo@bookkeeping.com',
          role: 'admin',
          organizationId: '550e8400-e29b-41d4-a716-446655440000'
        },
        organization: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          name: 'Demo Company',
          countryCode: 'US',
          defaultCurrency: 'USD',
          defaultTimezone: 'America/New_York',
          fiscalYearStart: 1,
          fiscalYearEnd: 12
        }
      });
    } else {
      res.status(401).json({
        success: false,
        error: 'Invalid username or password'
      });
    }
  } catch (error) {
    console.error('[Auth] Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed'
    });
  }
};




