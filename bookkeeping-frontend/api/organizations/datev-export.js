// DATEV Export endpoint for Vercel Serverless
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
    console.log('[DATEV Export] Request received with params:', req.query);
    
    const { framework, consultantNumber, clientNumber, dateFrom, dateTo } = req.query;

    // Generate demo DATEV CSV export
    const csvHeader = [
      'EXTF',
      '510',
      '21',
      'Buchungsstapel',
      '7',
      new Date().toISOString().split('T')[0].replace(/-/g, ''),
      '',
      '',
      '',
      '',
      consultantNumber || '1000',
      clientNumber || '10001',
      '04',
      dateFrom?.replace(/-/g, '') || '',
      dateTo?.replace(/-/g, '') || '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      ''
    ].join(';');

    const csvDataHeader = [
      'Umsatz (ohne Soll/Haben-Kz)',
      'Soll/Haben-Kennzeichen',
      'WKZ Umsatz',
      'Kurs',
      'Basis-Umsatz',
      'WKZ Basis-Umsatz',
      'Konto',
      'Gegenkonto (ohne BU-Schlüssel)',
      'BU-Schlüssel',
      'Belegdatum',
      'Belegfeld 1',
      'Belegfeld 2',
      'Skonto',
      'Buchungstext'
    ].join(';');

    const csvData = [
      // Sample bookings
      ['25000,00', 'S', 'EUR', '', '', '', '1000', '3000', '', dateFrom?.replace(/-/g, '') || '', 'EÖ-001', '', '', 'Eröffnungsbuchung Kasse'].join(';'),
      ['15000,00', 'S', 'EUR', '', '', '', '1200', '4000', '', dateFrom?.replace(/-/g, '') || '', 'RE-001', '', '', 'Umsatzerlöse'].join(';'),
      ['50000,00', 'S', 'EUR', '', '', '', '1500', '3000', '', dateFrom?.replace(/-/g, '') || '', 'AN-001', '', '', 'Anschaffung Equipment'].join(';'),
      ['10000,00', 'H', 'EUR', '', '', '', '2000', '6000', '', dateFrom?.replace(/-/g, '') || '', 'RE-002', '', '', 'Wareneinkauf'].join(';'),
      ['8000,00', 'S', 'EUR', '', '', '', '6100', '1000', '', dateFrom?.replace(/-/g, '') || '', 'BE-001', '', '', 'Betriebsausgaben'].join(';')
    ];

    const csvContent = [csvHeader, csvDataHeader, ...csvData].join('\r\n');

    // Set headers for file download
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="DATEV_Export_${new Date().toISOString().split('T')[0]}.csv"`);
    
    console.log('[DATEV Export] CSV generated, sending file');
    res.status(200).send('\ufeff' + csvContent); // Add BOM for UTF-8
  } catch (error) {
    console.error('[DATEV Export] Error:', error);
    res.status(500).json({
      error: 'Failed to export DATEV data',
      message: error.message
    });
  }
};



