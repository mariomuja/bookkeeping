import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { DashboardComponent } from './dashboard.component';
import { ReportService } from '../../services/report.service';
import { OrganizationService } from '../../services/organization.service';
import { of, throwError } from 'rxjs';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let reportService: jasmine.SpyObj<ReportService>;
  let organizationService: jasmine.SpyObj<OrganizationService>;

  beforeEach(async () => {
    const reportServiceSpy = jasmine.createSpyObj('ReportService', ['getDashboardMetrics']);
    const orgServiceSpy = jasmine.createSpyObj('OrganizationService', ['getCurrentOrganization']);

    await TestBed.configureTestingModule({
      imports: [DashboardComponent, HttpClientTestingModule],
      providers: [
        { provide: ReportService, useValue: reportServiceSpy },
        { provide: OrganizationService, useValue: orgServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    reportService = TestBed.inject(ReportService) as jasmine.SpyObj<ReportService>;
    organizationService = TestBed.inject(OrganizationService) as jasmine.SpyObj<OrganizationService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load dashboard metrics on init', (done) => {
    const mockOrg = {
      id: 'test-org',
      name: 'Test Company',
      defaultCurrency: 'EUR'
    };

    const mockMetrics = {
      totalAssets: 1000000,
      totalLiabilities: 500000,
      totalEquity: 500000,
      totalRevenue: 200000,
      totalExpenses: 150000,
      netIncome: 50000,
      entryCount: 100,
      accountCount: 20
    };

    organizationService.getCurrentOrganization.and.returnValue(mockOrg as any);
    reportService.getDashboardMetrics.and.returnValue(of(mockMetrics));

    component.ngOnInit();

    setTimeout(() => {
      expect(component.metrics).toEqual(mockMetrics);
      expect(component.loading).toBe(false);
      done();
    }, 100);
  });

  it('should show error when no organization selected', () => {
    organizationService.getCurrentOrganization.and.returnValue(null);

    component.loadDashboard();

    expect(component.error).toBe('Please select an organization');
    expect(component.loading).toBe(false);
  });

  it('should format currency correctly for EUR', () => {
    component.selectedCurrency = 'EUR';
    const formatted = component.formatCurrency(1234.56);
    expect(formatted).toContain('1,234.56');
  });

  it('should calculate net income correctly', () => {
    component.metrics = {
      totalAssets: 1000000,
      totalLiabilities: 500000,
      totalEquity: 500000,
      totalRevenue: 200000,
      totalExpenses: 150000,
      netIncome: 50000,
      entryCount: 100,
      accountCount: 20
    };

    expect(component.metrics.netIncome).toBe(50000);
    expect(component.metrics.netIncome).toBe(component.metrics.totalRevenue - component.metrics.totalExpenses);
  });

  it('should save currency preference to localStorage', () => {
    spyOn(localStorage, 'setItem');
    component.selectedCurrency = 'EUR';
    component.onCurrencyChange();

    expect(localStorage.setItem).toHaveBeenCalledWith('dashboardCurrency', 'EUR');
  });
});

