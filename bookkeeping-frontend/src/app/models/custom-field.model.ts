export type CustomFieldType = 'TEXT' | 'NUMBER' | 'DATE' | 'DATETIME' | 'TIMESTAMP' | 'BOOLEAN' | 'DECIMAL' | 'SELECT';

export interface CustomFieldDefinition {
  id: string;
  organizationId: string;
  fieldName: string;
  displayName: string;
  fieldType: CustomFieldType;
  isRequired: boolean;
  isSearchable: boolean;
  isFilterable: boolean;
  defaultValue?: string;
  validationRules?: {
    min?: number;
    max?: number;
    decimals?: number;
    pattern?: string;
    minLength?: number;
    maxLength?: number;
  };
  selectOptions?: string[];
  displayOrder: number;
  description?: string;
  formattingTemplate?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface JournalEntryCustomField {
  id: string;
  journalEntryId: string;
  fieldDefinitionId: string;
  fieldValue: string;
  createdAt: Date;
  updatedAt: Date;
  definition?: CustomFieldDefinition;
}

export interface CreateCustomFieldDefinitionRequest {
  fieldName: string;
  displayName: string;
  fieldType: CustomFieldType;
  isRequired?: boolean;
  isSearchable?: boolean;
  isFilterable?: boolean;
  defaultValue?: string;
  validationRules?: any;
  selectOptions?: string[];
  displayOrder?: number;
  description?: string;
  formattingTemplate?: string;
}


