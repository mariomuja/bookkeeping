import { Injectable, Optional } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';

export interface Language {
  code: string;
  name: string;
  flag: string;
}

@Injectable({
  providedIn: 'root'
})
// TEMPORARILY DISABLED - causing NG0203 error
/*
export class LanguageService {
  private currentLangSubject = new BehaviorSubject<string>('en');
  public currentLang$ = this.currentLangSubject.asObservable();

  public availableLanguages: Language[] = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' }
  ];

  private translateService?: TranslateService;

  constructor(@Optional() private translate?: TranslateService) {
    // Store reference but defer initialization to avoid circular dependency
    if (translate) {
      this.translateService = translate;
      // Use setTimeout to defer initialization after Angular bootstrap completes
      setTimeout(() => this.initialize(), 0);
    }
  }

  private initialize(): void {
    if (!this.translateService) return;
    
    // Set available languages
    const langCodes = this.availableLanguages.map(l => l.code);
    this.translateService.addLangs(langCodes);
    
    // Set default language
    this.translateService.setDefaultLang('en');
    
    // Try to use browser language if available
    const browserLang = this.translateService.getBrowserLang();
    const savedLang = localStorage.getItem('preferredLanguage');
    
    const langToUse = savedLang || (browserLang && langCodes.includes(browserLang) ? browserLang : 'en');
    this.setLanguage(langToUse);
  }

  setLanguage(langCode: string): void {
    if (this.availableLanguages.some(l => l.code === langCode)) {
      if (this.translateService) {
        this.translateService.use(langCode).subscribe();
      }
      this.currentLangSubject.next(langCode);
      localStorage.setItem('preferredLanguage', langCode);
      if (typeof document !== 'undefined') {
        document.documentElement.lang = langCode;
      }
    }
  }

  getCurrentLanguage(): string {
    return this.currentLangSubject.value;
  }

  getCurrentLanguageInfo(): Language | undefined {
    return this.availableLanguages.find(l => l.code === this.getCurrentLanguage());
  }
}

