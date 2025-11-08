import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type Theme = 'light' | 'dark' | 'auto';

export interface ThemeConfig {
  /** Storage key for saving theme preference */
  storageKey?: string;
  /** Default theme if none is saved */
  defaultTheme?: Theme;
  /** CSS class prefix (e.g., 'theme-' results in 'theme-light', 'theme-dark') */
  classPrefix?: string;
  /** HTML attribute name (e.g., 'data-theme') */
  attributeName?: string;
}

/**
 * Shared theme service for managing light/dark mode across applications
 * 
 * Features:
 * - System preference detection
 * - LocalStorage persistence
 * - Observable theme changes
 * - CSS class and attribute management
 * 
 * Usage:
 * ```typescript
 * constructor(private themeService: ThemeService) {
 *   this.themeService.theme$.subscribe(theme => {
 *     console.log('Current theme:', theme);
 *   });
 * }
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private config: Required<ThemeConfig> = {
    storageKey: 'app_theme',
    defaultTheme: 'auto',
    classPrefix: '',
    attributeName: 'data-theme'
  };

  private themeSubject: BehaviorSubject<Theme>;
  public theme$: Observable<Theme>;

  constructor() {
    const savedTheme = this.getSavedTheme();
    this.themeSubject = new BehaviorSubject<Theme>(savedTheme);
    this.theme$ = this.themeSubject.asObservable();
    this.applyTheme(savedTheme);

    // Listen for system theme changes
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (this.themeSubject.value === 'auto') {
          this.applyTheme('auto');
        }
      });
    }
  }

  /**
   * Gets the saved theme from localStorage or system preference
   */
  private getSavedTheme(): Theme {
    const saved = localStorage.getItem(this.config.storageKey);
    if (saved === 'dark' || saved === 'light' || saved === 'auto') {
      return saved;
    }
    return this.config.defaultTheme;
  }

  /**
   * Gets the currently active theme
   */
  getCurrentTheme(): Theme {
    return this.themeSubject.value;
  }

  /**
   * Gets the resolved theme (converts 'auto' to 'light' or 'dark' based on system preference)
   */
  getResolvedTheme(): 'light' | 'dark' {
    const current = this.themeSubject.value;
    if (current === 'auto') {
      return this.getSystemTheme();
    }
    return current;
  }

  /**
   * Gets the system/OS theme preference
   */
  private getSystemTheme(): 'light' | 'dark' {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }

  /**
   * Toggles between light and dark themes
   */
  toggleTheme(): void {
    const current = this.getResolvedTheme();
    const newTheme: Theme = current === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  /**
   * Sets a specific theme
   */
  setTheme(theme: Theme): void {
    localStorage.setItem(this.config.storageKey, theme);
    this.themeSubject.next(theme);
    this.applyTheme(theme);
  }

  /**
   * Applies the theme to the DOM
   */
  private applyTheme(theme: Theme): void {
    const resolved = theme === 'auto' ? this.getSystemTheme() : theme;
    
    // Set HTML attribute
    document.documentElement.setAttribute(this.config.attributeName, resolved);
    
    // Manage CSS classes
    if (this.config.classPrefix) {
      document.body.classList.remove(
        `${this.config.classPrefix}light`,
        `${this.config.classPrefix}dark`
      );
      document.body.classList.add(`${this.config.classPrefix}${resolved}`);
    } else {
      document.body.classList.remove('light-theme', 'dark-theme', 'light', 'dark');
      document.body.classList.add(`${resolved}-theme`);
    }
  }

  /**
   * Initializes theme service with custom configuration
   */
  configure(config: ThemeConfig): void {
    this.config = { ...this.config, ...config };
    this.applyTheme(this.themeSubject.value);
  }
}

