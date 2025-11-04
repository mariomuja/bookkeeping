import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

interface MenuItem {
  icon: string;
  label: string;
  translationKey: string;
  route: string;
  badge?: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  menuItems: MenuItem[] = [
    { icon: 'dashboard', label: 'Dashboard', translationKey: 'nav.dashboard', route: '/dashboard' },
    { icon: 'accounts', label: 'Chart of Accounts', translationKey: 'nav.accounts', route: '/accounts' },
    { icon: 'journal', label: 'Journal Entries', translationKey: 'nav.journalEntries', route: '/journal-entries' },
    { icon: 'reports', label: 'Reports', translationKey: 'nav.reports', route: '/reports' },
    { icon: 'import', label: 'Import Data', translationKey: 'nav.import', route: '/import' },
    { icon: 'custom-fields', label: 'Custom Fields', translationKey: 'nav.customFields', route: '/custom-fields' },
    { icon: 'audit', label: 'Audit Log', translationKey: 'nav.auditLog', route: '/audit-log' },
    { icon: 'settings', label: 'Settings', translationKey: 'nav.settings', route: '/settings' }
  ];

  constructor(public router: Router) {}

  isActiveRoute(route: string): boolean {
    return this.router.url.startsWith(route);
  }
}

