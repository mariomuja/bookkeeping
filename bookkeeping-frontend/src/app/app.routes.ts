import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AccountsComponent } from './components/accounts/accounts.component';
import { JournalEntriesComponent } from './components/journal-entries/journal-entries.component';
import { ReportsComponent } from './components/reports/reports.component';
import { ImportComponent } from './components/import/import.component';
import { CustomFieldsComponent } from './components/custom-fields/custom-fields.component';
import { LossTriangleComponent } from './components/loss-triangle/loss-triangle.component';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'accounts', component: AccountsComponent },
  { path: 'journal-entries', component: JournalEntriesComponent },
  { path: 'reports', component: ReportsComponent },
  { path: 'loss-triangle', redirectTo: '/reports', pathMatch: 'full' },
  { path: 'import', component: ImportComponent },
  { path: 'custom-fields', component: CustomFieldsComponent },
  { path: '**', redirectTo: '/dashboard' }
];
