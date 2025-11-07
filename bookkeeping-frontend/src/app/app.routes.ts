import { Routes } from '@angular/router';
import { StartupSimpleComponent } from './components/startup/startup-simple.component';
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
import { AuthGuardSimple } from './guards/auth-simple.guard';

export const routes: Routes = [
  { path: '', component: StartupSimpleComponent },
  { path: 'startup', component: StartupSimpleComponent },
  { path: 'login', component: LoginSimpleComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuardSimple] },
  { path: 'accounts', component: AccountsComponent, canActivate: [AuthGuardSimple] },
  { path: 'journal-entries', component: JournalEntriesComponent, canActivate: [AuthGuardSimple] },
  { path: 'reports', component: ReportsComponent, canActivate: [AuthGuardSimple] },
  { path: 'report/trial-balance', component: TrialBalanceViewerComponent, canActivate: [AuthGuardSimple] },
  { path: 'report/balance-sheet', component: TrialBalanceViewerComponent, canActivate: [AuthGuardSimple] },
  { path: 'report/profit-loss', component: TrialBalanceViewerComponent, canActivate: [AuthGuardSimple] },
  { path: 'import', component: ImportComponent, canActivate: [AuthGuardSimple] },
  { path: 'custom-fields', component: CustomFieldsComponent, canActivate: [AuthGuardSimple] },
  { path: 'audit-log', component: AuditLogComponent, canActivate: [AuthGuardSimple] },
  { path: 'settings', component: SettingsComponent, canActivate: [AuthGuardSimple] },
  { path: '**', redirectTo: '/startup' }
];
