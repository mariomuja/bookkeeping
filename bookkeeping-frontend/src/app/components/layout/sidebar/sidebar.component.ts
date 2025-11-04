import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

interface MenuItem {
  icon: string;
  label: string;
  route: string;
  badge?: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  menuItems: MenuItem[] = [
    { icon: 'dashboard', label: 'Dashboard', route: '/dashboard' },
    { icon: 'accounts', label: 'Chart of Accounts', route: '/accounts' },
    { icon: 'journal', label: 'Journal Entries', route: '/journal-entries' },
    { icon: 'reports', label: 'Reports', route: '/reports' },
    { icon: 'import', label: 'Import Data', route: '/import' },
    { icon: 'settings', label: 'Settings', route: '/settings' }
  ];

  constructor(public router: Router) {}

  isActiveRoute(route: string): boolean {
    return this.router.url.startsWith(route);
  }
}

