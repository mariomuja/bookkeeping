import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { BalanceSheetViewerComponent } from './balance-sheet-viewer.component';
import { ReportService } from '../../services/report.service';
import { BalanceSheetItem } from '../../models/report.model';

describe('BalanceSheetViewerComponent', () => {
  let component: BalanceSheetViewerComponent;
  let fixture: ComponentFixture<BalanceSheetViewerComponent>;
  let mockReportService: jasmine.SpyObj<ReportService>;
  let mockActivatedRoute: any;

  const mockBalanceSheetData: BalanceSheetItem[] = [
    {
      category: 'Asset',
      accountTypeName: 'Current Assets',
      accountNumber: '1000',
      accountName: 'Cash',
      balance: 25000
    },
    {
      category: 'Liability',
      accountTypeName: 'Current Liabilities',
      accountNumber: '2000',
      accountName: 'Accounts Payable',
      balance: 10000
    },
    {
      category: 'Equity',
      accountTypeName: 'Owner\'s Equity',
      accountNumber: '3000',
      accountName: 'Capital',
      balance: 60000
    }
  ];

  beforeEach(async () => {
    mockReportService = jasmine.createSpyObj('ReportService', ['getBalanceSheet']);
    mockActivatedRoute = {
      queryParams: of({ orgId: '550e8400-e29b-41d4-a716-446655440000' })
    };

    await TestBed.configureTestingModule({
      imports: [BalanceSheetViewerComponent],
      providers: [
        { provide: ReportService, useValue: mockReportService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BalanceSheetViewerComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load balance sheet on init', () => {
    mockReportService.getBalanceSheet.and.returnValue(of(mockBalanceSheetData));
    
    component.ngOnInit();
    
    expect(mockReportService.getBalanceSheet).toHaveBeenCalled();
    expect(component.data).toEqual(mockBalanceSheetData);
    expect(component.loading).toBe(false);
  });

  it('should filter assets correctly', () => {
    component.data = mockBalanceSheetData;
    
    const assets = component.getAssets();
    
    expect(assets.length).toBe(1);
    expect(assets[0].category).toBe('Asset');
  });

  it('should filter liabilities correctly', () => {
    component.data = mockBalanceSheetData;
    
    const liabilities = component.getLiabilities();
    
    expect(liabilities.length).toBe(1);
    expect(liabilities[0].category).toBe('Liability');
  });

  it('should filter equity correctly', () => {
    component.data = mockBalanceSheetData;
    
    const equity = component.getEquity();
    
    expect(equity.length).toBe(1);
    expect(equity[0].category).toBe('Equity');
  });

  it('should calculate category totals correctly', () => {
    component.data = mockBalanceSheetData;
    
    expect(component.getTotal('Asset')).toBe(25000);
    expect(component.getTotal('Liability')).toBe(10000);
    expect(component.getTotal('Equity')).toBe(60000);
  });

  it('should handle error when loading fails', () => {
    mockReportService.getBalanceSheet.and.returnValue(throwError(() => new Error('API Error')));
    
    component.ngOnInit();
    
    expect(component.error).toBe('Failed to load balance sheet');
    expect(component.loading).toBe(false);
  });
});


