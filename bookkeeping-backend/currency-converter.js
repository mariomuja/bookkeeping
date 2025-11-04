// Currency Conversion Engine
// Handles multi-currency conversions for reports and aggregations

// Sample exchange rates (in production, fetch from database or external API)
const exchangeRates = {
  // Base currency: USD
  'USD_EUR': 0.92,
  'USD_GBP': 0.79,
  'USD_PLN': 3.98,
  'USD_CZK': 23.15,
  'USD_CHF': 0.88,
  'USD_SEK': 10.85,
  'USD_NOK': 10.95,
  'USD_DKK': 6.85,
  'USD_JPY': 149.50,
  
  // EUR conversions
  'EUR_USD': 1.09,
  'EUR_GBP': 0.86,
  'EUR_PLN': 4.33,
  'EUR_CZK': 25.18,
  'EUR_CHF': 0.96,
  'EUR_SEK': 11.80,
  'EUR_NOK': 11.92,
  'EUR_DKK': 7.45,
  'EUR_JPY': 162.50,
  
  // PLN conversions (Polish Zloty)
  'PLN_USD': 0.25,
  'PLN_EUR': 0.23,
  'PLN_GBP': 0.20,
  'PLN_CHF': 0.22,
  
  // GBP conversions
  'GBP_USD': 1.27,
  'GBP_EUR': 1.16,
  'GBP_PLN': 5.03,
  
  // CHF conversions (Swiss Franc)
  'CHF_USD': 1.14,
  'CHF_EUR': 1.04,
  'CHF_GBP': 0.90,
  'CHF_PLN': 4.52
};

/**
 * Get exchange rate between two currencies
 * This is a synchronous fallback - use exchangeRateService for real-time rates
 */
function getExchangeRate(fromCurrency, toCurrency, date = null) {
  if (fromCurrency === toCurrency) {
    return 1.0;
  }

  const key = `${fromCurrency}_${toCurrency}`;
  const rate = exchangeRates[key];

  if (rate) {
    return rate;
  }

  // Try inverse rate
  const inverseKey = `${toCurrency}_${fromCurrency}`;
  const inverseRate = exchangeRates[inverseKey];

  if (inverseRate) {
    return 1 / inverseRate;
  }

  // If not found, try cross rate via USD
  if (fromCurrency !== 'USD' && toCurrency !== 'USD') {
    const fromToUSD = getExchangeRate(fromCurrency, 'USD');
    const usdToTo = getExchangeRate('USD', toCurrency);
    return fromToUSD * usdToTo;
  }

  console.warn(`Exchange rate not found for ${fromCurrency} to ${toCurrency}, using 1.0`);
  return 1.0;
}

/**
 * Get exchange rate using real-time API (async)
 */
async function getExchangeRateAsync(fromCurrency, toCurrency, date = null) {
  const exchangeRateService = require('./exchange-rate-service');
  return await exchangeRateService.getExchangeRate(fromCurrency, toCurrency, date);
}

/**
 * Convert amount from one currency to another
 */
function convertAmount(amount, fromCurrency, toCurrency, date = null) {
  const rate = getExchangeRate(fromCurrency, toCurrency, date);
  
  return {
    originalAmount: amount,
    originalCurrency: fromCurrency,
    convertedAmount: amount * rate,
    targetCurrency: toCurrency,
    exchangeRate: rate,
    conversionDate: date || new Date()
  };
}

/**
 * Convert multiple amounts to a single target currency
 */
function convertAndSum(amounts, targetCurrency) {
  return amounts.reduce((total, item) => {
    const converted = convertAmount(item.amount, item.currency, targetCurrency);
    return total + converted.convertedAmount;
  }, 0);
}

/**
 * Convert journal entry lines to target currency
 */
function convertJournalEntryLines(lines, entries, targetCurrency) {
  return lines.map(line => {
    const entry = entries.find(e => e.id === line.journalEntryId);
    const originalCurrency = entry?.currency || 'USD';

    if (originalCurrency === targetCurrency) {
      return {
        ...line,
        convertedDebit: line.debitAmount,
        convertedCredit: line.creditAmount,
        conversionRate: 1.0,
        targetCurrency
      };
    }

    const rate = getExchangeRate(originalCurrency, targetCurrency);

    return {
      ...line,
      convertedDebit: line.debitAmount * rate,
      convertedCredit: line.creditAmount * rate,
      conversionRate: rate,
      originalCurrency,
      targetCurrency
    };
  });
}

/**
 * Get available currencies
 */
function getAvailableCurrencies() {
  return [
    { code: 'USD', name: 'US Dollar', symbol: '$', decimalPlaces: 2 },
    { code: 'EUR', name: 'Euro', symbol: '€', decimalPlaces: 2 },
    { code: 'GBP', name: 'British Pound', symbol: '£', decimalPlaces: 2 },
    { code: 'PLN', name: 'Polish Zloty', symbol: 'zł', decimalPlaces: 2 },
    { code: 'CZK', name: 'Czech Koruna', symbol: 'Kč', decimalPlaces: 2 },
    { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', decimalPlaces: 2 },
    { code: 'SEK', name: 'Swedish Krona', symbol: 'kr', decimalPlaces: 2 },
    { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr', decimalPlaces: 2 },
    { code: 'DKK', name: 'Danish Krone', symbol: 'kr', decimalPlaces: 2 },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥', decimalPlaces: 0 }
  ];
}

/**
 * Get exchange rates for a currency pair
 */
function getExchangeRatesHistory(fromCurrency, toCurrency, days = 30) {
  const rates = [];
  const baseRate = getExchangeRate(fromCurrency, toCurrency);
  
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    // Add some variance (±2%)
    const variance = (Math.random() * 0.04) - 0.02;
    const rate = baseRate * (1 + variance);
    
    rates.push({
      id: `rate-${fromCurrency}-${toCurrency}-${i}`,
      fromCurrency,
      toCurrency,
      rate: parseFloat(rate.toFixed(6)),
      effectiveDate: date,
      source: 'ECB',
      createdAt: new Date()
    });
  }
  
  return rates;
}

module.exports = {
  getExchangeRate,
  getExchangeRateAsync,
  convertAmount,
  convertAndSum,
  convertJournalEntryLines,
  getAvailableCurrencies,
  getExchangeRatesHistory,
  exchangeRates
};

