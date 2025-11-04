export interface Currency {
  code: string;
  name: string;
  symbol?: string;
  decimalPlaces: number;
  isActive: boolean;
}

export interface ExchangeRate {
  id: string;
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  effectiveDate: Date;
  source?: string;
  createdAt: Date;
}

export interface CurrencyConversion {
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  effectiveDate: Date;
  source: string;
}

export interface MultiCurrencyAmount {
  originalAmount: number;
  originalCurrency: string;
  convertedAmount: number;
  targetCurrency: string;
  exchangeRate: number;
  conversionDate: Date;
}
