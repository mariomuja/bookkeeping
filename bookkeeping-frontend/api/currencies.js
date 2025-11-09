// Currencies endpoint for Vercel Serverless
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
    // Demo Currencies
    const currencies = [
      { code: 'USD', name: 'US Dollar', symbol: '$', decimals: 2, isActive: true },
      { code: 'EUR', name: 'Euro', symbol: '€', decimals: 2, isActive: true },
      { code: 'GBP', name: 'British Pound', symbol: '£', decimals: 2, isActive: true },
      { code: 'JPY', name: 'Japanese Yen', symbol: '¥', decimals: 0, isActive: true },
      { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', decimals: 2, isActive: true },
      { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', decimals: 2, isActive: true },
      { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', decimals: 2, isActive: true },
      { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', decimals: 2, isActive: true },
      { code: 'SEK', name: 'Swedish Krona', symbol: 'kr', decimals: 2, isActive: true },
      { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr', decimals: 2, isActive: true },
      { code: 'DKK', name: 'Danish Krone', symbol: 'kr', decimals: 2, isActive: true },
      { code: 'PLN', name: 'Polish Zloty', symbol: 'zł', decimals: 2, isActive: true },
      { code: 'CZK', name: 'Czech Koruna', symbol: 'Kč', decimals: 2, isActive: true }
    ];

    res.status(200).json(currencies);
  } catch (error) {
    console.error('[Currencies] Error:', error);
    res.status(500).json({
      error: 'Failed to get currencies',
      message: error.message
    });
  }
};

