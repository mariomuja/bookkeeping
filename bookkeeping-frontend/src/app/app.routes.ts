import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AccountsComponent } from './components/accounts/accounts.component';
import { JournalEntriesComponent } from './components/journal-entries/journal-entries.component';
import { ReportsComponent } from './components/reports/reports.component';
import { ImportComponent } from './components/import/import.component';
import { CustomFieldsComponent } from './components/custom-fields/custom-fields.component';
import { LossTriangleComponent } from './components/loss-triangle/loss-triangle.component';
import { TrialBalanceViewerComponent } from './components/report-viewers/trial-balance-viewer.component';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'accounts', component: AccountsComponent },
  { path: 'journal-entries', component: JournalEntriesComponent },
  { path: 'reports', component: ReportsComponent },
  { path: 'report/trial-balance', component: TrialBalanceViewerComponent },
  { path: 'report/balance-sheet', component: TrialBalanceViewerComponent }, // Placeholder
  { path: 'report/profit-loss', component: TrialBalanceViewerComponent }, // Placeholder
  { path: 'report/loss-triangle', component: LossTriangleComponent },
  { path: 'import', component: ImportComponent },
  { path: 'custom-fields', component: CustomFieldsComponent },
  { path: '**', redirectTo: '/dashboard' }
];
