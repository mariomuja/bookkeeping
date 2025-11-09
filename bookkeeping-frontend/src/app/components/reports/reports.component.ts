import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { OrganizationService } from '../../services/organization.service';
import { environment } from '../../../environments/environment';

interface ReportCard {
  id: string;
  title: string;
  description: string;
  icon: string;
  route: string;
  category: 'financial';
}

interface DatevValidation {
  valid: boolean;
  errors: any[];
  warnings: any[];
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent {
  private readonly apiUrl = environment.apiUrl || 'http://localhost:3000/api';
  
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

  // DATEV export properties
  datevFramework = 'SKR03';
  datevConsultantNumber = 1000;
  datevClientNumber = 10001;
  datevDateFrom: string = '';
  datevDateTo: string = '';
  datevValidation: DatevValidation | null = null;
  isExporting = false;

  constructor(
    private router: Router,
    private organizationService: OrganizationService,
    private http: HttpClient
  ) {
    // Set default date range (current year)
    const now = new Date();
    const yearStart = new Date(now.getFullYear(), 0, 1);
    this.datevDateFrom = yearStart.toISOString().split('T')[0];
    this.datevDateTo = now.toISOString().split('T')[0];
  }

  openReport(report: ReportCard): void {
    const org = this.organizationService.getCurrentOrganization();
    if (!org) {
      alert('Please select an organization first');
      return;
    }

    // Navigate within the same app (not in new tab)
    this.router.navigate([report.route], {
      queryParams: { orgId: org.id }
    });
  }

  getFinancialReports(): ReportCard[] {
    return this.reports.filter(r => r.category === 'financial');
  }

  // DATEV Export Functions

  validateDatevData(): void {
    const org = this.organizationService.getCurrentOrganization();
    if (!org) {
      alert('Bitte wählen Sie zuerst eine Organisation');
      return;
    }

    this.http.get<DatevValidation>(`${this.apiUrl}/organizations/${org.id}/datev/validate`)
      .subscribe({
        next: (validation) => {
          this.datevValidation = validation;
          if (validation.valid) {
            alert('✓ Alle Daten sind gültig und bereit für den Export');
          } else {
            alert(`⚠ ${validation.errors.length} Validierungsfehler gefunden`);
          }
        },
        error: (err) => {
          console.error('Validation error:', err);
          alert('Fehler bei der Validierung');
        }
      });
  }

  exportToDatev(): void {
    const org = this.organizationService.getCurrentOrganization();
    if (!org) {
      alert('Bitte wählen Sie zuerst eine Organisation');
      return;
    }

    if (!confirm(`DATEV Export starten?\n\nKontenrahmen: ${this.datevFramework}\nZeitraum: ${this.datevDateFrom} bis ${this.datevDateTo}`)) {
      return;
    }

    this.isExporting = true;

    const params = new URLSearchParams({
      framework: this.datevFramework,
      consultantNumber: this.datevConsultantNumber.toString(),
      clientNumber: this.datevClientNumber.toString(),
      dateFrom: this.datevDateFrom,
      dateTo: this.datevDateTo,
      exportType: 'TRANSACTIONS'
    });

    // Download file
    const url = `${this.apiUrl}/organizations/${org.id}/datev/export?${params.toString()}`;
    
    fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error('Export failed');
        }
        return response.blob();
      })
      .then(blob => {
        // Create download link
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        
        // Get filename from response header or use default
        const filename = `DATEV_Export_${new Date().toISOString().split('T')[0]}.csv`;
        link.download = filename;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
        
        this.isExporting = false;
        alert('✓ DATEV Export erfolgreich heruntergeladen');
      })
      .catch(error => {
        console.error('Export error:', error);
        this.isExporting = false;
        alert('❌ Fehler beim DATEV Export');
      });
  }
}

