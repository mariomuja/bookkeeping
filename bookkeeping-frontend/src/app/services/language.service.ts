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
    
    // Load translations manually (since HTTP loader has version issues)
    this.loadTranslations();
    
    // Try to use browser language if available
    const browserLang = this.translate.getBrowserLang();
    const savedLang = localStorage.getItem('preferredLanguage');
    
    const langToUse = savedLang || (browserLang && langCodes.includes(browserLang) ? browserLang : 'en');
    this.setLanguage(langToUse);
  }

  private loadTranslations(): void {
    // Basic translations - full translations would be loaded from assets/i18n/*.json files
    const translations: any = {
      en: { nav: { dashboard: 'Dashboard', accounts: 'Chart of Accounts', journalEntries: 'Journal Entries', reports: 'Reports', lossTriangle: 'Loss Triangle', import: 'Import Data', customFields: 'Custom Fields', settings: 'Settings' }},
      de: { nav: { dashboard: 'Dashboard', accounts: 'Kontenplan', journalEntries: 'Buchungen', reports: 'Berichte', lossTriangle: 'Schadendreieck', import: 'Daten importieren', customFields: 'Benutzerdefinierte Felder', settings: 'Einstellungen' }},
      fr: { nav: { dashboard: 'Tableau de bord', accounts: 'Plan comptable', journalEntries: 'Écritures', reports: 'Rapports', lossTriangle: 'Triangle de Sinistres', import: 'Importer', customFields: 'Champs personnalisés', settings: 'Paramètres' }},
      es: { nav: { dashboard: 'Panel', accounts: 'Plan de cuentas', journalEntries: 'Asientos', reports: 'Informes', lossTriangle: 'Triángulo', import: 'Importar', customFields: 'Campos', settings: 'Configuración' }},
      it: { nav: { dashboard: 'Dashboard', accounts: 'Piano conti', journalEntries: 'Registrazioni', reports: 'Report', lossTriangle: 'Triangolo', import: 'Importa', customFields: 'Campi', settings: 'Impostazioni' }}
    };
    
    Object.keys(translations).forEach(lang => {
      this.translate.setTranslation(lang, translations[lang], false);
    });
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

