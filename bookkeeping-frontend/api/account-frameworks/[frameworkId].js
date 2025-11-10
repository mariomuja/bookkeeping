// Account framework details endpoint - returns accounts for a specific framework
module.exports = (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { frameworkId } = req.query;

  // Sample accounts for each framework
  const frameworkAccounts = {
    'skr03': [
      { number: '1000', name: 'Kasse', type: 'asset', category: 'current-asset' },
      { number: '1200', name: 'Bank', type: 'asset', category: 'current-asset' },
      { number: '1400', name: 'Forderungen', type: 'asset', category: 'current-asset' },
      { number: '2000', name: 'Verbindlichkeiten', type: 'liability', category: 'current-liability' },
      { number: '3000', name: 'Eigenkapital', type: 'equity', category: 'equity' },
      { number: '4000', name: 'Umsatzerlöse', type: 'revenue', category: 'operating-revenue' },
      { number: '5000', name: 'Betriebliche Aufwendungen', type: 'expense', category: 'operating-expense' }
    ],
    'skr04': [
      { number: '0100', name: 'Kasse', type: 'asset', category: 'current-asset' },
      { number: '0200', name: 'Bank', type: 'asset', category: 'current-asset' },
      { number: '0300', name: 'Forderungen aus Lieferungen', type: 'asset', category: 'current-asset' },
      { number: '3000', name: 'Verbindlichkeiten', type: 'liability', category: 'current-liability' },
      { number: '2000', name: 'Eigenkapital', type: 'equity', category: 'equity' },
      { number: '5000', name: 'Umsatzerlöse', type: 'revenue', category: 'operating-revenue' },
      { number: '6000', name: 'Aufwendungen', type: 'expense', category: 'operating-expense' }
    ],
    'ifrs': [
      { number: '1010', name: 'Cash and Cash Equivalents', type: 'asset', category: 'current-asset' },
      { number: '1020', name: 'Trade Receivables', type: 'asset', category: 'current-asset' },
      { number: '1500', name: 'Property, Plant & Equipment', type: 'asset', category: 'fixed-asset' },
      { number: '2010', name: 'Trade Payables', type: 'liability', category: 'current-liability' },
      { number: '3000', name: 'Share Capital', type: 'equity', category: 'equity' },
      { number: '4000', name: 'Revenue from Contracts', type: 'revenue', category: 'operating-revenue' },
      { number: '5000', name: 'Cost of Sales', type: 'expense', category: 'operating-expense' }
    ],
    'us-gaap': [
      { number: '1010', name: 'Cash', type: 'asset', category: 'current-asset' },
      { number: '1020', name: 'Accounts Receivable', type: 'asset', category: 'current-asset' },
      { number: '1500', name: 'Fixed Assets', type: 'asset', category: 'fixed-asset' },
      { number: '2010', name: 'Accounts Payable', type: 'liability', category: 'current-liability' },
      { number: '3000', name: 'Common Stock', type: 'equity', category: 'equity' },
      { number: '4000', name: 'Sales Revenue', type: 'revenue', category: 'operating-revenue' },
      { number: '5000', name: 'Operating Expenses', type: 'expense', category: 'operating-expense' }
    ],
    'uk-gaap': [
      { number: '1000', name: 'Cash at Bank', type: 'asset', category: 'current-asset' },
      { number: '1100', name: 'Trade Debtors', type: 'asset', category: 'current-asset' },
      { number: '1500', name: 'Fixed Assets', type: 'asset', category: 'fixed-asset' },
      { number: '2000', name: 'Trade Creditors', type: 'liability', category: 'current-liability' },
      { number: '3000', name: 'Share Capital', type: 'equity', category: 'equity' },
      { number: '4000', name: 'Turnover', type: 'revenue', category: 'operating-revenue' },
      { number: '5000', name: 'Operating Costs', type: 'expense', category: 'operating-expense' }
    ]
  };

  const accounts = frameworkAccounts[frameworkId] || [];
  
  res.status(200).json(accounts);
};



