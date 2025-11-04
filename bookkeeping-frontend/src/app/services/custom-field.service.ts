import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { CustomFieldDefinition, CreateCustomFieldDefinitionRequest, PolicySummary, ClaimSummary } from '../models/custom-field.model';

@Injectable({
  providedIn: 'root'
})
export class CustomFieldService {
  constructor(private api: ApiService) {}

  // Custom Field Definitions
  getCustomFieldDefinitions(organizationId: string): Observable<CustomFieldDefinition[]> {
    return this.api.get<CustomFieldDefinition[]>(`/organizations/${organizationId}/custom-fields`);
  }

  getCustomFieldDefinition(id: string): Observable<CustomFieldDefinition> {
    return this.api.get<CustomFieldDefinition>(`/custom-fields/${id}`);
  }

  createCustomFieldDefinition(
    organizationId: string, 
    data: CreateCustomFieldDefinitionRequest
  ): Observable<CustomFieldDefinition> {
    return this.api.post<CustomFieldDefinition>(`/organizations/${organizationId}/custom-fields`, data);
  }

  updateCustomFieldDefinition(
    id: string, 
    data: Partial<CustomFieldDefinition>
  ): Observable<CustomFieldDefinition> {
    return this.api.put<CustomFieldDefinition>(`/custom-fields/${id}`, data);
  }

  deleteCustomFieldDefinition(id: string): Observable<void> {
    return this.api.delete<void>(`/custom-fields/${id}`);
  }

  reorderCustomFields(organizationId: string, fieldIds: string[]): Observable<void> {
    return this.api.post<void>(`/organizations/${organizationId}/custom-fields/reorder`, { fieldIds });
  }

  // Initialize default insurance fields
  createInsuranceFields(organizationId: string): Observable<void> {
    return this.api.post<void>(`/organizations/${organizationId}/custom-fields/insurance-defaults`, {});
  }

  // Aggregation Reports
  getPolicySummaries(organizationId: string, filters?: any): Observable<PolicySummary[]> {
    return this.api.get<PolicySummary[]>(`/organizations/${organizationId}/reports/policy-summary`, filters);
  }

  getClaimSummaries(organizationId: string, filters?: any): Observable<ClaimSummary[]> {
    return this.api.get<ClaimSummary[]>(`/organizations/${organizationId}/reports/claim-summary`, filters);
  }

  // Sample Data Generation
  generateSampleData(organizationId: string, count: number): Observable<{ message: string; generated: number }> {
    return this.api.post<{ message: string; generated: number }>(
      `/organizations/${organizationId}/sample-data/insurance`, 
      { count }
    );
  }
}

