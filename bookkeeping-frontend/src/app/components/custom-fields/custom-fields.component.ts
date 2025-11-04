import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CustomFieldService } from '../../services/custom-field.service';
import { OrganizationService } from '../../services/organization.service';
import { CustomFieldDefinition, CustomFieldType } from '../../models/custom-field.model';

@Component({
  selector: 'app-custom-fields',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './custom-fields.component.html',
  styleUrls: ['./custom-fields.component.css']
})
export class CustomFieldsComponent implements OnInit {
  customFields: CustomFieldDefinition[] = [];
  loading = false;
  error: string | null = null;
  showModal = false;
  isEditMode = false;
  
  fieldTypes: { value: CustomFieldType; label: string }[] = [
    { value: 'TEXT', label: 'Text' },
    { value: 'NUMBER', label: 'Number (Integer)' },
    { value: 'DECIMAL', label: 'Decimal Number' },
    { value: 'DATE', label: 'Date (no time)' },
    { value: 'DATETIME', label: 'Date & Time' },
    { value: 'TIMESTAMP', label: 'Timestamp (with timezone)' },
    { value: 'BOOLEAN', label: 'Yes/No' },
    { value: 'SELECT', label: 'Dropdown Select' }
  ];
  
  currentField: Partial<CustomFieldDefinition> = this.getEmptyField();
  selectOptionsText = '';
  validationRulesText = '';

  constructor(
    private customFieldService: CustomFieldService,
    private organizationService: OrganizationService
  ) {}

  ngOnInit(): void {
    this.loadCustomFields();
  }

  loadCustomFields(): void {
    const org = this.organizationService.getCurrentOrganization();
    if (!org) {
      this.error = 'Please select an organization';
      return;
    }

    this.loading = true;
    this.customFieldService.getCustomFieldDefinitions(org.id).subscribe({
      next: (fields) => {
        this.customFields = fields.sort((a, b) => a.displayOrder - b.displayOrder);
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load custom fields';
        this.loading = false;
        console.error(err);
      }
    });
  }

  getEmptyField(): Partial<CustomFieldDefinition> {
    return {
      fieldName: '',
      displayName: '',
      fieldType: 'TEXT',
      isRequired: false,
      isSearchable: true,
      isFilterable: true,
      displayOrder: this.customFields.length,
      isActive: true,
      description: ''
    };
  }

  openCreateModal(): void {
    this.isEditMode = false;
    this.currentField = this.getEmptyField();
    this.selectOptionsText = '';
    this.validationRulesText = '';
    this.showModal = true;
  }

  openEditModal(field: CustomFieldDefinition): void {
    this.isEditMode = true;
    this.currentField = { ...field };
    this.selectOptionsText = field.selectOptions ? field.selectOptions.join('\n') : '';
    this.validationRulesText = field.validationRules ? JSON.stringify(field.validationRules, null, 2) : '';
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  saveField(): void {
    const org = this.organizationService.getCurrentOrganization();
    if (!org) return;

    // Validate required fields
    if (!this.currentField.fieldName || !this.currentField.displayName) {
      alert('Field name and display name are required');
      return;
    }

    // Parse select options
    if (this.currentField.fieldType === 'SELECT') {
      this.currentField.selectOptions = this.selectOptionsText
        .split('\n')
        .map(s => s.trim())
        .filter(s => s.length > 0);
      
      if (this.currentField.selectOptions.length === 0) {
        alert('Please provide at least one option for dropdown fields');
        return;
      }
    }

    // Parse validation rules
    if (this.validationRulesText.trim()) {
      try {
        this.currentField.validationRules = JSON.parse(this.validationRulesText);
      } catch (e) {
        alert('Invalid JSON in validation rules');
        return;
      }
    }

    if (this.isEditMode && this.currentField.id) {
      this.customFieldService.updateCustomFieldDefinition(this.currentField.id, this.currentField).subscribe({
        next: () => {
          this.loadCustomFields();
          this.closeModal();
        },
        error: (err) => {
          alert('Failed to update field');
          console.error(err);
        }
      });
    } else {
      const fieldData: any = this.currentField;
      this.customFieldService.createCustomFieldDefinition(org.id, fieldData).subscribe({
        next: () => {
          this.loadCustomFields();
          this.closeModal();
        },
        error: (err) => {
          alert('Failed to create field');
          console.error(err);
        }
      });
    }
  }

  deleteField(field: CustomFieldDefinition): void {
    if (!confirm(`Are you sure you want to delete the field "${field.displayName}"? This will also delete all values associated with this field.`)) {
      return;
    }

    this.customFieldService.deleteCustomFieldDefinition(field.id).subscribe({
      next: () => {
        this.loadCustomFields();
      },
      error: (err) => {
        alert('Failed to delete field');
        console.error(err);
      }
    });
  }

  moveUp(index: number): void {
    if (index === 0) return;
    const temp = this.customFields[index];
    this.customFields[index] = this.customFields[index - 1];
    this.customFields[index - 1] = temp;
    this.updateOrder();
  }

  moveDown(index: number): void {
    if (index === this.customFields.length - 1) return;
    const temp = this.customFields[index];
    this.customFields[index] = this.customFields[index + 1];
    this.customFields[index + 1] = temp;
    this.updateOrder();
  }

  updateOrder(): void {
    const org = this.organizationService.getCurrentOrganization();
    if (!org) return;

    const fieldIds = this.customFields.map(f => f.id);
    this.customFieldService.reorderCustomFields(org.id, fieldIds).subscribe({
      error: (err) => {
        alert('Failed to update field order');
        console.error(err);
        this.loadCustomFields(); // Reload on error
      }
    });
  }

  createInsuranceDefaults(): void {
    const org = this.organizationService.getCurrentOrganization();
    if (!org) return;

    if (!confirm('This will create default insurance-related custom fields (Policy Number, Claim Number, etc.). Continue?')) {
      return;
    }

    this.customFieldService.createInsuranceFields(org.id).subscribe({
      next: () => {
        alert('Insurance fields created successfully');
        this.loadCustomFields();
      },
      error: (err) => {
        alert('Failed to create insurance fields');
        console.error(err);
      }
    });
  }

  generateSampleData(): void {
    const org = this.organizationService.getCurrentOrganization();
    if (!org) return;

    const count = prompt('How many sample insurance bookings to generate? (e.g., 1000000 for 1 million)', '10000');
    if (!count) return;

    const numCount = parseInt(count);
    if (isNaN(numCount) || numCount < 1) {
      alert('Please enter a valid number');
      return;
    }

    if (numCount > 100000 && !confirm(`You are about to generate ${numCount.toLocaleString()} records. This may take several minutes. Continue?`)) {
      return;
    }

    this.loading = true;
    this.customFieldService.generateSampleData(org.id, numCount).subscribe({
      next: (result) => {
        alert(`${result.message}\nGenerated: ${result.generated} records`);
        this.loading = false;
      },
      error: (err) => {
        alert('Failed to generate sample data');
        this.loading = false;
        console.error(err);
      }
    });
  }

  getTypeIcon(fieldType: CustomFieldType): string {
    const icons: { [key in CustomFieldType]: string } = {
      'TEXT': '📝',
      'NUMBER': '#️⃣',
      'DECIMAL': '💰',
      'DATE': '📅',
      'DATETIME': '🕐',
      'TIMESTAMP': '⏰',
      'BOOLEAN': '☑️',
      'SELECT': '📋'
    };
    return icons[fieldType] || '📄';
  }
}

