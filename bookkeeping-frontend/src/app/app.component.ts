import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './components/layout/header/header.component';
import { SidebarComponent } from './components/layout/sidebar/sidebar.component';
import { OrganizationService } from './services/organization.service';
import { LanguageService } from './services/language.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, SidebarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'BookKeeper Pro';

  constructor(
    private organizationService: OrganizationService,
    private languageService: LanguageService
  ) {}

  ngOnInit(): void {
    // Initialize with a demo organization if none exists
    const currentOrg = this.organizationService.getCurrentOrganization();
    if (!currentOrg) {
      const demoOrg = {
        id: 'demo-org-1',
        name: 'Demo Company Inc.',
        countryCode: 'US',
        defaultCurrency: 'USD',
        defaultTimezone: 'America/New_York',
        fiscalYearStart: 1,
        fiscalYearEnd: 12,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true
      };
      this.organizationService.setCurrentOrganization(demoOrg);
    }
  }
}
