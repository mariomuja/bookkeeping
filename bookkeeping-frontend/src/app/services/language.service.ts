import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

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

  constructor(private translate: TranslateService, private http: HttpClient) {
    // Set available languages
    const langCodes = this.availableLanguages.map(l => l.code);
    this.translate.addLangs(langCodes);
    
    // Set default language
    this.translate.setDefaultLang('en');
    
    // Load translations from JSON files and then set language
    this.loadTranslations().then(() => {
      // Try to use browser language if available
      const browserLang = this.translate.getBrowserLang();
      const savedLang = localStorage.getItem('preferredLanguage');
      
      const langToUse = savedLang || (browserLang && langCodes.includes(browserLang) ? browserLang : 'en');
      this.setLanguage(langToUse);
    });
  }

  private async loadTranslations(): Promise<void> {
    // Load translation files from assets/i18n/
    const languages = ['en', 'de', 'fr', 'es', 'it'];
    
    const loadPromises = languages.map(async (lang) => {
      try {
        const translations = await this.http.get(`/assets/i18n/${lang}.json`).toPromise();
        this.translate.setTranslation(lang, translations, true);
        console.log(`[Language] ✓ Loaded ${lang} translations - auditLog exists:`, !!(translations as any).auditLog);
        return true;
      } catch (err) {
        console.error(`[Language] ✗ Failed to load ${lang} translations:`, err);
        return false;
      }
    });
    
    await Promise.all(loadPromises);
    console.log('[Language] All translations loaded successfully');
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

