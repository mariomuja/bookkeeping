import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { OrganizationService } from '../../services/organization.service';
import { environment } from '../../../environments/environment';

interface Employee {
  id: string;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  position: string;
  department: string;
  grossSalaryMonthly: number;
  taxClass: number;
  isActive: boolean;
}

interface PayrollRun {
  id: string;
  periodStart: Date;
  periodEnd: Date;
  employeeCount: number;
  totalGross: number;
  totalNet: number;
  totalTax: number;
  status: string;
  payslips: any[];
}

@Component({
  selector: 'app-payroll',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payroll.component.html',
  styleUrls: ['./payroll.component.css']
})
export class PayrollComponent implements OnInit {
  private readonly apiUrl = environment.apiUrl || 'http://localhost:3000/api';
  
  employees: Employee[] = [];
  payrollRuns: PayrollRun[] = [];
  selectedTab: 'employees' | 'payroll' = 'employees';
  loading = false;
  
  // Employee form
  showEmployeeModal = false;
  editingEmployee: Employee | null = null;
  employeeForm: any = {
    employeeNumber: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    hireDate: new Date().toISOString().split('T')[0],
    position: '',
    department: '',
    grossSalaryMonthly: 0,
    taxClass: 1,
    taxId: '',
    socialSecurityNumber: '',
    iban: '',
    churchTax: false,
    childAllowances: 0
  };
  
  // Payroll run form
  payrollPeriodStart: string = '';
  payrollPeriodEnd: string = '';

  constructor(
    private http: HttpClient,
    private organizationService: OrganizationService
  ) {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    this.payrollPeriodStart = monthStart.toISOString().split('T')[0];
    this.payrollPeriodEnd = monthEnd.toISOString().split('T')[0];
  }

  ngOnInit(): void {
    this.loadEmployees();
    this.loadPayrollRuns();
  }

  loadEmployees(): void {
    const org = this.organizationService.getCurrentOrganization();
    if (!org) return;

    this.loading = true;
    this.http.get<Employee[]>(`${this.apiUrl}/organizations/${org.id}/employees`)
      .subscribe({
        next: (employees) => {
          this.employees = employees;
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading employees:', err);
          this.loading = false;
        }
      });
  }

  loadPayrollRuns(): void {
    const org = this.organizationService.getCurrentOrganization();
    if (!org) return;

    this.http.get<PayrollRun[]>(`${this.apiUrl}/organizations/${org.id}/payroll/runs`)
      .subscribe({
        next: (runs) => {
          this.payrollRuns = runs;
        },
        error: (err) => {
          console.error('Error loading payroll runs:', err);
        }
      });
  }

  openCreateEmployee(): void {
    this.editingEmployee = null;
    this.resetEmployeeForm();
    this.showEmployeeModal = true;
  }

  openEditEmployee(employee: Employee): void {
    this.editingEmployee = employee;
    this.employeeForm = { ...employee };
    this.showEmployeeModal = true;
  }

  closeEmployeeModal(): void {
    this.showEmployeeModal = false;
    this.resetEmployeeForm();
  }

  resetEmployeeForm(): void {
    this.employeeForm = {
      employeeNumber: '',
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      hireDate: new Date().toISOString().split('T')[0],
      position: '',
      department: '',
      grossSalaryMonthly: 0,
      taxClass: 1,
      taxId: '',
      socialSecurityNumber: '',
      iban: '',
      churchTax: false,
      childAllowances: 0
    };
  }

  saveEmployee(): void {
    const org = this.organizationService.getCurrentOrganization();
    if (!org) return;

    if (this.editingEmployee) {
      // Update
      this.http.put(`${this.apiUrl}/employees/${this.editingEmployee.id}`, this.employeeForm)
        .subscribe({
          next: () => {
            this.loadEmployees();
            this.closeEmployeeModal();
          },
          error: (err) => {
            alert('Fehler beim Aktualisieren des Mitarbeiters');
            console.error(err);
          }
        });
    } else {
      // Create
      this.http.post(`${this.apiUrl}/organizations/${org.id}/employees`, this.employeeForm)
        .subscribe({
          next: () => {
            this.loadEmployees();
            this.closeEmployeeModal();
          },
          error: (err) => {
            alert('Fehler beim Erstellen des Mitarbeiters');
            console.error(err);
          }
        });
    }
  }

  deleteEmployee(employee: Employee): void {
    if (!confirm(`Mitarbeiter ${employee.firstName} ${employee.lastName} wirklich löschen?`)) {
      return;
    }

    this.http.delete(`${this.apiUrl}/employees/${employee.id}`)
      .subscribe({
        next: () => {
          this.loadEmployees();
        },
        error: (err) => {
          alert('Fehler beim Löschen');
          console.error(err);
        }
      });
  }

  runPayroll(): void {
    const org = this.organizationService.getCurrentOrganization();
    if (!org) return;

    if (!confirm(`Lohnlauf für Zeitraum ${this.payrollPeriodStart} bis ${this.payrollPeriodEnd} starten?`)) {
      return;
    }

    this.loading = true;
    this.http.post(`${this.apiUrl}/organizations/${org.id}/payroll/run`, {
      periodStart: this.payrollPeriodStart,
      periodEnd: this.payrollPeriodEnd
    }).subscribe({
      next: () => {
        alert('✓ Lohnlauf erfolgreich erstellt');
        this.loadPayrollRuns();
        this.loading = false;
      },
      error: (err) => {
        alert('❌ Fehler beim Lohnlauf');
        console.error(err);
        this.loading = false;
      }
    });
  }

  postPayrollRun(run: PayrollRun): void {
    if (!confirm(`Lohnlauf buchen? Dies erstellt Journaleinträge für ${run.employeeCount} Mitarbeiter.`)) {
      return;
    }

    this.http.post(`${this.apiUrl}/payroll/runs/${run.id}/post`, {})
      .subscribe({
        next: () => {
          alert('✓ Lohnlauf gebucht');
          this.loadPayrollRuns();
        },
        error: (err) => {
          alert('❌ Fehler beim Buchen');
          console.error(err);
        }
      });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('de-DE');
  }
}

