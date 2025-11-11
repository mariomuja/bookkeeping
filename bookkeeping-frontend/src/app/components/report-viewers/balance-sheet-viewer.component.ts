import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ReportService } from '../../services/report.service';
import { BalanceSheetItem } from '../../models/report.model';

@Component({
  selector: 'app-balance-sheet-viewer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="report-viewer">
      <div class="report-header">
        <div>
          <h1>Balance Sheet</h1>
          <p class="report-date">As of {{ getCurrentDate() | date:'mediumDate' }}</p>
        </div>
        <div class="action-buttons">
          <button class="btn-print" (click)="printReport()">Print</button>
        </div>
      </div>

      <div *ngIf="loading" class="loading">
        <div class="spinner"></div>
        <p>Loading report...</p>
      </div>

      <div *ngIf="error" class="error-message">{{ error }}</div>

      <div *ngIf="!loading && !error" class="report-content" id="reportContent">
        <!-- Assets -->
        <div class="section">
          <h2 class="section-title">ASSETS</h2>
          <table class="report-table">
            <thead>
              <tr>
                <th>Account Number</th>
                <th>Account Name</th>
                <th>Type</th>
                <th class="text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of getAssets()">
                <td class="account-number">{{ item.accountNumber }}</td>
                <td>{{ item.accountName }}</td>
                <td>{{ item.accountTypeName }}</td>
                <td class="text-right">{{ formatCurrency(item.balance) }}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="total-row">
                <td colspan="3"><strong>Total Assets</strong></td>
                <td class="text-right"><strong>{{ formatCurrency(getTotal('Asset')) }}</strong></td>
              </tr>
            </tfoot>
          </table>
        </div>

        <!-- Liabilities -->
        <div class="section">
          <h2 class="section-title">LIABILITIES</h2>
          <table class="report-table">
            <thead>
              <tr>
                <th>Account Number</th>
                <th>Account Name</th>
                <th>Type</th>
                <th class="text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of getLiabilities()">
                <td class="account-number">{{ item.accountNumber }}</td>
                <td>{{ item.accountName }}</td>
                <td>{{ item.accountTypeName }}</td>
                <td class="text-right">{{ formatCurrency(item.balance) }}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="total-row">
                <td colspan="3"><strong>Total Liabilities</strong></td>
                <td class="text-right"><strong>{{ formatCurrency(getTotal('Liability')) }}</strong></td>
              </tr>
            </tfoot>
          </table>
        </div>

        <!-- Equity -->
        <div class="section">
          <h2 class="section-title">EQUITY</h2>
          <table class="report-table">
            <thead>
              <tr>
                <th>Account Number</th>
                <th>Account Name</th>
                <th>Type</th>
                <th class="text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of getEquity()">
                <td class="account-number">{{ item.accountNumber }}</td>
                <td>{{ item.accountName }}</td>
                <td>{{ item.accountTypeName }}</td>
                <td class="text-right">{{ formatCurrency(item.balance) }}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="total-row">
                <td colspan="3"><strong>Total Equity</strong></td>
                <td class="text-right"><strong>{{ formatCurrency(getTotal('Equity')) }}</strong></td>
              </tr>
            </tfoot>
          </table>
        </div>
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

    .section {
      margin-bottom: 3rem;
    }

    .section-title {
      font-size: 1.5rem;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 1rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid #e5e7eb;
    }

    .loading {
      text-align: center;
      padding: 3rem;
    }

    .spinner {
      border: 3px solid #f3f4f6;
      border-top: 3px solid #3b82f6;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .error-message {
      background: #fee;
      color: #c00;
      padding: 1rem;
      border-radius: 0.5rem;
      margin: 2rem 0;
    }

    .report-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 2rem;
    }

    .report-table th {
      background: #f9fafb;
      padding: 0.75rem 1rem;
      text-align: left;
      font-weight: 600;
      color: #374151;
      border-bottom: 2px solid #e5e7eb;
    }

    .report-table td {
      padding: 0.75rem 1rem;
      border-bottom: 1px solid #e5e7eb;
      color: #6b7280;
    }

    .text-right {
      text-align: right;
    }

    .total-row {
      background: #f3f4f6;
      font-weight: 600;
    }

    .total-row td {
      border-top: 2px solid #1f2937;
      border-bottom: 3px double #1f2937;
    }

    .btn-print {
      padding: 0.5rem 1rem;
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 0.375rem;
      cursor: pointer;
      font-weight: 500;
    }

    .btn-print:hover {
      background: #2563eb;
    }

    @media print {
      .action-buttons {
        display: none;
      }
    }
  `]
})
export class BalanceSheetViewerComponent implements OnInit {
  data: BalanceSheetItem[] = [];
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

    this.reportService.getBalanceSheet(this.orgId).subscribe({
      next: (data) => {
        this.data = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load balance sheet';
        this.loading = false;
        console.error(err);
      }
    });
  }

  getAssets(): BalanceSheetItem[] {
    return this.data.filter(item => item.category === 'Asset');
  }

  getLiabilities(): BalanceSheetItem[] {
    return this.data.filter(item => item.category === 'Liability');
  }

  getEquity(): BalanceSheetItem[] {
    return this.data.filter(item => item.category === 'Equity');
  }

  getTotal(category: string): number {
    return this.data
      .filter(item => item.category === category)
      .reduce((sum, item) => sum + item.balance, 0);
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  }

  getCurrentDate(): Date {
    return new Date();
  }

  printReport(): void {
    window.print();
  }
}



