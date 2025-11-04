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

