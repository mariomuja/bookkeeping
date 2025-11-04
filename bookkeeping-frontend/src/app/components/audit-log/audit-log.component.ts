import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuditLogService, AuditLog, AuditStats } from '../../services/audit-log.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-audit-log',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './audit-log.component.html',
  styleUrls: ['./audit-log.component.css']
})
export class AuditLogComponent implements OnInit {
  logs: AuditLog[] = [];
  stats: AuditStats | null = null;
  loading = false;
  error: string | null = null;

  // Filters
  filterAction = '';
  filterEntityType = '';
  filterUsername = '';
  filterStartDate = '';
  filterEndDate = '';
  
  // Pagination
  currentPage = 1;
  pageSize = 100;
  totalCount = 0;
  totalPages = 0;

  // Available options
  actions = ['LOGIN', 'LOGOUT', 'CREATE', 'UPDATE', 'DELETE', 'POST', 'VOID', 'IMPORT', 'EXPORT', 'GENERATE', 'SETUP_2FA', 'ENABLE_2FA', 'DISABLE_2FA'];
  entityTypes = ['JOURNAL_ENTRY', 'ACCOUNT', 'ORGANIZATION', 'CUSTOM_FIELD', 'USER', 'REPORT', 'SAMPLE_DATA'];

  constructor(
    private auditLogService: AuditLogService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Check if user is admin
    const currentUser = this.authService.getCurrentUser();
    if (currentUser?.role !== 'admin') {
      this.error = 'Access denied. Admin privileges required.';
      return;
    }

    this.loadStats();
    this.loadLogs();
  }

  loadStats(): void {
    this.auditLogService.getAuditStats().subscribe({
      next: (stats) => {
        this.stats = stats;
      },
      error: (err) => console.error('Failed to load audit stats:', err)
    });
  }

  loadLogs(): void {
    this.loading = true;
    this.error = null;

    const filters = {
      action: this.filterAction || undefined,
      entityType: this.filterEntityType || undefined,
      username: this.filterUsername || undefined,
      startDate: this.filterStartDate || undefined,
      endDate: this.filterEndDate || undefined,
      limit: this.pageSize,
      offset: (this.currentPage - 1) * this.pageSize,
      sortBy: 'timestamp',
      sortOrder: 'desc'
    };

    this.auditLogService.getAuditLogs(filters).subscribe({
      next: (response) => {
        this.logs = response.logs;
        this.totalCount = response.totalCount;
        this.totalPages = Math.ceil(this.totalCount / this.pageSize);
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load audit logs';
        this.loading = false;
        console.error(err);
      }
    });
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadLogs();
  }

  clearFilters(): void {
    this.filterAction = '';
    this.filterEntityType = '';
    this.filterUsername = '';
    this.filterStartDate = '';
    this.filterEndDate = '';
    this.currentPage = 1;
    this.loadLogs();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadLogs();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.goToPage(this.currentPage + 1);
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.goToPage(this.currentPage - 1);
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 7;
    
    if (this.totalPages <= maxPagesToShow) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      const start = Math.max(2, this.currentPage - 2);
      const end = Math.min(this.totalPages - 1, this.currentPage + 2);
      
      if (start > 2) pages.push(-1);
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      if (end < this.totalPages - 1) pages.push(-1);
      pages.push(this.totalPages);
    }
    
    return pages;
  }

  getDisplayRange(): string {
    if (this.totalCount === 0) return '0-0';
    const start = (this.currentPage - 1) * this.pageSize + 1;
    const end = Math.min(start + this.logs.length - 1, this.totalCount);
    return `${start}-${end}`;
  }

  getActionColor(action: string): string {
    const colors: { [key: string]: string } = {
      'LOGIN': 'blue',
      'LOGOUT': 'gray',
      'CREATE': 'green',
      'UPDATE': 'yellow',
      'DELETE': 'red',
      'POST': 'green',
      'VOID': 'red',
      'IMPORT': 'purple',
      'EXPORT': 'purple',
      'GENERATE': 'teal',
      'SETUP_2FA': 'blue',
      'ENABLE_2FA': 'green',
      'DISABLE_2FA': 'orange'
    };
    return colors[action] || 'gray';
  }

  exportLogs(): void {
    // Export current filtered logs as CSV
    const csvContent = this.generateCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `audit-logs-${new Date().toISOString()}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  generateCSV(): string {
    const headers = ['Timestamp', 'Username', 'Action', 'Entity Type', 'Description', 'IP Address'];
    const rows = this.logs.map(log => [
      new Date(log.timestamp).toISOString(),
      log.username,
      log.action,
      log.entityType,
      log.description,
      log.ipAddress || 'N/A'
    ]);

    return [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
  }

  viewDetails(log: AuditLog): void {
    // Show detailed log information in a modal or expand row
    console.log('Log details:', log);
  }

  getActiveUsersCount(): number {
    return this.stats ? Object.keys(this.stats.byUser).length : 0;
  }
}

