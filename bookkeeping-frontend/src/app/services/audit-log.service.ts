import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface AuditLog {
  id: string;
  userId: string;
  username: string;
  action: string;
  entityType: string;
  entityId: string;
  description: string;
  changes: any;
  metadata: any;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  createdAt: Date;
}

export interface AuditLogResponse {
  logs: AuditLog[];
  totalCount: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface AuditStats {
  totalLogs: number;
  last24Hours: number;
  last7Days: number;
  byAction: { [key: string]: number };
  byEntityType: { [key: string]: number };
  byUser: { [key: string]: number };
}

@Injectable({
  providedIn: 'root'
})
export class AuditLogService {
  constructor(private api: ApiService) {}

  getAuditLogs(filters: any = {}): Observable<AuditLogResponse> {
    const params = new URLSearchParams();
    
    if (filters.userId) params.append('userId', filters.userId);
    if (filters.username) params.append('username', filters.username);
    if (filters.action) params.append('action', filters.action);
    if (filters.entityType) params.append('entityType', filters.entityType);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.offset) params.append('offset', filters.offset.toString());
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

    const queryString = params.toString();
    const path = queryString ? `/audit-logs?${queryString}` : '/audit-logs';
    
    return this.api.get<AuditLogResponse>(path);
  }

  getAuditStats(): Observable<AuditStats> {
    return this.api.get<AuditStats>('/audit-logs/stats');
  }
}

