const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const config = require('./config');
const mockData = require('./mock-data');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ============================================================================
// ORGANIZATIONS
// ============================================================================

app.get('/api/organizations', (req, res) => {
  res.json(mockData.organizations);
});

app.get('/api/organizations/:id', (req, res) => {
  const org = mockData.organizations.find(o => o.id === req.params.id);
  if (!org) return res.status(404).json({ error: 'Organization not found' });
  res.json(org);
});

app.post('/api/organizations', (req, res) => {
  const newOrg = {
    id: require('uuid').v4(),
    ...req.body,
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true
  };
  mockData.organizations.push(newOrg);
  res.status(201).json(newOrg);
});

// ============================================================================
// CURRENCIES & EXCHANGE RATES
// ============================================================================

app.get('/api/currencies', (req, res) => {
  const currencyConverter = require('./currency-converter');
  res.json(currencyConverter.getAvailableCurrencies());
});

app.get('/api/exchange-rates', async (req, res) => {
  const { from, to, date } = req.query;
  
  if (!from || !to) {
    return res.status(400).json({ error: 'from and to currencies required' });
  }

  try {
    const exchangeRateService = require('./exchange-rate-service');
    const rate = await exchangeRateService.getExchangeRate(from, to, date || null);
    
    res.json([{
      id: `${from}_${to}_${Date.now()}`,
      fromCurrency: from,
      toCurrency: to,
      rate: rate,
      effectiveDate: date || new Date(),
      source: 'Public API',
      createdAt: new Date()
    }]);
  } catch (error) {
    console.error('Exchange rate fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch exchange rate' });
  }
});

app.get('/api/exchange-rates/historical', async (req, res) => {
  const { from, to, startDate, endDate } = req.query;
  
  try {
    const currencyConverter = require('./currency-converter');
    const rates = currencyConverter.getExchangeRatesHistory(from, to, 30);
    res.json(rates);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch historical rates' });
  }
});

app.post('/api/exchange-rates/bulk', async (req, res) => {
  const { baseCurrency, targetCurrencies } = req.body;
  
  try {
    const exchangeRateService = require('./exchange-rate-service');
    const rates = await exchangeRateService.getBulkRates(baseCurrency, targetCurrencies);
    
    const result = Object.entries(rates).map(([currency, rate]) => ({
      id: `${baseCurrency}_${currency}_${Date.now()}`,
      fromCurrency: baseCurrency,
      toCurrency: currency,
      rate: rate,
      effectiveDate: new Date(),
      source: 'Public API',
      createdAt: new Date()
    }));
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bulk rates' });
  }
});

// ============================================================================
// ACCOUNT TYPES
// ============================================================================

app.get('/api/account-types', (req, res) => {
  res.json(mockData.accountTypes);
});

// ============================================================================
// ACCOUNTS
// ============================================================================

app.get('/api/organizations/:orgId/accounts', (req, res) => {
  const accounts = mockData.accounts
    .filter(a => a.organizationId === req.params.orgId)
    .map(account => ({
      ...account,
      accountType: mockData.accountTypes.find(t => t.id === account.accountTypeId)
    }));
  res.json(accounts);
});

app.get('/api/accounts/:id', (req, res) => {
  const account = mockData.accounts.find(a => a.id === req.params.id);
  if (!account) return res.status(404).json({ error: 'Account not found' });
  res.json(account);
});

app.post('/api/organizations/:orgId/accounts', (req, res) => {
  const newAccount = {
    id: require('uuid').v4(),
    organizationId: req.params.orgId,
    ...req.body,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  mockData.accounts.push(newAccount);
  res.status(201).json(newAccount);
});

app.put('/api/accounts/:id', (req, res) => {
  const index = mockData.accounts.findIndex(a => a.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Account not found' });
  
  mockData.accounts[index] = {
    ...mockData.accounts[index],
    ...req.body,
    updatedAt: new Date()
  };
  res.json(mockData.accounts[index]);
});

app.delete('/api/accounts/:id', (req, res) => {
  const index = mockData.accounts.findIndex(a => a.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Account not found' });
  
  mockData.accounts.splice(index, 1);
  res.status(204).send();
});

// ============================================================================
// JOURNAL ENTRIES
// ============================================================================

app.get('/api/organizations/:orgId/journal-entries', (req, res) => {
  let entries = mockData.journalEntries.filter(e => e.organizationId === req.params.orgId);
  
  // Apply filters
  if (req.query.status) {
    entries = entries.filter(e => e.status === req.query.status);
  }
  if (req.query.startDate) {
    entries = entries.filter(e => new Date(e.entryDate) >= new Date(req.query.startDate));
  }
  if (req.query.endDate) {
    entries = entries.filter(e => new Date(e.entryDate) <= new Date(req.query.endDate));
  }
  
  // Add lines and custom fields to each entry
  entries = entries.map(entry => ({
    ...entry,
    lines: mockData.journalEntryLines.filter(l => l.journalEntryId === entry.id),
    customFields: mockData.customFieldValues
      .filter(cf => cf.journalEntryId === entry.id)
      .map(cf => ({
        ...cf,
        definition: mockData.customFieldDefinitions.find(d => d.id === cf.fieldDefinitionId)
      }))
  }));
  
  res.json(entries);
});

app.get('/api/journal-entries/:id', (req, res) => {
  const entry = mockData.journalEntries.find(e => e.id === req.params.id);
  if (!entry) return res.status(404).json({ error: 'Journal entry not found' });
  
  const entryWithDetails = {
    ...entry,
    lines: mockData.journalEntryLines.filter(l => l.journalEntryId === entry.id),
    customFields: mockData.customFieldValues.filter(cf => cf.journalEntryId === entry.id)
  };
  
  res.json(entryWithDetails);
});

app.post('/api/organizations/:orgId/journal-entries', (req, res) => {
  const uuid = require('uuid').v4;
  const entryId = uuid();
  
  const newEntry = {
    id: entryId,
    organizationId: req.params.orgId,
    entryNumber: `JE-${Date.now()}`,
    entryTimestamp: new Date(),
    source: 'MANUAL',
    baseCurrency: 'USD',
    exchangeRate: 1.0,
    status: 'DRAFT',
    createdBy: 'Admin',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...req.body
  };
  
  mockData.journalEntries.push(newEntry);
  
  // Add lines
  if (req.body.lines) {
    req.body.lines.forEach((line, index) => {
      const lineData = {
        id: uuid(),
        journalEntryId: entryId,
        lineNumber: index + 1,
        debitBaseAmount: line.debitAmount,
        creditBaseAmount: line.creditAmount,
        taxAmount: 0,
        ...line
      };
      mockData.journalEntryLines.push(lineData);
    });
  }
  
  res.status(201).json(newEntry);
});

app.post('/api/journal-entries/:id/post', (req, res) => {
  const entry = mockData.journalEntries.find(e => e.id === req.params.id);
  if (!entry) return res.status(404).json({ error: 'Journal entry not found' });
  
  entry.status = 'POSTED';
  entry.postedAt = new Date();
  entry.postedBy = req.body.postedBy || 'Admin';
  entry.updatedAt = new Date();
  
  res.json(entry);
});

app.post('/api/journal-entries/:id/void', (req, res) => {
  const entry = mockData.journalEntries.find(e => e.id === req.params.id);
  if (!entry) return res.status(404).json({ error: 'Journal entry not found' });
  
  entry.status = 'VOID';
  entry.voidedAt = new Date();
  entry.voidedBy = req.body.voidedBy || 'Admin';
  entry.voidReason = req.body.voidReason;
  entry.updatedAt = new Date();
  
  res.json(entry);
});

// ============================================================================
// CUSTOM FIELDS
// ============================================================================

app.get('/api/organizations/:orgId/custom-fields', (req, res) => {
  const fields = mockData.customFieldDefinitions
    .filter(f => f.organizationId === req.params.orgId)
    .sort((a, b) => a.displayOrder - b.displayOrder);
  res.json(fields);
});

app.get('/api/custom-fields/:id', (req, res) => {
  const field = mockData.customFieldDefinitions.find(f => f.id === req.params.id);
  if (!field) return res.status(404).json({ error: 'Custom field not found' });
  res.json(field);
});

app.post('/api/organizations/:orgId/custom-fields', (req, res) => {
  const newField = {
    id: require('uuid').v4(),
    organizationId: req.params.orgId,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'Admin',
    ...req.body
  };
  mockData.customFieldDefinitions.push(newField);
  res.status(201).json(newField);
});

app.put('/api/custom-fields/:id', (req, res) => {
  const index = mockData.customFieldDefinitions.findIndex(f => f.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Custom field not found' });
  
  mockData.customFieldDefinitions[index] = {
    ...mockData.customFieldDefinitions[index],
    ...req.body,
    updatedAt: new Date()
  };
  res.json(mockData.customFieldDefinitions[index]);
});

app.delete('/api/custom-fields/:id', (req, res) => {
  const index = mockData.customFieldDefinitions.findIndex(f => f.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Custom field not found' });
  
  // Delete field values
  mockData.customFieldValues = mockData.customFieldValues.filter(
    v => v.fieldDefinitionId !== req.params.id
  );
  
  // Delete definition
  mockData.customFieldDefinitions.splice(index, 1);
  res.status(204).send();
});

app.post('/api/organizations/:orgId/custom-fields/reorder', (req, res) => {
  const { fieldIds } = req.body;
  
  fieldIds.forEach((id, index) => {
    const field = mockData.customFieldDefinitions.find(f => f.id === id);
    if (field) {
      field.displayOrder = index;
    }
  });
  
  res.status(200).json({ message: 'Fields reordered successfully' });
});

app.post('/api/organizations/:orgId/custom-fields/insurance-defaults', (req, res) => {
  const orgId = req.params.orgId;
  const mockInsurance = require('./mock-insurance-fields');
  
  mockInsurance.createInsuranceFields(orgId).forEach(field => {
    mockData.customFieldDefinitions.push(field);
  });
  
  res.status(201).json({ message: 'Insurance fields created successfully', count: 10 });
});

// ============================================================================
// REPORTS
// ============================================================================

app.get('/api/organizations/:orgId/dashboard', async (req, res) => {
  const { targetCurrency } = req.query;
  const orgId = req.params.orgId;
  
  try {
    const metrics = await mockData.getDashboardMetrics(orgId, targetCurrency || 'USD');
    res.json(metrics);
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to calculate dashboard metrics' });
  }
});

app.get('/api/organizations/:orgId/reports/trial-balance', async (req, res) => {
  const { targetCurrency } = req.query;
  try {
    const trialBalance = await mockData.getTrialBalance(req.params.orgId, targetCurrency || 'USD');
    res.json(trialBalance);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate trial balance' });
  }
});

app.get('/api/organizations/:orgId/reports/balance-sheet', async (req, res) => {
  const { targetCurrency } = req.query;
  try {
    const balanceSheet = await mockData.getBalanceSheet(req.params.orgId, targetCurrency || 'USD');
    res.json(balanceSheet);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate balance sheet' });
  }
});

app.get('/api/organizations/:orgId/reports/profit-loss', async (req, res) => {
  const { targetCurrency } = req.query;
  try {
    const profitLoss = await mockData.getProfitLoss(req.params.orgId, targetCurrency || 'USD');
    res.json(profitLoss);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate profit/loss' });
  }
});

app.get('/api/organizations/:orgId/reports/policy-summary', (req, res) => {
  const policySummary = mockData.getPolicySummary(req.params.orgId);
  res.json(policySummary);
});

app.get('/api/organizations/:orgId/reports/claim-summary', (req, res) => {
  const claimSummary = mockData.getClaimSummary(req.params.orgId);
  res.json(claimSummary);
});

// ============================================================================
// ACTUARIAL - LOSS TRIANGLES
// ============================================================================

app.get('/api/organizations/:orgId/actuarial/loss-triangle', (req, res) => {
  const { triangleType, policyType, developmentPeriods } = req.query;
  
  const triangleCalculator = require('./loss-triangle-calculator');
  const entries = mockData.journalEntries.filter(e => e.organizationId === req.params.orgId);
  
  // Add custom fields to entries
  const entriesWithFields = entries.map(entry => ({
    ...entry,
    customFields: mockData.customFieldValues.filter(cf => cf.journalEntryId === entry.id),
    lines: mockData.journalEntryLines.filter(l => l.journalEntryId === entry.id)
  }));
  
  const options = {
    triangleType: triangleType || 'PAID',
    policyType: policyType || null,
    developmentPeriods: parseInt(developmentPeriods) || 12
  };
  
  const triangle = triangleCalculator.calculateLossTriangle(
    entriesWithFields,
    mockData.customFieldDefinitions,
    options
  );
  
  res.json(triangle);
});

app.get('/api/organizations/:orgId/actuarial/reserves', (req, res) => {
  const { policyType } = req.query;
  
  const triangleCalculator = require('./loss-triangle-calculator');
  const entries = mockData.journalEntries.filter(e => e.organizationId === req.params.orgId);
  
  const entriesWithFields = entries.map(entry => ({
    ...entry,
    customFields: mockData.customFieldValues.filter(cf => cf.journalEntryId === entry.id),
    lines: mockData.journalEntryLines.filter(l => l.journalEntryId === entry.id)
  }));
  
  const options = {
    triangleType: 'PAID',
    policyType: policyType || null,
    developmentPeriods: 12
  };
  
  const triangle = triangleCalculator.calculateLossTriangle(
    entriesWithFields,
    mockData.customFieldDefinitions,
    options
  );
  
  const reserves = triangleCalculator.calculateReserveEstimates(triangle);
  res.json(reserves);
});

// ============================================================================
// SAMPLE DATA GENERATION
// ============================================================================

app.post('/api/organizations/:orgId/sample-data/insurance', (req, res) => {
  const { count } = req.body;
  const orgId = req.params.orgId;
  
  console.log(`Generating ${count} sample insurance bookings...`);
  
  const generator = require('./sample-data-generator');
  const result = generator.generateInsuranceData(orgId, count || 10000);
  
  // Add to mock data
  mockData.journalEntries.push(...result.entries);
  mockData.journalEntryLines.push(...result.lines);
  mockData.customFieldValues.push(...result.customFields);
  
  res.json({
    message: `Successfully generated ${result.entries.length} insurance bookings`,
    generated: result.entries.length
  });
});

// ============================================================================
// HEALTH CHECK
// ============================================================================

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date(),
    version: '1.0.0',
    useMockData: config.useMockData
  });
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: err.message });
});

// ============================================================================
// START SERVER
// ============================================================================

app.listen(config.port, () => {
  console.log('\n=================================================');
  console.log('  📊 BookKeeper Pro Backend API');
  console.log('=================================================');
  console.log(`  🚀 Server running on http://localhost:${config.port}`);
  console.log(`  📝 Mode: ${config.useMockData ? 'MOCK DATA' : 'DATABASE'}`);
  console.log(`  🌍 Environment: ${config.nodeEnv}`);
  console.log('=================================================\n');
  console.log('Available endpoints:');
  console.log('  GET  /api/health');
  console.log('  GET  /api/organizations');
  console.log('  GET  /api/organizations/:orgId/accounts');
  console.log('  GET  /api/organizations/:orgId/journal-entries');
  console.log('  GET  /api/organizations/:orgId/custom-fields');
  console.log('  POST /api/organizations/:orgId/sample-data/insurance');
  console.log('  GET  /api/organizations/:orgId/dashboard');
  console.log('  GET  /api/organizations/:orgId/reports/*');
  console.log('\n  📚 See README.md for full API documentation\n');
});

module.exports = app;

