import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrganizationService } from '../../../services/organization.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="app-header">
      <div class="header-left">
        <button class="mobile-menu-btn" (click)="toggleMobileMenu.emit()">☰</button>
        <h1>International Bookkeeping</h1>
        <span *ngIf="organizationName" class="org-name">{{ organizationName }}</span>
      </div>
      <div class="header-right">
        <button class="doc-btn" (click)="openDocumentation.emit()">📖 Docs</button>
      </div>
    </header>
  `,
  styles: [`
    .app-header {
      background: #fff;
      border-bottom: 1px solid #e0e0e0;
      padding: 12px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .header-left {
      display: flex;
      align-items: center;
      gap: 15px;
    }
    h1 {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
    }
    .org-name {
      color: #666;
      font-size: 14px;
    }
    .mobile-menu-btn {
      display: none;
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
    }
    @media (max-width: 768px) {
      .mobile-menu-btn {
        display: block;
      }
    }
    .doc-btn {
      padding: 8px 16px;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
    }
  `]
})
export class HeaderComponent implements OnInit {
  @Output() openDocumentation = new EventEmitter<void>();
  @Output() toggleMobileMenu = new EventEmitter<void>();
  
  organizationName = '';

  constructor(
    private organizationService: OrganizationService
  ) {}

  ngOnInit(): void {
    this.organizationService.currentOrganization$.subscribe(org => {
      if (org) {
        this.organizationName = org.name;
      }
    });
  }
}

