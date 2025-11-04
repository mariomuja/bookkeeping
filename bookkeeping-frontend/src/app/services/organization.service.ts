import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Organization, FiscalPeriod } from '../models/organization.model';

@Injectable({
  providedIn: 'root'
})
export class OrganizationService {
  private currentOrganizationSubject = new BehaviorSubject<Organization | null>(null);
  public currentOrganization$ = this.currentOrganizationSubject.asObservable();

  constructor(private api: ApiService) {}

  getOrganizations(): Observable<Organization[]> {
    return this.api.get<Organization[]>('/organizations');
  }

  getOrganization(id: string): Observable<Organization> {
    return this.api.get<Organization>(`/organizations/${id}`);
  }

  createOrganization(data: Partial<Organization>): Observable<Organization> {
    return this.api.post<Organization>('/organizations', data);
  }

  updateOrganization(id: string, data: Partial<Organization>): Observable<Organization> {
    return this.api.put<Organization>(`/organizations/${id}`, data);
  }

  deleteOrganization(id: string): Observable<void> {
    return this.api.delete<void>(`/organizations/${id}`);
  }

  setCurrentOrganization(org: Organization): void {
    this.currentOrganizationSubject.next(org);
    localStorage.setItem('currentOrganization', JSON.stringify(org));
  }

  getCurrentOrganization(): Organization | null {
    if (!this.currentOrganizationSubject.value) {
      const stored = localStorage.getItem('currentOrganization');
      if (stored) {
        const org = JSON.parse(stored);
        this.currentOrganizationSubject.next(org);
        return org;
      }
    }
    return this.currentOrganizationSubject.value;
  }

  // Fiscal Periods
  getFiscalPeriods(organizationId: string): Observable<FiscalPeriod[]> {
    return this.api.get<FiscalPeriod[]>(`/organizations/${organizationId}/fiscal-periods`);
  }

  createFiscalPeriod(organizationId: string, data: Partial<FiscalPeriod>): Observable<FiscalPeriod> {
    return this.api.post<FiscalPeriod>(`/organizations/${organizationId}/fiscal-periods`, data);
  }

  closeFiscalPeriod(periodId: string, closedBy: string): Observable<FiscalPeriod> {
    return this.api.patch<FiscalPeriod>(`/fiscal-periods/${periodId}/close`, { closedBy });
  }
}

