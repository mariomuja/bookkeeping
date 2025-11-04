import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CurrencyService } from './currency.service';
import { ApiService } from './api.service';

describe('CurrencyService', () => {
  let service: CurrencyService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CurrencyService, ApiService]
    });
    service = TestBed.inject(CurrencyService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should convert same currency with rate 1.0', (done) => {
    service.getLatestRate('USD', 'USD').subscribe(rate => {
      expect(rate).toBe(1.0);
      done();
    });
  });

  it('should format currency correctly for USD', () => {
    const formatted = service.formatCurrency(1234.56, 'USD');
    expect(formatted).toContain('1,234.56');
    expect(formatted).toContain('$');
  });

  it('should format currency correctly for EUR', () => {
    const formatted = service.formatCurrency(1234.56, 'EUR');
    expect(formatted).toContain('1,234.56');
    expect(formatted).toContain('€');
  });

  it('should format JPY without decimals', () => {
    const formatted = service.formatCurrency(1234, 'JPY');
    expect(formatted).not.toContain('.00');
  });

  it('should convert amount with provided rate', () => {
    const result = service.convertAmount(1000, 'PLN', 'EUR', 0.23);
    
    expect(result.originalAmount).toBe(1000);
    expect(result.originalCurrency).toBe('PLN');
    expect(result.convertedAmount).toBe(230);
    expect(result.targetCurrency).toBe('EUR');
    expect(result.exchangeRate).toBe(0.23);
  });

  it('should convert multiple amounts to target currency', () => {
    const amounts = [
      { amount: 1000, currency: 'EUR' },
      { amount: 1000, currency: 'USD' },
      { amount: 1000, currency: 'GBP' }
    ];
    
    const rates = new Map([
      ['USD_EUR', 0.92],
      ['GBP_EUR', 1.16]
    ]);
    
    const total = service.convertMultipleAmounts(amounts, 'EUR', rates);
    
    // 1000 EUR + (1000 * 0.92) EUR + (1000 * 1.16) EUR = 3080 EUR
    expect(total).toBe(3080);
  });
});

