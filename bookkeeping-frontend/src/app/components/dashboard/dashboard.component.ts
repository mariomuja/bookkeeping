import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportService } from '../../services/report.service';
import { OrganizationService } from '../../services/organization.service';
import { DashboardMetrics } from '../../models/report.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  metrics: DashboardMetrics | null = null;
  loading = true;
  error: string | null = null;

  constructor(
    private reportService: ReportService,
    private organizationService: OrganizationService
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    const org = this.organizationService.getCurrentOrganization();
    if (!org) {
      this.error = 'Please select an organization';
      this.loading = false;
      return;
    }

    this.reportService.getDashboardMetrics(org.id).subscribe({
      next: (metrics) => {
        this.metrics = metrics;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load dashboard metrics';
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

  getMetricCards() {
    if (!this.metrics) return [];
    
    return [
      {
        title: 'Total Assets',
        value: this.metrics.totalAssets,
        icon: 'trending-up',
        color: 'blue',
        change: '+12.5%'
      },
      {
        title: 'Total Liabilities',
        value: this.metrics.totalLiabilities,
        icon: 'trending-down',
        color: 'red',
        change: '-3.2%'
      },
      {
        title: 'Total Equity',
        value: this.metrics.totalEquity,
        icon: 'dollar',
        color: 'green',
        change: '+8.1%'
      },
      {
        title: 'Net Income',
        value: this.metrics.netIncome,
        icon: 'chart',
        color: 'purple',
        change: '+15.3%'
      }
    ];
  }

  getActivityItems() {
    return [
      {
        title: 'Total Journal Entries',
        value: this.metrics?.entryCount || 0,
        icon: 'file-text'
      },
      {
        title: 'Active Accounts',
        value: this.metrics?.accountCount || 0,
        icon: 'book-open'
      },
      {
        title: 'Revenue (YTD)',
        value: this.formatCurrency(this.metrics?.totalRevenue || 0),
        icon: 'arrow-up'
      },
      {
        title: 'Expenses (YTD)',
        value: this.formatCurrency(this.metrics?.totalExpenses || 0),
        icon: 'arrow-down'
      }
    ];
  }
}

