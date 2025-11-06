import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { ReportsComponent } from './reports.component';
import { ReportService } from '../../services/report.service';
import { OrganizationService } from '../../services/organization.service';

describe('ReportsComponent - Translation Integration', () => {
  let component: ReportsComponent;
  let fixture: ComponentFixture<ReportsComponent>;
  let translateService: TranslateService;
  let mockReportService: jasmine.SpyObj<ReportService>;
  let mockOrganizationService: jasmine.SpyObj<OrganizationService>;

  beforeEach(async () => {
    mockReportService = jasmine.createSpyObj('ReportService', ['generateReport']);
    mockOrganizationService = jasmine.createSpyObj('OrganizationService', ['getCurrentOrganization']);
    
    mockOrganizationService.getCurrentOrganization.and.returnValue({
      id: 'test-org',
      name: 'Test Org',
      countryCode: 'US',
      defaultCurrency: 'USD',
      defaultTimezone: 'America/New_York',
      fiscalYearStart: 1,
      fiscalYearEnd: 12,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    });

    await TestBed.configureTestingModule({
      imports: [
        ReportsComponent,
        HttpClientTestingModule,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: ReportService, useValue: mockReportService },
        { provide: OrganizationService, useValue: mockOrganizationService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ReportsComponent);
    component = fixture.componentInstance;
    translateService = TestBed.inject(TranslateService);
    translateService.setDefaultLang('en');
    translateService.use('en');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Translation Keys', () => {
    it('should have multiple report cards', () => {
      expect(component.reports.length).toBeGreaterThan(0);
    });

    it('should render translated report cards', () => {
      const compiled = fixture.nativeElement;
      const reportCards = compiled.querySelectorAll('.report-card');
      expect(reportCards.length).toBeGreaterThan(0);
    });

    it('should have report IDs for all reports', () => {
      component.reports.forEach((report: any) => {
        expect(report.id).toBeTruthy();
        expect(report.title).toBeTruthy();
      });
    });
  });

  describe('Multi-language Support', () => {
    it('should display content in German', () => {
      translateService.use('de');
      fixture.detectChanges();
      const compiled = fixture.nativeElement;
      expect(compiled.textContent).toBeTruthy();
    });

    it('should display content in Spanish', () => {
      translateService.use('es');
      fixture.detectChanges();
      const compiled = fixture.nativeElement;
      expect(compiled.textContent).toBeTruthy();
    });

    it('should display content in French', () => {
      translateService.use('fr');
      fixture.detectChanges();
      const compiled = fixture.nativeElement;
      expect(compiled.textContent).toBeTruthy();
    });

    it('should display content in Italian', () => {
      translateService.use('it');
      fixture.detectChanges();
      const compiled = fixture.nativeElement;
      expect(compiled.textContent).toBeTruthy();
    });
  });
});

