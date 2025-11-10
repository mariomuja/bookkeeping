import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ProfitLossViewerComponent } from './profit-loss-viewer.component';
import { ReportService } from '../../services/report.service';
import { ProfitLossItem } from '../../models/report.model';

describe('ProfitLossViewerComponent', () => {
  let component: ProfitLossViewerComponent;
  let fixture: ComponentFixture<ProfitLossViewerComponent>;
  let mockReportService: jasmine.SpyObj<ReportService>;
  let mockActivatedRoute: any;

  const mockProfitLossData: ProfitLossItem[] = [
    {
      category: 'Revenue',
      accountTypeName: 'Sales',
      accountNumber: '4000',
      accountName: 'Product Sales',
      amount: 30000
    },
    {
      category: 'Cost of Goods Sold',
      accountTypeName: 'Direct Costs',
      accountNumber: '5000',
      accountName: 'Product Costs',
      amount: 12000
    },
    {
      category: 'Operating Expenses',
      accountTypeName: 'General & Administrative',
      accountNumber: '6000',
      accountName: 'Salaries',
      amount: 15000
    }
  ];

  beforeEach(async () => {
    mockReportService = jasmine.createSpyObj('ReportService', ['getProfitLoss']);
    mockActivatedRoute = {
      queryParams: of({ orgId: '550e8400-e29b-41d4-a716-446655440000' })
    };

    await TestBed.configureTestingModule({
      imports: [ProfitLossViewerComponent],
      providers: [
        { provide: ReportService, useValue: mockReportService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProfitLossViewerComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load profit & loss on init', () => {
    mockReportService.getProfitLoss.and.returnValue(of(mockProfitLossData));
    
    component.ngOnInit();
    
    expect(mockReportService.getProfitLoss).toHaveBeenCalled();
    expect(component.data).toEqual(mockProfitLossData);
    expect(component.loading).toBe(false);
  });

  it('should filter revenue correctly', () => {
    component.data = mockProfitLossData;
    
    const revenue = component.getRevenue();
    
    expect(revenue.length).toBe(1);
    expect(revenue[0].category).toBe('Revenue');
  });

  it('should filter COGS correctly', () => {
    component.data = mockProfitLossData;
    
    const cogs = component.getCOGS();
    
    expect(cogs.length).toBe(1);
    expect(cogs[0].category).toBe('Cost of Goods Sold');
  });

  it('should filter expenses correctly', () => {
    component.data = mockProfitLossData;
    
    const expenses = component.getExpenses();
    
    expect(expenses.length).toBe(1);
    expect(expenses[0].category).toBe('Operating Expenses');
  });

  it('should calculate category totals correctly', () => {
    component.data = mockProfitLossData;
    
    expect(component.getTotal('Revenue')).toBe(30000);
    expect(component.getTotal('Cost of Goods Sold')).toBe(12000);
    expect(component.getTotal('Operating Expenses')).toBe(15000);
  });

  it('should calculate net income correctly', () => {
    component.data = mockProfitLossData;
    
    const netIncome = component.getNetIncome();
    
    // Revenue (30000) - COGS (12000) - Expenses (15000) = 3000
    expect(netIncome).toBe(3000);
  });

  it('should handle error when loading fails', () => {
    mockReportService.getProfitLoss.and.returnValue(throwError(() => new Error('API Error')));
    
    component.ngOnInit();
    
    expect(component.error).toBe('Failed to load profit & loss statement');
    expect(component.loading).toBe(false);
  });
});


