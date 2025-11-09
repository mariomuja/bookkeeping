// Single Organization endpoint for Vercel Serverless
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
      // Return demo organization
      const organization = {
        id: orgId || '550e8400-e29b-41d4-a716-446655440000',
        name: 'Demo Company',
        countryCode: 'US',
        defaultCurrency: 'USD',
        defaultTimezone: 'America/New_York',
        fiscalYearStart: 1,
        fiscalYearEnd: 12,
        createdAt: new Date('2024-01-01').toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true
      };

      res.status(200).json(organization);
    } catch (error) {
      console.error('[Organization GET] Error:', error);
      res.status(500).json({
        error: 'Failed to get organization',
        message: error.message
      });
    }
  } else if (req.method === 'PUT') {
    // Update organization - return updated data
    try {
      const updateData = req.body;
      const organization = {
        id: orgId,
        ...updateData,
        updatedAt: new Date().toISOString()
      };

      res.status(200).json(organization);
    } catch (error) {
      console.error('[Organization PUT] Error:', error);
      res.status(500).json({
        error: 'Failed to update organization',
        message: error.message
      });
    }
  } else if (req.method === 'DELETE') {
    // Delete organization - return success
    res.status(200).json({ success: true, message: 'Organization deleted' });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};

