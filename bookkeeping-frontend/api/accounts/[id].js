// Single Account endpoint for Vercel Serverless
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

  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      // Return demo account
      const account = {
        id: id,
        accountNumber: '1000',
        accountName: 'Cash',
        accountTypeId: 1,
        accountTypeName: 'Asset',
        currency: 'USD',
        isSystemAccount: false,
        isActive: true,
        description: 'Cash on hand and in bank',
        currentBalance: 25000.00,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: new Date().toISOString()
      };

      res.status(200).json(account);
    } catch (error) {
      console.error('[Account GET] Error:', error);
      res.status(500).json({
        error: 'Failed to get account',
        message: error.message
      });
    }
  } else if (req.method === 'PUT') {
    // Update account
    try {
      const updateData = req.body;
      const account = {
        id: id,
        ...updateData,
        updatedAt: new Date().toISOString()
      };

      res.status(200).json(account);
    } catch (error) {
      console.error('[Account PUT] Error:', error);
      res.status(500).json({
        error: 'Failed to update account',
        message: error.message
      });
    }
  } else if (req.method === 'DELETE') {
    // Delete account
    res.status(200).json({ success: true, message: 'Account deleted' });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};

