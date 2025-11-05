import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { CustomFieldDefinition, CreateCustomFieldDefinitionRequest } from '../models/custom-field.model';

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

}

