import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportService } from '../../services/report.service';
import { OrganizationService } from '../../services/organization.service';
import { TrialBalanceItem, BalanceSheetItem, ProfitLossItem } from '../../models/report.model';
import { LossTriangleComponent } from '../loss-triangle/loss-triangle.component';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, LossTriangleComponent],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit {
  activeReport: 'trial-balance' | 'balance-sheet' | 'profit-loss' | 'loss-triangle' = 'trial-balance';
  
  trialBalanceData: TrialBalanceItem[] = [];
  balanceSheetData: BalanceSheetItem[] = [];
  profitLossData: ProfitLossItem[] = [];
  
  loading = false;
  error: string | null = null;

  constructor(
    private reportService: ReportService,
    private organizationService: OrganizationService
  ) {}

  ngOnInit(): void {
    this.loadReport();
  }

  setActiveReport(report: 'trial-balance' | 'balance-sheet' | 'profit-loss' | 'loss-triangle'): void {
    this.activeReport = report;
    if (report !== 'loss-triangle') {
      this.loadReport();
    }
  }

  loadReport(): void {
    const org = this.organizationService.getCurrentOrganization();
    if (!org) {
      this.error = 'Please select an organization';
      return;
    }

    this.loading = true;
    this.error = null;

    switch (this.activeReport) {
      case 'trial-balance':
        this.loadTrialBalance(org.id);
        break;
      case 'balance-sheet':
        this.loadBalanceSheet(org.id);
        break;
      case 'profit-loss':
        this.loadProfitLoss(org.id);
        break;
    }
  }

  loadTrialBalance(orgId: string): void {
    this.reportService.getTrialBalance(orgId).subscribe({
      next: (data) => {
        this.trialBalanceData = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load trial balance';
        this.loading = false;
        console.error(err);
      }
    });
  }

  loadBalanceSheet(orgId: string): void {
    this.reportService.getBalanceSheet(orgId).subscribe({
      next: (data) => {
        this.balanceSheetData = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load balance sheet';
        this.loading = false;
        console.error(err);
      }
    });
  }

  loadProfitLoss(orgId: string): void {
    this.reportService.getProfitLoss(orgId).subscribe({
      next: (data) => {
        this.profitLossData = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load profit & loss';
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
    return this.trialBalanceData.reduce((sum, item) => sum + item.totalDebits, 0);
  }

  getTotalCredits(): number {
    return this.trialBalanceData.reduce((sum, item) => sum + item.totalCredits, 0);
  }

  getBalanceSheetTotal(category: 'ASSET' | 'LIABILITY' | 'EQUITY'): number {
    return this.balanceSheetData
      .filter(item => item.category === category)
      .reduce((sum, item) => sum + item.balance, 0);
  }

  getTotalRevenue(): number {
    return this.profitLossData
      .filter(item => item.category === 'REVENUE')
      .reduce((sum, item) => sum + item.amount, 0);
  }

  getTotalExpenses(): number {
    return this.profitLossData
      .filter(item => item.category === 'EXPENSE')
      .reduce((sum, item) => sum + item.amount, 0);
  }

  getNetIncome(): number {
    return this.getTotalRevenue() - this.getTotalExpenses();
  }

  groupByCategory(data: any[], categoryField: string = 'category'): any {
    const grouped: any = {};
    data.forEach(item => {
      const category = item[categoryField];
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(item);
    });
    return grouped;
  }

  getCurrentDate(): Date {
    return new Date();
  }

  getAssets(): BalanceSheetItem[] {
    return this.balanceSheetData.filter(i => i.category === 'ASSET');
  }

  getLiabilities(): BalanceSheetItem[] {
    return this.balanceSheetData.filter(i => i.category === 'LIABILITY');
  }

  getEquity(): BalanceSheetItem[] {
    return this.balanceSheetData.filter(i => i.category === 'EQUITY');
  }

  getRevenue(): ProfitLossItem[] {
    return this.profitLossData.filter(i => i.category === 'REVENUE');
  }

  getExpenses(): ProfitLossItem[] {
    return this.profitLossData.filter(i => i.category === 'EXPENSE');
  }

  exportReport(format: 'csv' | 'excel' | 'pdf'): void {
    const org = this.organizationService.getCurrentOrganization();
    if (!org) return;

    let reportType = '';
    switch (this.activeReport) {
      case 'trial-balance':
        reportType = 'trial-balance';
        break;
      case 'balance-sheet':
        reportType = 'balance-sheet';
        break;
      case 'profit-loss':
        reportType = 'profit-loss';
        break;
    }

    this.reportService.exportReport(org.id, reportType, format).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${reportType}-${new Date().toISOString()}.${format}`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        alert('Failed to export report');
        console.error(err);
      }
    });
  }
}

