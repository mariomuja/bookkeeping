// Exchange Rates endpoint for Vercel Serverless
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

  if (req.method === 'GET') {
    try {
      const { from, to, date } = req.query;

      // Demo exchange rates (approximate)
      const rates = {
        'USD_EUR': 0.92,
        'USD_GBP': 0.79,
        'USD_JPY': 149.50,
        'USD_CHF': 0.88,
        'EUR_USD': 1.09,
        'EUR_GBP': 0.86,
        'EUR_JPY': 162.50,
        'GBP_USD': 1.27,
        'GBP_EUR': 1.16,
        'JPY_USD': 0.0067
      };

      const key = `${from}_${to}`;
      const rate = rates[key] || 1.0;

      const exchangeRates = [{
        id: '1',
        fromCurrency: from,
        toCurrency: to,
        rate: rate,
        date: date || new Date().toISOString().split('T')[0],
        source: 'DEMO',
        createdAt: new Date().toISOString()
      }];

      res.status(200).json(exchangeRates);
    } catch (error) {
      console.error('[Exchange Rates GET] Error:', error);
      res.status(500).json({
        error: 'Failed to get exchange rates',
        message: error.message
      });
    }
  } else if (req.method === 'POST') {
    // Bulk update or create - just return success for demo
    res.status(200).json({ success: true, message: 'Exchange rates updated' });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};



