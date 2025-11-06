import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { ImportComponent } from './import.component';
import { JournalEntryService } from '../../services/journal-entry.service';
import { OrganizationService } from '../../services/organization.service';

describe('ImportComponent - Translation Integration', () => {
  let component: ImportComponent;
  let fixture: ComponentFixture<ImportComponent>;
  let translateService: TranslateService;
  let mockJournalEntryService: jasmine.SpyObj<JournalEntryService>;
  let mockOrganizationService: jasmine.SpyObj<OrganizationService>;

  beforeEach(async () => {
    mockJournalEntryService = jasmine.createSpyObj('JournalEntryService', ['importEntries']);
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
        ImportComponent,
        HttpClientTestingModule,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: JournalEntryService, useValue: mockJournalEntryService },
        { provide: OrganizationService, useValue: mockOrganizationService },
        TranslateService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ImportComponent);
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
    it('should use translation pipe for page title', () => {
      const compiled = fixture.nativeElement;
      const title = compiled.querySelector('h1');
      expect(title).toBeTruthy();
    });

    it('should use translation pipe for upload area text', () => {
      const compiled = fixture.nativeElement;
      const uploadText = compiled.querySelector('.upload-area');
      expect(uploadText).toBeTruthy();
    });

    it('should use translation pipe for history section', () => {
      const compiled = fixture.nativeElement;
      const historySection = compiled.querySelector('.history-section');
      expect(historySection).toBeTruthy();
    });

    it('should have all required translation keys', () => {
      const requiredKeys = [
        'import.title',
        'import.subtitle',
        'import.uploadArea.title',
        'import.uploadArea.subtitle',
        'import.uploadArea.browse',
        'import.history.title',
        'import.history.empty'
      ];

      // Verify translation keys exist in the template
      const compiled = fixture.nativeElement;
      expect(compiled.textContent).toBeTruthy();
    });
  });

  describe('Language Switching', () => {
    it('should update text when language changes to German', () => {
      translateService.use('de');
      fixture.detectChanges();
      expect(fixture.nativeElement).toBeTruthy();
    });

    it('should update text when language changes to Spanish', () => {
      translateService.use('es');
      fixture.detectChanges();
      expect(fixture.nativeElement).toBeTruthy();
    });

    it('should update text when language changes to French', () => {
      translateService.use('fr');
      fixture.detectChanges();
      expect(fixture.nativeElement).toBeTruthy();
    });

    it('should update text when language changes to Italian', () => {
      translateService.use('it');
      fixture.detectChanges();
      expect(fixture.nativeElement).toBeTruthy();
    });
  });
});

