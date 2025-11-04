import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ReportService } from '../../services/report.service';
import { TrialBalanceItem } from '../../models/report.model';

@Component({
  selector: 'app-trial-balance-viewer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="report-viewer">
      <div class="report-header">
        <div>
          <h1>Trial Balance</h1>
          <p class="report-date">As of {{ getCurrentDate() | date:'mediumDate' }}</p>
        </div>
        <div class="action-buttons">
          <button class="btn-export" (click)="exportReport('csv')">Export CSV</button>
          <button class="btn-export" (click)="exportReport('pdf')">Export PDF</button>
          <button class="btn-print" (click)="printReport()">Print</button>
        </div>
      </div>

      <div *ngIf="loading" class="loading">
        <div class="spinner"></div>
        <p>Loading report...</p>
      </div>

      <div *ngIf="error" class="error-message">{{ error }}</div>

      <div *ngIf="!loading && !error" class="report-content" id="reportContent">
        <table class="report-table">
          <thead>
            <tr>
              <th>Account Number</th>
              <th>Account Name</th>
              <th>Category</th>
              <th class="text-right">Debits</th>
              <th class="text-right">Credits</th>
              <th class="text-right">Balance</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of data">
              <td class="account-number">{{ item.accountNumber }}</td>
              <td>{{ item.accountName }}</td>
              <td><span class="category-badge">{{ item.accountCategory }}</span></td>
              <td class="text-right">{{ formatCurrency(item.totalDebits) }}</td>
              <td class="text-right">{{ formatCurrency(item.totalCredits) }}</td>
              <td class="text-right font-bold">{{ formatCurrency(item.balance) }}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="total-row">
              <td colspan="3"><strong>Total</strong></td>
              <td class="text-right"><strong>{{ formatCurrency(getTotalDebits()) }}</strong></td>
              <td class="text-right"><strong>{{ formatCurrency(getTotalCredits()) }}</strong></td>
              <td class="text-right"><strong>{{ formatCurrency(getTotalDebits() - getTotalCredits()) }}</strong></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .report-viewer {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
      background: white;
      min-height: 100vh;
    }

    .report-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 2px solid #e5e7eb;
    }

    .report-header h1 {
      font-size: 2rem;
      font-weight: 700;
      color: #1f2937;
      margin-bottom: 0.5rem;
    }

    .report-date {
      color: #6b7280;
      font-size: 1rem;
    }

    .action-buttons {
      display: flex;
      gap: 0.75rem;
    }

    .btn-export, .btn-print {
      padding: 0.75rem 1.25rem;
      background: white;
      border: 1px solid #d1d5db;
      border-radius: 0.5rem;
      color: #1f2937;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-export:hover, .btn-print:hover {
      background: #3b82f6;
      border-color: #3b82f6;
      color: white;
    }

    .report-content {
      background: white;
      border-radius: 0.5rem;
      overflow: hidden;
    }

    .report-table {
      width: 100%;
      border-collapse: collapse;
    }

    .report-table thead {
      background: #f9fafb;
    }

    .report-table th {
      padding: 1rem;
      text-align: left;
      font-weight: 600;
      color: #374151;
      border-bottom: 2px solid #e5e7eb;
    }

    .report-table td {
      padding: 0.75rem 1rem;
      border-bottom: 1px solid #f3f4f6;
    }

    .report-table tbody tr:hover {
      background: #f9fafb;
    }

    .text-right {
      text-align: right !important;
    }

    .font-bold {
      font-weight: 600;
    }

    .account-number {
      color: #6b7280;
      font-family: monospace;
    }

    .category-badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      background: #e0e7ff;
      color: #3730a3;
      border-radius: 9999px;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .total-row {
      background: #f9fafb;
      font-weight: 600;
    }

    .total-row td {
      padding: 1rem;
      border-top: 2px solid #d1d5db;
    }

    .loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem;
      color: #6b7280;
    }

    .spinner {
      width: 50px;
      height: 50px;
      border: 3px solid #e5e7eb;
      border-top-color: #3b82f6;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 1rem;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    .error-message {
      padding: 1rem;
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 0.5rem;
      color: #dc2626;
      margin-bottom: 1rem;
    }

    @media print {
      .report-header .action-buttons {
        display: none;
      }
    }
  `]
})
export class TrialBalanceViewerComponent implements OnInit {
  data: TrialBalanceItem[] = [];
  loading = false;
  error: string | null = null;
  orgId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private reportService: ReportService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.orgId = params['orgId'];
      if (this.orgId) {
        this.loadReport();
      } else {
        this.error = 'Organization ID not provided';
      }
    });
  }

  loadReport(): void {
    if (!this.orgId) return;

    this.loading = true;
    this.error = null;

    this.reportService.getTrialBalance(this.orgId).subscribe({
      next: (data) => {
        this.data = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load trial balance';
        this.loading = false;
        console.error(err);
      }
    });
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  }

  getTotalDebits(): number {
    return this.data.reduce((sum, item) => sum + item.totalDebits, 0);
  }

  getTotalCredits(): number {
    return this.data.reduce((sum, item) => sum + item.totalCredits, 0);
  }

  getCurrentDate(): Date {
    return new Date();
  }

  exportReport(format: 'csv' | 'pdf'): void {
    if (!this.orgId) return;

    this.reportService.exportReport(this.orgId, 'trial-balance', format).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `trial-balance-${new Date().toISOString()}.${format}`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        alert('Failed to export report');
        console.error(err);
      }
    });
  }

  printReport(): void {
    window.print();
  }
}

