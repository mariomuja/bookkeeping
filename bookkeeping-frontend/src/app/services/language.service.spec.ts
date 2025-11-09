import { TestBed } from '@angular/core/testing';
import { LanguageService } from './language.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';

describe('LanguageService', () => {
  let service: LanguageService;
  let translateService: TranslateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        TranslateModule.forRoot()
      ],
      providers: [LanguageService]
    });
    service = TestBed.inject(LanguageService);
    translateService = TestBed.inject(TranslateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have 5 available languages', () => {
    expect(service.availableLanguages.length).toBe(5);
    expect(service.availableLanguages.map(l => l.code)).toEqual(['en', 'de', 'fr', 'es', 'it']);
  });

  it('should set language to English by default', (done) => {
    // Wait for async initialization
    setTimeout(() => {
      expect(translateService.defaultLang).toBe('en');
      done();
    }, 10);
  });

  it('should change language to German', (done) => {
    // Wait for async initialization
    setTimeout(() => {
      spyOn(translateService, 'use').and.returnValue(of({}));
      service.setLanguage('de');

      expect(translateService.use).toHaveBeenCalledWith('de');
      expect(service.getCurrentLanguage()).toBe('de');
      done();
    }, 10);
  });

  it('should save language preference to localStorage', () => {
    spyOn(localStorage, 'setItem');
    service.setLanguage('fr');

    expect(localStorage.setItem).toHaveBeenCalledWith('preferredLanguage', 'fr');
  });

  it('should not set invalid language', () => {
    const beforeLang = service.getCurrentLanguage();
    service.setLanguage('invalid');

    expect(service.getCurrentLanguage()).toBe(beforeLang);
  });

  it('should get current language info', () => {
    service.setLanguage('de');
    const info = service.getCurrentLanguageInfo();

    expect(info).toBeDefined();
    expect(info?.code).toBe('de');
    expect(info?.name).toBe('Deutsch');
    expect(info?.flag).toBe('🇩🇪');
  });

  it('should have correct flag for each language', () => {
    const flags: {[key: string]: string} = {
      'en': '🇬🇧',
      'de': '🇩🇪',
      'fr': '🇫🇷',
      'es': '🇪🇸',
      'it': '🇮🇹'
    };

    service.availableLanguages.forEach(lang => {
      expect(lang.flag).toBe(flags[lang.code]);
    });
  });
});

