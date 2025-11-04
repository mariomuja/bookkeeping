import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Currency, ExchangeRate, CurrencyConversion, MultiCurrencyAmount } from '../models/currency.model';

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {
  // Cache for exchange rates
  private ratesCache: Map<string, ExchangeRate[]> = new Map();

  constructor(private api: ApiService) {}

  getCurrencies(): Observable<Currency[]> {
    return this.api.get<Currency[]>('/currencies');
  }

  getExchangeRates(fromCurrency: string, toCurrency: string, date?: Date): Observable<ExchangeRate[]> {
    const cacheKey = `${fromCurrency}_${toCurrency}_${date?.toISOString() || 'latest'}`;
    
    if (this.ratesCache.has(cacheKey)) {
      return of(this.ratesCache.get(cacheKey)!);
    }

    const params = new URLSearchParams();
    params.append('from', fromCurrency);
    params.append('to', toCurrency);
    if (date) params.append('date', date.toISOString().split('T')[0]);

    return this.api.get<ExchangeRate[]>('/exchange-rates', params as any).pipe(
      map(rates => {
        this.ratesCache.set(cacheKey, rates);
        return rates;
      })
    );
  }

  getLatestRate(fromCurrency: string, toCurrency: string): Observable<number> {
    if (fromCurrency === toCurrency) {
      return of(1.0);
    }

    return this.getExchangeRates(fromCurrency, toCurrency).pipe(
      map(rates => {
        if (rates.length === 0) {
          console.warn(`No exchange rate found for ${fromCurrency} to ${toCurrency}, using 1.0`);
          return 1.0;
        }
        return rates[0].rate;
      })
    );
  }

  convertAmount(amount: number, fromCurrency: string, toCurrency: string, rate?: number): MultiCurrencyAmount {
    const effectiveRate = rate || 1.0;
    
    return {
      originalAmount: amount,
      originalCurrency: fromCurrency,
      convertedAmount: amount * effectiveRate,
      targetCurrency: toCurrency,
      exchangeRate: effectiveRate,
      conversionDate: new Date()
    };
  }

  convertMultipleAmounts(
    amounts: { amount: number; currency: string }[],
    targetCurrency: string,
    rates: Map<string, number>
  ): number {
    return amounts.reduce((total, item) => {
      if (item.currency === targetCurrency) {
        return total + item.amount;
      }
      
      const rate = rates.get(`${item.currency}_${targetCurrency}`) || 1.0;
      return total + (item.amount * rate);
    }, 0);
  }

  formatCurrency(amount: number, currency: string): string {
    const currencySymbols: { [key: string]: string } = {
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'JPY': '¥',
      'CHF': 'CHF',
      'PLN': 'zł',
      'CZK': 'Kč',
      'SEK': 'kr',
      'NOK': 'kr',
      'DKK': 'kr'
    };

    const symbol = currencySymbols[currency] || currency;
    const decimals = currency === 'JPY' ? 0 : 2;

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(amount);
  }

  // Bulk update exchange rates
  updateExchangeRates(rates: Partial<ExchangeRate>[]): Observable<ExchangeRate[]> {
    return this.api.post<ExchangeRate[]>('/exchange-rates/bulk', rates);
  }

  // Get historical rates for a date range
  getHistoricalRates(
    fromCurrency: string,
    toCurrency: string,
    startDate: Date,
    endDate: Date
  ): Observable<ExchangeRate[]> {
    const params = new URLSearchParams();
    params.append('from', fromCurrency);
    params.append('to', toCurrency);
    params.append('startDate', startDate.toISOString().split('T')[0]);
    params.append('endDate', endDate.toISOString().split('T')[0]);

    return this.api.get<ExchangeRate[]>('/exchange-rates/historical', params as any);
  }
}

