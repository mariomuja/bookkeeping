import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { OrganizationService } from '../../services/organization.service';

interface ReportCard {
  id: string;
  title: string;
  description: string;
  icon: string;
  route: string;
  category: 'financial';
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent {
  reports: ReportCard[] = [
    {
      id: 'trial-balance',
      title: 'Trial Balance',
      description: 'View all account balances with debits and credits',
      icon: 'balance',
      route: '/report/trial-balance',
      category: 'financial'
    },
    {
      id: 'balance-sheet',
      title: 'Balance Sheet',
      description: 'Assets, Liabilities, and Equity summary',
      icon: 'sheet',
      route: '/report/balance-sheet',
      category: 'financial'
    },
    {
      id: 'profit-loss',
      title: 'Profit & Loss',
      description: 'Revenue and expenses for the period',
      icon: 'chart',
      route: '/report/profit-loss',
      category: 'financial'
    }
  ];

  constructor(
    private router: Router,
    private organizationService: OrganizationService
  ) {}

  openReport(report: ReportCard): void {
    const org = this.organizationService.getCurrentOrganization();
    if (!org) {
      alert('Please select an organization first');
      return;
    }

    // Open report in new browser tab
    const url = this.router.serializeUrl(
      this.router.createUrlTree([report.route], {
        queryParams: { orgId: org.id }
      })
    );
    window.open(url, '_blank');
  }

  getFinancialReports(): ReportCard[] {
    return this.reports.filter(r => r.category === 'financial');
  }
}

