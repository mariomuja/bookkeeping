import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { 
  TrialBalanceItem, 
  BalanceSheetItem, 
  ProfitLossItem,
  DashboardMetrics 
} from '../models/report.model';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  constructor(private api: ApiService) {}

  getTrialBalance(organizationId: string, fiscalPeriodId?: string): Observable<TrialBalanceItem[]> {
    const path = fiscalPeriodId
      ? `/organizations/${organizationId}/reports/trial-balance?fiscalPeriodId=${fiscalPeriodId}`
      : `/organizations/${organizationId}/reports/trial-balance`;
    return this.api.get<TrialBalanceItem[]>(path);
  }

  getBalanceSheet(organizationId: string, fiscalPeriodId?: string): Observable<BalanceSheetItem[]> {
    const path = fiscalPeriodId
      ? `/organizations/${organizationId}/reports/balance-sheet?fiscalPeriodId=${fiscalPeriodId}`
      : `/organizations/${organizationId}/reports/balance-sheet`;
    return this.api.get<BalanceSheetItem[]>(path);
  }

  getProfitLoss(organizationId: string, fiscalPeriodId?: string): Observable<ProfitLossItem[]> {
    const path = fiscalPeriodId
      ? `/organizations/${organizationId}/reports/profit-loss?fiscalPeriodId=${fiscalPeriodId}`
      : `/organizations/${organizationId}/reports/profit-loss`;
    return this.api.get<ProfitLossItem[]>(path);
  }

  getDashboardMetrics(organizationId: string): Observable<DashboardMetrics> {
    return this.api.get<DashboardMetrics>(`/organizations/${organizationId}/dashboard`);
  }

  exportReport(organizationId: string, reportType: string, format: 'csv' | 'excel' | 'pdf'): Observable<Blob> {
    return this.api.get<Blob>(
      `/organizations/${organizationId}/reports/${reportType}/export?format=${format}`
    );
  }
}

