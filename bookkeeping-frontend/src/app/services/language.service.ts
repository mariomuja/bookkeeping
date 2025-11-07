import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Language {
  code: string;
  name: string;
  flag: string;
}

// Minimal LanguageService without TranslateService to avoid NG0203
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

  constructor() {
    // Simple initialization without TranslateService
    const savedLang = localStorage.getItem('preferredLanguage');
    if (savedLang && this.availableLanguages.some(l => l.code === savedLang)) {
      this.currentLangSubject.next(savedLang);
    }
  }

  setLanguage(langCode: string): void {
    if (this.availableLanguages.some(l => l.code === langCode)) {
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
