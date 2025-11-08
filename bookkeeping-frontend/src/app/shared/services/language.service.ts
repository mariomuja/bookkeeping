import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Language {
  code: string;
  name: string;
  nativeName?: string;
  flag: string;
  direction?: 'ltr' | 'rtl';
}

export interface LanguageConfig {
  /** Available languages for the application */
  availableLanguages: Language[];
  /** Default fallback language */
  defaultLanguage: string;
  /** Storage key for saving language preference */
  storageKey?: string;
  /** Whether to use browser language if available */
  useBrowserLanguage?: boolean;
}

/**
 * Shared language/i18n service for managing multi-language support
 * 
 * Features:
 * - Multi-language support with configurable languages
 * - Browser language detection
 * - LocalStorage persistence
 * - Observable language changes
 * - RTL support
 * 
 * Note: This service manages language selection. 
 * For translations, use with @ngx-translate/core's TranslateService
 * 
 * Usage:
 * ```typescript
 * constructor(
 *   private languageService: LanguageService,
 *   private translate: TranslateService
 * ) {
 *   // Initialize with app's languages
 *   languageService.configure({
 *     availableLanguages: [
 *       { code: 'en', name: 'English', flag: '🇬🇧' },
 *       { code: 'de', name: 'Deutsch', flag: '🇩🇪' }
 *     ],
 *     defaultLanguage: 'en'
 *   });
 *   
 *   // Sync with ngx-translate
 *   languageService.currentLanguage$.subscribe(lang => {
 *     translate.use(lang);
 *   });
 * }
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private config: Required<LanguageConfig> = {
    availableLanguages: [
      { code: 'en', name: 'English', flag: '🇬🇧', direction: 'ltr' },
      { code: 'de', name: 'Deutsch', flag: '🇩🇪', direction: 'ltr' },
      { code: 'fr', name: 'Français', flag: '🇫🇷', direction: 'ltr' },
      { code: 'es', name: 'Español', flag: '🇪🇸', direction: 'ltr' },
      { code: 'it', name: 'Italiano', flag: '🇮🇹', direction: 'ltr' }
    ],
    defaultLanguage: 'en',
    storageKey: 'app_language',
    useBrowserLanguage: true
  };

  private currentLanguageSubject: BehaviorSubject<string>;
  public currentLanguage$: Observable<string>;

  constructor() {
    const initialLanguage = this.determineInitialLanguage();
    this.currentLanguageSubject = new BehaviorSubject<string>(initialLanguage);
    this.currentLanguage$ = this.currentLanguageSubject.asObservable();
    this.applyLanguage(initialLanguage);
  }

  /**
   * Configures the language service with app-specific settings
   */
  configure(config: Partial<LanguageConfig>): void {
    this.config = { ...this.config, ...config } as Required<LanguageConfig>;
    
    // Validate current language is still available
    const currentLang = this.currentLanguageSubject.value;
    if (!this.isLanguageAvailable(currentLang)) {
      this.setLanguage(this.config.defaultLanguage);
    }
  }

  /**
   * Gets all available languages
   */
  getAvailableLanguages(): Language[] {
    return this.config.availableLanguages;
  }

  /**
   * Gets the current language code
   */
  getCurrentLanguage(): string {
    return this.currentLanguageSubject.value;
  }

  /**
   * Gets the current language info object
   */
  getCurrentLanguageInfo(): Language | undefined {
    return this.config.availableLanguages.find(
      l => l.code === this.getCurrentLanguage()
    );
  }

  /**
   * Sets the current language
   */
  setLanguage(languageCode: string): void {
    if (!this.isLanguageAvailable(languageCode)) {
      console.warn(`Language '${languageCode}' is not available. Using default.`);
      languageCode = this.config.defaultLanguage;
    }

    localStorage.setItem(this.config.storageKey, languageCode);
    this.currentLanguageSubject.next(languageCode);
    this.applyLanguage(languageCode);
  }

  /**
   * Checks if a language is available
   */
  isLanguageAvailable(languageCode: string): boolean {
    return this.config.availableLanguages.some(l => l.code === languageCode);
  }

  /**
   * Gets the browser's preferred language
   */
  getBrowserLanguage(): string | undefined {
    if (typeof window === 'undefined' || !window.navigator) {
      return undefined;
    }

    const browserLang = window.navigator.language?.split('-')[0];
    return browserLang && this.isLanguageAvailable(browserLang) ? browserLang : undefined;
  }

  /**
   * Determines the initial language to use
   */
  private determineInitialLanguage(): string {
    // 1. Check saved preference
    const saved = localStorage.getItem(this.config.storageKey);
    if (saved && this.isLanguageAvailable(saved)) {
      return saved;
    }

    // 2. Check browser language if enabled
    if (this.config.useBrowserLanguage) {
      const browserLang = this.getBrowserLanguage();
      if (browserLang) {
        return browserLang;
      }
    }

    // 3. Fall back to default
    return this.config.defaultLanguage;
  }

  /**
   * Applies language to the DOM
   */
  private applyLanguage(languageCode: string): void {
    // Set HTML lang attribute
    if (typeof document !== 'undefined') {
      document.documentElement.lang = languageCode;

      // Set direction (RTL/LTR)
      const language = this.config.availableLanguages.find(l => l.code === languageCode);
      if (language?.direction) {
        document.documentElement.dir = language.direction;
      }
    }
  }

  /**
   * Cycles to the next available language
   */
  cycleLanguage(): void {
    const languages = this.config.availableLanguages;
    const currentIndex = languages.findIndex(l => l.code === this.getCurrentLanguage());
    const nextIndex = (currentIndex + 1) % languages.length;
    this.setLanguage(languages[nextIndex].code);
  }
}

