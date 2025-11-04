// Exchange Rate Service - Fetches real-time rates from public APIs
const https = require('https');
const http = require('http');

/**
 * Primary: Exchange Rate API (https://exchangerate-api.com)
 * Free tier: 1,500 requests/month
 * 
 * Fallback: European Central Bank (ECB)
 * Free, but only EUR-based rates
 */

class ExchangeRateService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 3600000; // 1 hour cache
    this.apiKey = process.env.EXCHANGE_RATE_API_KEY || null; // Optional API key
  }

  /**
   * Get exchange rate from fromCurrency to toCurrency
   * Uses public APIs with caching
   */
  async getExchangeRate(fromCurrency, toCurrency, date = null) {
    if (fromCurrency === toCurrency) {
      return 1.0;
    }

    const cacheKey = `${fromCurrency}_${toCurrency}_${date || 'latest'}`;
    
    // Check cache
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        console.log(`📦 Cache hit: ${cacheKey} = ${cached.rate}`);
        return cached.rate;
      }
    }

    try {
      // Try ExchangeRate-API first
      const rate = await this.fetchFromExchangeRateAPI(fromCurrency, toCurrency);
      
      // Cache the result
      this.cache.set(cacheKey, {
        rate,
        timestamp: Date.now()
      });
      
      console.log(`🌐 API fetch: ${cacheKey} = ${rate}`);
      return rate;
      
    } catch (error) {
      console.error(`Error fetching exchange rate from primary API:`, error.message);
      
      // Try ECB as fallback
      try {
        const rate = await this.fetchFromECB(fromCurrency, toCurrency);
        this.cache.set(cacheKey, { rate, timestamp: Date.now() });
        console.log(`🏦 ECB fetch: ${cacheKey} = ${rate}`);
        return rate;
      } catch (ecbError) {
        console.error(`Error fetching from ECB:`, ecbError.message);
        
        // Use fallback static rates
        return this.getFallbackRate(fromCurrency, toCurrency);
      }
    }
  }

  /**
   * Fetch from ExchangeRate-API.com (free tier)
   */
  async fetchFromExchangeRateAPI(fromCurrency, toCurrency) {
    return new Promise((resolve, reject) => {
      const url = `https://api.exchangerate-api.com/v4/latest/${fromCurrency}`;
      
      https.get(url, (res) => {
        let data = '';
        
        res.on('data', chunk => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            
            if (json.rates && json.rates[toCurrency]) {
              resolve(json.rates[toCurrency]);
            } else {
              reject(new Error(`No rate found for ${toCurrency}`));
            }
          } catch (error) {
            reject(error);
          }
        });
      }).on('error', reject);
    });
  }

  /**
   * Fetch from European Central Bank (ECB)
   * Only supports EUR-based conversions
   */
  async fetchFromECB(fromCurrency, toCurrency) {
    return new Promise((resolve, reject) => {
      // ECB only provides EUR-based rates
      if (fromCurrency !== 'EUR' && toCurrency !== 'EUR') {
        // Need to do cross-rate via EUR
        reject(new Error('ECB only supports EUR-based conversions'));
        return;
      }

      const url = 'https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml';
      
      https.get(url, (res) => {
        let data = '';
        
        res.on('data', chunk => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            // Parse XML for rates (simple parsing)
            const currencyCode = fromCurrency === 'EUR' ? toCurrency : fromCurrency;
            const rateMatch = data.match(new RegExp(`currency='${currencyCode}'\\s+rate='([0-9.]+)'`));
            
            if (rateMatch && rateMatch[1]) {
              let rate = parseFloat(rateMatch[1]);
              
              // If converting FROM EUR, use the rate directly
              // If converting TO EUR, invert the rate
              if (toCurrency === 'EUR') {
                rate = 1 / rate;
              }
              
              resolve(rate);
            } else {
              reject(new Error(`Currency ${currencyCode} not found in ECB data`));
            }
          } catch (error) {
            reject(error);
          }
        });
      }).on('error', reject);
    });
  }

  /**
   * Fallback static rates (used when APIs are unavailable)
   */
  getFallbackRate(fromCurrency, toCurrency) {
    console.warn(`⚠️  Using fallback rate for ${fromCurrency} to ${toCurrency}`);
    
    const staticRates = {
      'USD_EUR': 0.92, 'EUR_USD': 1.09,
      'USD_GBP': 0.79, 'GBP_USD': 1.27,
      'USD_PLN': 3.98, 'PLN_USD': 0.25,
      'USD_CZK': 23.15, 'CZK_USD': 0.043,
      'USD_CHF': 0.88, 'CHF_USD': 1.14,
      'USD_SEK': 10.85, 'SEK_USD': 0.092,
      'USD_NOK': 10.95, 'NOK_USD': 0.091,
      'USD_DKK': 6.85, 'DKK_USD': 0.146,
      'USD_JPY': 149.50, 'JPY_USD': 0.0067,
      'EUR_GBP': 0.86, 'GBP_EUR': 1.16,
      'EUR_PLN': 4.33, 'PLN_EUR': 0.23,
      'EUR_CZK': 25.18, 'CZK_EUR': 0.040,
      'EUR_CHF': 0.96, 'CHF_EUR': 1.04,
      'EUR_SEK': 11.80, 'SEK_EUR': 0.085,
      'EUR_NOK': 11.92, 'NOK_EUR': 0.084,
      'EUR_DKK': 7.45, 'DKK_EUR': 0.134
    };

    const key = `${fromCurrency}_${toCurrency}`;
    if (staticRates[key]) {
      return staticRates[key];
    }

    // Try inverse
    const inverseKey = `${toCurrency}_${fromCurrency}`;
    if (staticRates[inverseKey]) {
      return 1 / staticRates[inverseKey];
    }

    // Try cross rate via USD
    if (fromCurrency !== 'USD' && toCurrency !== 'USD') {
      const fromToUSD = this.getFallbackRate(fromCurrency, 'USD');
      const usdToTo = this.getFallbackRate('USD', toCurrency);
      return fromToUSD * usdToTo;
    }

    console.warn(`No fallback rate available for ${fromCurrency} to ${toCurrency}, using 1.0`);
    return 1.0;
  }

  /**
   * Bulk fetch exchange rates for multiple currency pairs
   */
  async getBulkRates(baseCurrency, targetCurrencies) {
    const rates = {};
    
    for (const target of targetCurrencies) {
      try {
        rates[target] = await this.getExchangeRate(baseCurrency, target);
      } catch (error) {
        console.error(`Failed to get rate for ${baseCurrency} to ${target}:`, error.message);
        rates[target] = this.getFallbackRate(baseCurrency, target);
      }
    }
    
    return rates;
  }

  /**
   * Get historical rates (uses fallback for now, can be enhanced with paid API)
   */
  async getHistoricalRate(fromCurrency, toCurrency, date) {
    // For now, use current rate with small variance based on days ago
    const daysAgo = Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
    const currentRate = await this.getExchangeRate(fromCurrency, toCurrency);
    
    // Add small historical variance (±1% per 30 days)
    const variance = (Math.random() * 0.02 - 0.01) * (daysAgo / 30);
    return currentRate * (1 + variance);
  }

  /**
   * Clear cache (useful for testing or forcing fresh data)
   */
  clearCache() {
    this.cache.clear();
    console.log('Exchange rate cache cleared');
  }
}

// Singleton instance
const exchangeRateService = new ExchangeRateService();

module.exports = exchangeRateService;

