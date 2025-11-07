import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './components/layout/header/header.component';
import { SidebarComponent } from './components/layout/sidebar/sidebar.component';
import { DocumentationModalComponent } from './components/documentation-modal/documentation-modal.component';
import { OrganizationService } from './services/organization.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, SidebarComponent, DocumentationModalComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'International Bookkeeping';
  showMainLayout = true;
  showDocumentationModal = false;
  isMobileSidebarOpen = false;

  constructor(
    private organizationService: OrganizationService,
    private router: Router
  ) {
    // Listen to route changes to determine if we should show the main layout
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      // Hide layout for report viewer routes, login page, and startup
      const hideLayoutRoutes = ['/report/', '/login', '/startup'];
      const currentUrl = event.url === '/' ? '/startup' : event.url;
      this.showMainLayout = !hideLayoutRoutes.some(route => currentUrl.startsWith(route));
      // Close mobile sidebar on navigation
      this.isMobileSidebarOpen = false;
    });
  }

  ngOnInit(): void {
    // Initialize with the backend organization only if user is authenticated
    const currentOrg = this.organizationService.getCurrentOrganization();
    console.log('[AppComponent] Current organization on init:', currentOrg);
    
    // Check if user is authenticated via token
    const isAuthenticated = localStorage.getItem('authToken');
    
    if (isAuthenticated && !currentOrg) {
      const demoOrg = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Demo Company',
        countryCode: 'US',
        defaultCurrency: 'USD',
        defaultTimezone: 'America/New_York',
        fiscalYearStart: 1,
        fiscalYearEnd: 12,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true
      };
      console.log('[AppComponent] Setting demo organization:', demoOrg);
      this.organizationService.setCurrentOrganization(demoOrg);
      console.log('[AppComponent] Organization set, verifying:', this.organizationService.getCurrentOrganization());
    }

    // Check initial route
    const hideLayoutRoutes = ['/report/', '/login', '/startup'];
    const currentUrl = this.router.url === '/' ? '/startup' : this.router.url;
    this.showMainLayout = !hideLayoutRoutes.some(route => currentUrl.startsWith(route));
  }

  openDocumentation(): void {
    this.showDocumentationModal = true;
  }

  closeDocumentation(): void {
    this.showDocumentationModal = false;
  }
  
  toggleMobileSidebar(): void {
    this.isMobileSidebarOpen = !this.isMobileSidebarOpen;
  }
  
  closeMobileSidebar(): void {
    this.isMobileSidebarOpen = false;
  }
}
