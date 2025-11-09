import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ReportService } from './report.service';
import { environment } from '../../environments/environment';

describe('ReportService', () => {
  let service: ReportService;
  let httpMock: HttpTestingController;
  const apiUrl = environment.apiUrl || 'http://localhost:3000/api';
  const testOrgId = '550e8400-e29b-41d4-a716-446655440000';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ReportService]
    });
    service = TestBed.inject(ReportService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getTrialBalance', () => {
    it('should fetch trial balance data for an organization', () => {
      const mockData = [
        {
          accountId: 'acc-1',
          accountNumber: '1000',
          accountName: 'Cash',
          accountCategory: 'Asset',
          normalBalance: 'DEBIT' as const,
          totalDebits: 25000,
          totalCredits: 0,
          balance: 25000
        }
      ];

      service.getTrialBalance(testOrgId).subscribe(data => {
        expect(data.length).toBe(1);
        expect(data[0].accountNumber).toBe('1000');
      });

      const req = httpMock.expectOne(`${apiUrl}/organizations/${testOrgId}/reports/trial-balance`);
      expect(req.request.method).toBe('GET');
      req.flush(mockData);
    });

    it('should include fiscalPeriodId in query params when provided', () => {
      const mockData: any[] = [];
      const fiscalPeriodId = 'fp-2024';

      service.getTrialBalance(testOrgId, fiscalPeriodId).subscribe();

      const req = httpMock.expectOne(`${apiUrl}/organizations/${testOrgId}/reports/trial-balance?fiscalPeriodId=${fiscalPeriodId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockData);
    });
  });

  describe('getBalanceSheet', () => {
    it('should fetch balance sheet data for an organization', () => {
      const mockData = [
        {
          category: 'Asset',
          accountTypeName: 'Current Assets',
          accountNumber: '1000',
          accountName: 'Cash',
          balance: 25000
        }
      ];

      service.getBalanceSheet(testOrgId).subscribe(data => {
        expect(data).toEqual(mockData);
        expect(data.length).toBe(1);
        expect(data[0].category).toBe('Asset');
      });

      const req = httpMock.expectOne(`${apiUrl}/organizations/${testOrgId}/reports/balance-sheet`);
      expect(req.request.method).toBe('GET');
      req.flush(mockData);
    });
  });

  describe('getProfitLoss', () => {
    it('should fetch profit & loss data for an organization', () => {
      const mockData = [
        {
          category: 'Revenue',
          accountTypeName: 'Sales',
          accountNumber: '4000',
          accountName: 'Product Sales',
          amount: 30000
        }
      ];

      service.getProfitLoss(testOrgId).subscribe(data => {
        expect(data).toEqual(mockData);
        expect(data.length).toBe(1);
        expect(data[0].category).toBe('Revenue');
      });

      const req = httpMock.expectOne(`${apiUrl}/organizations/${testOrgId}/reports/profit-loss`);
      expect(req.request.method).toBe('GET');
      req.flush(mockData);
    });
  });

  describe('getDashboardMetrics', () => {
    it('should fetch dashboard metrics', () => {
      const mockMetrics = {
        totalAssets: 90000,
        totalLiabilities: 15000,
        totalEquity: 75000,
        totalRevenue: 45500,
        totalExpenses: 20800,
        netIncome: 24700,
        entryCount: 5,
        accountCount: 8
      };

      service.getDashboardMetrics(testOrgId).subscribe(metrics => {
        expect(metrics).toEqual(mockMetrics);
        expect(metrics.totalAssets).toBe(90000);
      });

      const req = httpMock.expectOne(`${apiUrl}/organizations/${testOrgId}/dashboard`);
      expect(req.request.method).toBe('GET');
      req.flush(mockMetrics);
    });

    it('should include targetCurrency in query params when provided', () => {
      const mockMetrics = { totalAssets: 0, totalLiabilities: 0, totalEquity: 0, totalRevenue: 0, totalExpenses: 0, netIncome: 0, entryCount: 0, accountCount: 0 };

      service.getDashboardMetrics(testOrgId, 'EUR').subscribe();

      const req = httpMock.expectOne(`${apiUrl}/organizations/${testOrgId}/dashboard?targetCurrency=EUR`);
      expect(req.request.method).toBe('GET');
      req.flush(mockMetrics);
    });
  });
});

