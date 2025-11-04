import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { OrganizationService } from '../../../services/organization.service';
import { LanguageService, Language } from '../../../services/language.service';
import { Organization } from '../../../models/organization.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  currentOrganization: Organization | null = null;
  userMenuOpen = false;
  languageMenuOpen = false;
  currentLanguage: Language | undefined;
  availableLanguages: Language[] = [];

  constructor(
    private organizationService: OrganizationService,
    public languageService: LanguageService
  ) {}

  ngOnInit(): void {
    this.organizationService.currentOrganization$.subscribe(org => {
      this.currentOrganization = org;
    });

    this.availableLanguages = this.languageService.availableLanguages;
    this.currentLanguage = this.languageService.getCurrentLanguageInfo();
    
    this.languageService.currentLang$.subscribe(lang => {
      this.currentLanguage = this.availableLanguages.find(l => l.code === lang);
    });
  }

  toggleUserMenu(): void {
    this.userMenuOpen = !this.userMenuOpen;
    this.languageMenuOpen = false;
  }

  toggleLanguageMenu(): void {
    this.languageMenuOpen = !this.languageMenuOpen;
    this.userMenuOpen = false;
  }

  changeLanguage(langCode: string): void {
    this.languageService.setLanguage(langCode);
    this.languageMenuOpen = false;
  }
}

