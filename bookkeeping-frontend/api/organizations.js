// Organizations endpoint for Vercel Serverless
module.exports = (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const organizations = [
    {
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Demo Company',
      countryCode: 'US',
      defaultCurrency: 'USD',
      defaultTimezone: 'America/New_York',
      fiscalYearStart: 1,
      fiscalYearEnd: 12,
      isActive: true
    }
  ];

  res.status(200).json(organizations);
};


