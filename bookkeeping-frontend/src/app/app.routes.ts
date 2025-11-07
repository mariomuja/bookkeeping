import { Routes } from '@angular/router';
import { StartupComponent } from './components/startup/startup.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AccountsComponent } from './components/accounts/accounts.component';
import { JournalEntriesComponent } from './components/journal-entries/journal-entries.component';
import { ReportsComponent } from './components/reports/reports.component';
import { ImportComponent } from './components/import/import.component';
import { CustomFieldsComponent } from './components/custom-fields/custom-fields.component';
import { TrialBalanceViewerComponent } from './components/report-viewers/trial-balance-viewer.component';
import { LoginSimpleComponent } from './components/auth/login-simple.component';
import { SettingsComponent } from './components/settings/settings.component';
import { AuditLogComponent } from './components/audit-log/audit-log.component';
import { authGuardSimple } from './guards/auth-simple.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'startup', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginSimpleComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuardSimple] },
  { path: 'accounts', component: AccountsComponent, canActivate: [authGuardSimple] },
  { path: 'journal-entries', component: JournalEntriesComponent, canActivate: [authGuardSimple] },
  { path: 'reports', component: ReportsComponent, canActivate: [authGuardSimple] },
  { path: 'report/trial-balance', component: TrialBalanceViewerComponent, canActivate: [authGuardSimple] },
  { path: 'report/balance-sheet', component: TrialBalanceViewerComponent, canActivate: [authGuardSimple] },
  { path: 'report/profit-loss', component: TrialBalanceViewerComponent, canActivate: [authGuardSimple] },
  { path: 'import', component: ImportComponent, canActivate: [authGuardSimple] },
  { path: 'custom-fields', component: CustomFieldsComponent, canActivate: [authGuardSimple] },
  { path: 'audit-log', component: AuditLogComponent, canActivate: [authGuardSimple] },
  { path: 'settings', component: SettingsComponent, canActivate: [authGuardSimple] },
  { path: '**', redirectTo: '/startup' }
];
