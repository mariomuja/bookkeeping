import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AccountsComponent } from './components/accounts/accounts.component';
import { JournalEntriesComponent } from './components/journal-entries/journal-entries.component';
import { ReportsComponent } from './components/reports/reports.component';
import { ImportComponent } from './components/import/import.component';
import { CustomFieldsComponent } from './components/custom-fields/custom-fields.component';
import { LossTriangleComponent } from './components/loss-triangle/loss-triangle.component';
import { TrialBalanceViewerComponent } from './components/report-viewers/trial-balance-viewer.component';
import { LoginComponent } from './components/auth/login.component';
import { SettingsComponent } from './components/settings/settings.component';
import { AuditLogComponent } from './components/audit-log/audit-log.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'accounts', component: AccountsComponent, canActivate: [authGuard] },
  { path: 'journal-entries', component: JournalEntriesComponent, canActivate: [authGuard] },
  { path: 'reports', component: ReportsComponent, canActivate: [authGuard] },
  { path: 'report/trial-balance', component: TrialBalanceViewerComponent, canActivate: [authGuard] },
  { path: 'report/balance-sheet', component: TrialBalanceViewerComponent, canActivate: [authGuard] },
  { path: 'report/profit-loss', component: TrialBalanceViewerComponent, canActivate: [authGuard] },
  { path: 'report/loss-triangle', component: LossTriangleComponent, canActivate: [authGuard] },
  { path: 'import', component: ImportComponent, canActivate: [authGuard] },
  { path: 'custom-fields', component: CustomFieldsComponent, canActivate: [authGuard] },
  { path: 'audit-log', component: AuditLogComponent, canActivate: [authGuard] },
  { path: 'settings', component: SettingsComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '/dashboard' }
];
