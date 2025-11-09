import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { TrialBalanceViewerComponent } from './trial-balance-viewer.component';
import { ReportService } from '../../services/report.service';
import { TrialBalanceItem } from '../../models/report.model';

describe('TrialBalanceViewerComponent', () => {
  let component: TrialBalanceViewerComponent;
  let fixture: ComponentFixture<TrialBalanceViewerComponent>;
  let mockReportService: jasmine.SpyObj<ReportService>;
  let mockActivatedRoute: any;

  const mockTrialBalanceData: TrialBalanceItem[] = [
    {
      accountId: 'acc-1',
      accountNumber: '1000',
      accountName: 'Cash',
      accountCategory: 'Asset',
      normalBalance: 'DEBIT',
      totalDebits: 25000,
      totalCredits: 0,
      balance: 25000
    },
    {
      accountId: 'acc-2',
      accountNumber: '2000',
      accountName: 'Accounts Payable',
      accountCategory: 'Liability',
      normalBalance: 'CREDIT',
      totalDebits: 0,
      totalCredits: 10000,
      balance: -10000
    }
  ];

  beforeEach(async () => {
    mockReportService = jasmine.createSpyObj('ReportService', ['getTrialBalance']);
    mockActivatedRoute = {
      queryParams: of({ orgId: '550e8400-e29b-41d4-a716-446655440000' })
    };

    await TestBed.configureTestingModule({
      imports: [TrialBalanceViewerComponent],
      providers: [
        { provide: ReportService, useValue: mockReportService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TrialBalanceViewerComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load trial balance on init when orgId is provided', () => {
    mockReportService.getTrialBalance.and.returnValue(of(mockTrialBalanceData));
    
    component.ngOnInit();
    
    expect(component.orgId).toBe('550e8400-e29b-41d4-a716-446655440000');
    expect(mockReportService.getTrialBalance).toHaveBeenCalledWith('550e8400-e29b-41d4-a716-446655440000');
    expect(component.data).toEqual(mockTrialBalanceData);
    expect(component.loading).toBe(false);
    expect(component.error).toBeNull();
  });

  it('should set error when orgId is not provided', () => {
    mockActivatedRoute.queryParams = of({});
    
    component.ngOnInit();
    
    expect(component.error).toBe('Organization ID not provided');
  });

  it('should handle error when loading report fails', () => {
    mockReportService.getTrialBalance.and.returnValue(throwError(() => new Error('API Error')));
    
    component.ngOnInit();
    
    expect(component.error).toBe('Failed to load trial balance');
    expect(component.loading).toBe(false);
  });

  it('should calculate total debits correctly', () => {
    component.data = mockTrialBalanceData;
    
    const totalDebits = component.getTotalDebits();
    
    expect(totalDebits).toBe(25000);
  });

  it('should calculate total credits correctly', () => {
    component.data = mockTrialBalanceData;
    
    const totalCredits = component.getTotalCredits();
    
    expect(totalCredits).toBe(10000);
  });

  it('should format currency correctly', () => {
    const formatted = component.formatCurrency(25000);
    
    expect(formatted).toContain('25,000');
  });
});

