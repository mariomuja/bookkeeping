# Multi-Currency & Timezone Support Guide

## Overview

International Bookkeeping provides comprehensive support for international operations with real-time currency conversion and timezone-aware datetime fields. Perfect for insurance companies operating across multiple countries.

## 🌍 Multi-Currency Features

### Supported Currencies

The system supports all major European and international currencies:

| Currency | Code | Symbol | Countries |
|----------|------|--------|-----------|
| Euro | EUR | € | Germany, France, Italy, Spain, Austria, Netherlands, etc. |
| US Dollar | USD | $ | United States |
| British Pound | GBP | £ | United Kingdom |
| Polish Zloty | PLN | zł | Poland |
| Czech Koruna | CZK | Kč | Czech Republic |
| Swiss Franc | CHF | CHF | Switzerland |
| Swedish Krona | SEK | kr | Sweden |
| Norwegian Krone | NOK | kr | Norway |
| Danish Krone | DKK | kr | Denmark |
| Japanese Yen | JPY | ¥ | Japan |

### Real-Time Exchange Rates

The system fetches current exchange rates from public APIs:

**Primary Source**: [ExchangeRate-API.com](https://exchangerate-api.com)
- Free tier: 1,500 requests/month
- Real-time rates
- 160+ currencies
- No API key required for basic usage

**Fallback Source**: [European Central Bank (ECB)](https://www.ecb.europa.eu)
- Official EU exchange rates
- EUR-based conversions
- Daily updates
- Always available

**Cache Strategy**:
- Rates cached for 1 hour
- Automatic fallback to static rates if APIs unavailable
- Cross-currency conversions via triangulation

## 🔄 Currency Conversion in Reports

### Dashboard Currency Selector

1. **Navigate to Dashboard**
2. **Select Report Currency** from dropdown (top-right)
3. **View Metrics** automatically converted to selected currency

**Example Scenario**:
- Claim in Poland: 10,000 PLN
- Premium in Germany: 5,000 EUR  
- Claim in Switzerland: 8,000 CHF
- **Dashboard in EUR**: Automatically converts all amounts to EUR using current rates

### How It Works

1. **Transaction Level**: Each journal entry stored in its original currency
   ```json
   {
     "amount": 10000,
     "currency": "PLN",
     "baseCurrency": "USD",
     "exchangeRate": 0.25
   }
   ```

2. **Report Generation**: API fetches real-time rates
   ```javascript
   GET /api/organizations/:orgId/dashboard?targetCurrency=EUR
   ```

3. **Automatic Conversion**: Backend converts all amounts
   - 10,000 PLN × 0.23 = 2,300 EUR
   - 5,000 EUR × 1.00 = 5,000 EUR
   - 8,000 CHF × 0.96 = 7,680 EUR
   - **Total: 14,980 EUR**

### Reports with Currency Conversion

All reports support currency conversion:

```
GET /api/organizations/:orgId/reports/trial-balance?targetCurrency=EUR
GET /api/organizations/:orgId/reports/balance-sheet?targetCurrency=EUR
GET /api/organizations/:orgId/reports/profit-loss?targetCurrency=EUR
GET /api/organizations/:orgId/actuarial/loss-triangle?targetCurrency=EUR
```

## 🕐 Timezone & DateTime Support

### Timezone Management

Organizations can set their default timezone in the database:

```sql
UPDATE organizations 
SET default_timezone = 'Europe/Berlin' 
WHERE id = 'YOUR_ORG_ID';
```

**Supported Timezones**:
- Europe/London (GMT/BST)
- Europe/Berlin (CET/CEST)
- Europe/Paris (CET/CEST)
- Europe/Warsaw (CET/CEST)
- Europe/Zurich (CET/CEST)
- America/New_York (EST/EDT)
- America/Chicago (CST/CDT)
- Asia/Tokyo (JST)

### DateTime Custom Fields

Three field types for temporal data:

1. **DATE**: Date only (no time component)
   - Example: `2024-01-15`
   - Use for: Policy effective dates, expiration dates

2. **DATETIME**: Date and time (organization's timezone)
   - Example: `2024-01-15 14:30:00 CET`
   - Use for: Policy issuance, claim occurrence

3. **TIMESTAMP**: Precise timestamp with timezone
   - Example: `2024-01-15T14:30:00+01:00`
   - Use for: Payment processing, system events

### Insurance DateTime Fields

Pre-configured datetime fields for insurance operations:

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| Policy Issue DateTime | DATETIME | When policy was created | 2024-01-15 09:00:00 CET |
| Policy Effective DateTime | DATETIME | When coverage starts | 2024-01-16 00:00:00 CET |
| Policy Expiration DateTime | DATETIME | When coverage ends | 2025-01-16 23:59:59 CET |
| Claim Occurred DateTime | DATETIME | When accident happened | 2024-03-20 14:30:00 CET |
| Claim Reported DateTime | DATETIME | When claim was reported | 2024-03-21 10:15:00 CET |
| Payment Processed DateTime | TIMESTAMP | When payment was made | 2024-04-05T15:45:23+01:00 |

### Reporting Delay Analysis

The system calculates reporting delays automatically:

```sql
SELECT 
    claim_number,
    claim_occurred_local,
    claim_reported_local,
    hours_to_report,
    hours_to_report / 24 AS days_to_report
FROM v_claims_with_timezone
WHERE hours_to_report > 24
ORDER BY hours_to_report DESC;
```

**Use Cases**:
- Identify late-reported claims
- Analyze reporting patterns by time of day
- Calculate reserve adjustments for delay

## 💼 Real-World Example: Polish Claim

### Scenario
An insurance company headquartered in Germany (EUR, CET timezone) receives a claim from Poland:

**Claim Details**:
- **Location**: Warsaw, Poland
- **Accident Date/Time**: March 20, 2024 at 14:30 CET (same as Warsaw)
- **Reported Date/Time**: March 21, 2024 at 10:15 CET
- **Claim Amount**: 45,000 PLN
- **Payment Date**: April 5, 2024

### Data Entry
```json
{
  "entryDate": "2024-04-05",
  "description": "Insurance Claim Payment - Auto (Poland)",
  "currency": "PLN",
  "lines": [
    {
      "accountId": "claims-expense-account",
      "debitAmount": 45000,
      "creditAmount": 0
    },
    {
      "accountId": "claims-payable-account",
      "debitAmount": 0,
      "creditAmount": 45000
    }
  ],
  "customFields": [
    { "fieldName": "claim_number", "value": "CLM-00123456" },
    { "fieldName": "policy_type", "value": "Auto" },
    { "fieldName": "claim_occurred_datetime", "value": "2024-03-20T14:30:00+01:00" },
    { "fieldName": "claim_reported_datetime", "value": "2024-03-21T10:15:00+01:00" },
    { "fieldName": "claim_amount", "value": "45000" },
    { "fieldName": "insured_party", "value": "Jan Kowalski" }
  ]
}
```

### Viewing in EUR

When German management views the dashboard in EUR:

1. **System fetches rate**: PLN to EUR = 0.23 (from ECB or ExchangeRate-API)
2. **Converts amount**: 45,000 PLN × 0.23 = **10,350 EUR**
3. **Shows in reports**: All reports display 10,350 EUR
4. **Preserves original**: Transaction still shows 45,000 PLN in details

### Timezone Display

- **Poland (CET)**: March 20, 2024 14:30 CET
- **UK Office (GMT)**: March 20, 2024 13:30 GMT (automatically converted)
- **US Office (EST)**: March 20, 2024 08:30 EST (automatically converted)

### Reporting Delay

System automatically calculates:
- **Occurred**: March 20, 14:30
- **Reported**: March 21, 10:15
- **Delay**: 19 hours 45 minutes

## 🎯 Use Cases

### 1. Multinational Insurance Company
- **Headquarters**: Frankfurt, Germany (EUR, CET)
- **Operations**: Poland, Czech Republic, Switzerland, UK
- **Report in**: EUR for consolidated financials
- **Transaction in**: Local currencies (PLN, CZK, CHF, GBP)

### 2. Claim Frequency Analysis by Time
```sql
-- Claims by hour of day (useful for fraud detection)
SELECT 
    EXTRACT(HOUR FROM claim_occurred_local) AS hour,
    COUNT(*) as claim_count,
    AVG(claim_amount) as avg_amount
FROM v_claims_with_timezone
GROUP BY hour
ORDER BY hour;
```

### 3. Cross-Border Operations
- Policyholder in Poland pays premium in PLN
- Claim occurs in Germany, paid in EUR
- Reinsurance in Switzerland uses CHF
- **All consolidated in EUR** for management reporting

## 📊 API Endpoints

### Exchange Rates
```
GET  /api/currencies
     - List all supported currencies

GET  /api/exchange-rates?from=PLN&to=EUR
     - Get current exchange rate
     - Returns real-time rate from public API

GET  /api/exchange-rates?from=PLN&to=EUR&date=2024-01-15
     - Get historical rate for specific date

POST /api/exchange-rates/bulk
     Body: { "baseCurrency": "EUR", "targetCurrencies": ["PLN", "CZK", "CHF"] }
     - Fetch multiple rates at once

GET  /api/exchange-rates/historical?from=EUR&to=PLN&startDate=2024-01-01&endDate=2024-12-31
     - Get rate history over date range
```

### Reports with Currency
```
GET /api/organizations/:orgId/dashboard?targetCurrency=EUR
GET /api/organizations/:orgId/reports/trial-balance?targetCurrency=EUR
GET /api/organizations/:orgId/reports/balance-sheet?targetCurrency=EUR
GET /api/organizations/:orgId/reports/profit-loss?targetCurrency=EUR
```

## 🔧 Configuration

### Environment Variables (Backend)

```bash
# .env file
EXCHANGE_RATE_API_KEY=your_api_key_optional
USE_PUBLIC_EXCHANGE_RATES=true
DEFAULT_REPORTING_CURRENCY=EUR
```

### Organization Settings

```javascript
{
  "defaultCurrency": "EUR",        // Base currency for the organization
  "defaultTimezone": "Europe/Berlin", // Default timezone
  "reportingCurrency": "EUR"       // Preferred currency for reports
}
```

## 📈 Performance Considerations

### Exchange Rate Caching
- **Cache Duration**: 1 hour
- **Cache Key**: `{fromCurrency}_{toCurrency}_{date}`
- **Benefits**: Reduces API calls, faster report generation

### Bulk Conversion
For reports with many transactions:
1. Identify unique currency pairs
2. Fetch all rates in single bulk request
3. Apply rates to all transactions
4. Result: 1 API call instead of N calls

### API Limits
- **ExchangeRate-API Free**: 1,500 requests/month
- **ECB**: Unlimited, updated daily
- **Fallback**: Static rates if APIs unavailable

## 🛡️ Data Integrity

### Exchange Rate Audit Trail

The database stores historical exchange rates:

```sql
CREATE TABLE exchange_rates (
    id UUID PRIMARY KEY,
    from_currency VARCHAR(3),
    to_currency VARCHAR(3),
    rate NUMERIC(20, 10),
    effective_date DATE,
    source VARCHAR(100), -- 'ECB', 'ExchangeRate-API', 'Manual'
    created_at TIMESTAMPTZ
);
```

### Best Practices

1. **Always Store Original Currency**
   - Never lose original transaction amount
   - Store exchange rate used at time of transaction
   - Enable future revaluation

2. **Use Appropriate Field Type**
   - **DATE**: Simple dates (birthdate, policy start)
   - **DATETIME**: Events with time (claim occurred, policy issued)
   - **TIMESTAMP**: Precise system events (payment processed)

3. **Timezone Awareness**
   - Set organization timezone correctly
   - Use TIMESTAMPTZ in PostgreSQL
   - Display times in user's local timezone

4. **Currency Conversion**
   - Fetch rates at report generation time
   - Use historical rates for past periods
   - Document conversion rates used

## 🔍 Example Queries

### Consolidated Report in EUR
```sql
-- Get all claims with amounts converted to EUR
SELECT 
    je.entry_number,
    je.currency AS original_currency,
    SUM(jel.credit_amount) AS original_amount,
    SUM(jel.credit_amount * er.rate) AS amount_in_eur
FROM journal_entries je
JOIN journal_entry_lines jel ON je.id = jel.journal_entry_id
JOIN exchange_rates er ON 
    er.from_currency = je.currency AND 
    er.to_currency = 'EUR' AND
    er.effective_date = je.entry_date
WHERE je.organization_id = 'YOUR_ORG_ID'
AND je.document_type = 'CLAIM'
GROUP BY je.id, je.entry_number, je.currency;
```

### Claims by Country (Currency Proxy)
```sql
SELECT 
    je.currency,
    COUNT(*) as claim_count,
    SUM(jel.credit_amount) as total_local,
    SUM(jel.credit_amount * er.rate) as total_eur
FROM journal_entries je
JOIN journal_entry_lines jel ON je.id = jel.journal_entry_id
LEFT JOIN exchange_rates er ON 
    er.from_currency = je.currency AND 
    er.to_currency = 'EUR'
WHERE je.document_type = 'CLAIM'
GROUP BY je.currency
ORDER BY total_eur DESC;
```

## 📱 Frontend Implementation

### Currency Selector Component

The dashboard and reports include a currency selector:

```html
<select [(ngModel)]="selectedCurrency" (ngModelChange)="onCurrencyChange()">
  <option value="EUR">€ Euro (EUR)</option>
  <option value="USD">$ US Dollar (USD)</option>
  <option value="PLN">zł Polish Zloty (PLN)</option>
  <!-- ... more currencies -->
</select>
```

### Automatic Conversion

When currency is changed:
1. Component calls API with `targetCurrency` parameter
2. Backend fetches real-time exchange rates
3. All amounts converted and displayed
4. Preference saved in localStorage

## 🌐 Sample Data Distribution

Generated sample data includes realistic currency distribution:

- **25% EUR** (Germany, France, Italy, Spain)
- **20% USD** (United States)
- **15% GBP** (United Kingdom)  
- **15% PLN** (Poland)
- **10% CZK** (Czech Republic)
- **8% CHF** (Switzerland)
- **7% SEK** (Sweden)

## 🚀 Quick Start

### 1. Generate Multi-Currency Sample Data
```bash
# Backend will automatically use multiple currencies
POST /api/organizations/:orgId/sample-data/insurance
Body: { "count": 50000 }
```

### 2. View Dashboard in EUR
```bash
GET /api/organizations/:orgId/dashboard?targetCurrency=EUR
```

### 3. Create Insurance Fields with DateTime
```bash
POST /api/organizations/:orgId/custom-fields/insurance-defaults
```

This creates 15 fields including:
- 10 original fields (policy/claim data)
- 5 new datetime fields (timestamps for events)

## 🔐 Security & Compliance

### GDPR Considerations
- Timezone data helps with data retention policies
- Accurate timestamps for audit trails
- Cross-border data transfer tracking

### Financial Regulations
- MiFID II: Accurate timestamps required
- Basel III: Multi-currency risk reporting
- Solvency II: Currency risk calculations

### Audit Trail
Every transaction includes:
- Original currency and amount
- Exchange rate used
- Rate source (API name)
- Conversion timestamp

## 🎓 Best Practices

### 1. Currency Selection
- **Reporting**: Use organization's base currency (EUR for EU companies)
- **Transactions**: Use local currency where claim/premium occurred
- **Consolidation**: Convert to reporting currency at report time

### 2. Exchange Rate Strategy
- **Live Rates**: For current reports (dashboard, current period)
- **Historical Rates**: For period-end closings, audits
- **Fixed Rates**: For budgets, forecasts

### 3. Timezone Handling
- **Store**: Always in UTC with timezone info (TIMESTAMPTZ)
- **Display**: Convert to user's timezone or organization timezone
- **Report**: Use organization timezone for consistency

### 4. Reserve Calculations
- Convert all claims to reporting currency BEFORE triangle calculation
- Use exchange rate as of accident date (not reporting date)
- Document conversion methodology

## 📞 Support

For questions about multi-currency or timezone features:
- See main `README.md` for general documentation
- Check `CUSTOM_FIELDS_GUIDE.md` for field types
- Review PostgreSQL timezone documentation

---

**Mario Muja**
- 📧 mario.muja@gmail.com
- 📱 +49 1520 464 14 73 (Germany)
- 📱 +39 345 345 0098 (Italy)
- 📍 Hamburg, Germany

