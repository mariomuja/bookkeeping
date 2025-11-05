import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Account, AccountType, AccountBalance } from '../models/account.model';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  constructor(private api: ApiService) {}

  getAccountTypes(): Observable<AccountType[]> {
    return this.api.get<AccountType[]>('/account-types');
  }

  getAccounts(organizationId: string): Observable<Account[]> {
    return this.api.get<Account[]>(`/organizations/${organizationId}/accounts`);
  }

  getAccount(id: string): Observable<Account> {
    return this.api.get<Account>(`/accounts/${id}`);
  }

  createAccount(organizationId: string, data: Partial<Account>): Observable<Account> {
    return this.api.post<Account>(`/organizations/${organizationId}/accounts`, data);
  }

  updateAccount(id: string, data: Partial<Account>): Observable<Account> {
    return this.api.put<Account>(`/accounts/${id}`, data);
  }

  deleteAccount(id: string): Observable<void> {
    return this.api.delete<void>(`/accounts/${id}`);
  }

  getAccountBalances(accountId: string, fiscalPeriodId?: string): Observable<AccountBalance[]> {
    const path = fiscalPeriodId 
      ? `/accounts/${accountId}/balances?fiscalPeriodId=${fiscalPeriodId}`
      : `/accounts/${accountId}/balances`;
    return this.api.get<AccountBalance[]>(path);
  }

  calculateBalance(accountId: string, startDate: string, endDate: string): Observable<AccountBalance> {
    return this.api.get<AccountBalance>(`/accounts/${accountId}/calculate-balance`, 
      new URLSearchParams({ startDate, endDate }) as any);
  }

  // Account Framework methods
  getAccountFrameworks(): Observable<any[]> {
    return this.api.get<any[]>('/account-frameworks');
  }

  getAccountFramework(frameworkId: string): Observable<any> {
    return this.api.get<any>(`/account-frameworks/${frameworkId}`);
  }

  getFrameworkAccounts(frameworkId: string): Observable<any[]> {
    return this.api.get<any[]>(`/account-frameworks/${frameworkId}/accounts`);
  }

  importFrameworkAccounts(organizationId: string, frameworkId: string, accountNumbers: string[]): Observable<any> {
    return this.api.post<any>(`/organizations/${organizationId}/accounts/import-framework`, {
      frameworkId,
      accountNumbers: accountNumbers.length > 0 ? accountNumbers : undefined
    });
  }
}

