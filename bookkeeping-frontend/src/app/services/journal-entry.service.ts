import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { JournalEntry, CreateJournalEntryRequest } from '../models/journal-entry.model';

@Injectable({
  providedIn: 'root'
})
export class JournalEntryService {
  constructor(private api: ApiService) {}

  getJournalEntries(organizationId: string, filters?: {
    startDate?: string;
    endDate?: string;
    status?: string;
    fiscalPeriodId?: string;
  }): Observable<JournalEntry[]> {
    let params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
    }
    return this.api.get<JournalEntry[]>(`/organizations/${organizationId}/journal-entries`, params as any);
  }

  getJournalEntry(id: string): Observable<JournalEntry> {
    return this.api.get<JournalEntry>(`/journal-entries/${id}`);
  }

  createJournalEntry(organizationId: string, data: CreateJournalEntryRequest): Observable<JournalEntry> {
    return this.api.post<JournalEntry>(`/organizations/${organizationId}/journal-entries`, data);
  }

  updateJournalEntry(id: string, data: Partial<JournalEntry>): Observable<JournalEntry> {
    return this.api.put<JournalEntry>(`/journal-entries/${id}`, data);
  }

  deleteJournalEntry(id: string): Observable<void> {
    return this.api.delete<void>(`/journal-entries/${id}`);
  }

  postJournalEntry(id: string, postedBy: string): Observable<JournalEntry> {
    return this.api.post<JournalEntry>(`/journal-entries/${id}/post`, { postedBy });
  }

  voidJournalEntry(id: string, voidReason: string, voidedBy: string): Observable<JournalEntry> {
    return this.api.post<JournalEntry>(`/journal-entries/${id}/void`, { voidReason, voidedBy });
  }

  validateBalance(id: string): Observable<{ isBalanced: boolean; debitTotal: number; creditTotal: number }> {
    return this.api.get<{ isBalanced: boolean; debitTotal: number; creditTotal: number }>(
      `/journal-entries/${id}/validate`
    );
  }
}

