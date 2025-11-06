import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedHeaderComponent, HeaderConfig } from '@shared-components/layout';
import { LanguageSelectorComponent, LanguageService } from '@shared-components/ui';
import { OrganizationService } from '../../../services/organization.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, SharedHeaderComponent, LanguageSelectorComponent],
  template: `
    <shared-header 
      [config]="headerConfig" 
      (toggleMobileMenu)="toggleMobileMenu.emit()"
      (documentationClick)="openDocumentation.emit()">
      <shared-language-selector languageSelector [showLabel]="false"></shared-language-selector>
    </shared-header>
  `
})
export class HeaderComponent implements OnInit {
  @Output() openDocumentation = new EventEmitter<void>();
  @Output() toggleMobileMenu = new EventEmitter<void>();
  
  headerConfig: HeaderConfig = {
    appTitle: 'International Bookkeeping',
    showDocumentation: true,
    showOrganization: true,
    organizationName: '',
    organizationCurrency: ''
  };

  constructor(
    private organizationService: OrganizationService,
    public languageService: LanguageService
  ) {}

  ngOnInit(): void {
    // Initialize language service with bookkeeping languages
    this.languageService.configure({
      availableLanguages: [
        { code: 'en', name: 'English', flag: '🇬🇧' },
        { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
        { code: 'fr', name: 'Français', flag: '🇫🇷' },
        { code: 'es', name: 'Español', flag: '🇪🇸' },
        { code: 'it', name: 'Italiano', flag: '🇮🇹' }
      ],
      defaultLanguage: 'en'
    });

    this.organizationService.currentOrganization$.subscribe(org => {
      if (org) {
        this.headerConfig = {
          ...this.headerConfig,
          organizationName: org.name,
          organizationCurrency: org.defaultCurrency
        };
      }
    });
  }
}

