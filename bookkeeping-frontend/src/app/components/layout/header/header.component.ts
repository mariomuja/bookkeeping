import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { OrganizationService } from '../../../services/organization.service';
import { LanguageService, Language } from '../../../services/language.service';
import { AuthService, User } from '../../../services/auth.service';
import { Organization } from '../../../models/organization.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  @Output() openDocumentation = new EventEmitter<void>();
  @Output() toggleMobileMenu = new EventEmitter<void>();
  
  currentOrganization: Organization | null = null;
  currentUser: User | null = null;
  userMenuOpen = false;
  languageMenuOpen = false;
  currentLanguage: Language | undefined;
  availableLanguages: Language[] = [];
  showHelpTooltip = false;

  constructor(
    private organizationService: OrganizationService,
    public languageService: LanguageService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.organizationService.currentOrganization$.subscribe(org => {
      this.currentOrganization = org;
    });

    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
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

  openDocumentationModal(): void {
    this.openDocumentation.emit();
    this.userMenuOpen = false;
    this.languageMenuOpen = false;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

