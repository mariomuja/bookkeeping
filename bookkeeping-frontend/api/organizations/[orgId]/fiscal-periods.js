// Fiscal Periods endpoint for Vercel Serverless
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
      // Return demo fiscal periods
      const currentYear = new Date().getFullYear();
      const fiscalPeriods = [
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
        },
        {
          id: 'fp-2023',
          organizationId: orgId,
          name: `FY ${currentYear - 1}`,
          startDate: `${currentYear - 1}-01-01`,
          endDate: `${currentYear - 1}-12-31`,
          isClosed: true,
          closedAt: `${currentYear}-01-15T10:00:00Z`,
          closedBy: 'admin',
          createdAt: `${currentYear - 1}-01-01T00:00:00Z`
        }
      ];

      res.status(200).json(fiscalPeriods);
    } catch (error) {
      console.error('[Fiscal Periods GET] Error:', error);
      res.status(500).json({
        error: 'Failed to get fiscal periods',
        message: error.message
      });
    }
  } else if (req.method === 'POST') {
    // Create fiscal period
    try {
      const data = req.body;
      const fiscalPeriod = {
        id: `fp-${Date.now()}`,
        organizationId: orgId,
        ...data,
        isClosed: false,
        closedAt: null,
        closedBy: null,
        createdAt: new Date().toISOString()
      };

      res.status(201).json(fiscalPeriod);
    } catch (error) {
      console.error('[Fiscal Periods POST] Error:', error);
      res.status(500).json({
        error: 'Failed to create fiscal period',
        message: error.message
      });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};

