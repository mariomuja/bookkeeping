import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { LossTriangle, ReserveEstimate } from '../models/loss-triangle.model';

@Injectable({
  providedIn: 'root'
})
export class LossTriangleService {
  constructor(private api: ApiService) {}

  getLossTriangle(
    organizationId: string,
    options: {
      triangleType: 'PAID' | 'INCURRED';
      policyType?: string;
      developmentPeriods?: number;
    }
  ): Observable<LossTriangle> {
    const params = new URLSearchParams();
    params.append('triangleType', options.triangleType);
    if (options.policyType) params.append('policyType', options.policyType);
    if (options.developmentPeriods) params.append('developmentPeriods', options.developmentPeriods.toString());
    
    return this.api.get<LossTriangle>(
      `/organizations/${organizationId}/actuarial/loss-triangle`,
      params as any
    );
  }

  getReserveEstimates(organizationId: string, policyType?: string): Observable<ReserveEstimate[]> {
    const params = policyType ? new URLSearchParams({ policyType }) : undefined;
    return this.api.get<ReserveEstimate[]>(
      `/organizations/${organizationId}/actuarial/reserves`,
      params as any
    );
  }

  getDevelopmentFactors(
    organizationId: string,
    method: 'SIMPLE' | 'WEIGHTED' | 'GEOMETRIC' = 'WEIGHTED'
  ): Observable<any> {
    return this.api.get<any>(
      `/organizations/${organizationId}/actuarial/development-factors?method=${method}`
    );
  }

  exportTrianglePDF(organizationId: string, triangleType: string, policyType?: string): Observable<Blob> {
    const params = new URLSearchParams({ triangleType });
    if (policyType) params.append('policyType', policyType);
    
    return this.api.get<Blob>(
      `/organizations/${organizationId}/actuarial/loss-triangle/export-pdf`,
      params as any
    );
  }
}

