import { Injectable } from '@angular/core';
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

  constructor(private translate: TranslateService) {
    // Set available languages
    const langCodes = this.availableLanguages.map(l => l.code);
    this.translate.addLangs(langCodes);
    
    // Set default language
    this.translate.setDefaultLang('en');
    
    // Try to use browser language if available
    const browserLang = this.translate.getBrowserLang();
    const savedLang = localStorage.getItem('preferredLanguage');
    
    const langToUse = savedLang || (browserLang && langCodes.includes(browserLang) ? browserLang : 'en');
    this.setLanguage(langToUse);
  }

  setLanguage(langCode: string): void {
    if (this.availableLanguages.some(l => l.code === langCode)) {
      this.translate.use(langCode);
      this.currentLangSubject.next(langCode);
      localStorage.setItem('preferredLanguage', langCode);
      document.documentElement.lang = langCode;
    }
  }

  getCurrentLanguage(): string {
    return this.currentLangSubject.value;
  }

  getCurrentLanguageInfo(): Language | undefined {
    return this.availableLanguages.find(l => l.code === this.getCurrentLanguage());
  }
}

