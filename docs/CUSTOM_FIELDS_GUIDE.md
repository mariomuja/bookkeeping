# Custom Fields Guide - International Bookkeeping

## Overview

The Custom Fields system allows organizations to extend journal entries with custom data fields specific to their business needs. This is particularly powerful for insurance companies, but can be used by any business type.

## Features

### 1. **Flexible Field Types**
- **TEXT**: Alphanumeric data (policy numbers, names, etc.)
- **NUMBER**: Integer values
- **DECIMAL**: Monetary amounts with decimal precision
- **DATE**: Date fields for effective dates, expiration dates, etc.
- **BOOLEAN**: Yes/No or True/False flags
- **SELECT**: Dropdown lists with predefined options

### 2. **Field Configuration**
Each custom field can be configured with:
- **Field Name**: Internal identifier (e.g., `policy_number`)
- **Display Name**: User-friendly label (e.g., "Policy Number")
- **Description**: Explanation of the field's purpose
- **Formatting Template**: For TEXT fields (e.g., `POL-########`)
- **Validation Rules**: Min/max values, decimal places, patterns
- **Dropdown Options**: For SELECT fields
- **Required**: Whether the field must be filled
- **Searchable**: Enable search by this field
- **Filterable**: Enable filtering by this field
- **Display Order**: Position in forms and reports

### 3. **Insurance-Specific Fields (Pre-configured)**

The system includes a one-click setup for insurance operations:

1. **Policy Number** (TEXT)
   - Format: `POL-########`
   - Required, Searchable, Filterable
   
2. **Master Policy Number** (TEXT)
   - Format: `MP-######`
   - For grouping multiple policies
   
3. **Claim Number** (TEXT)
   - Format: `CLM-########`
   - Individual claim identifier
   
4. **Master Claim Number** (TEXT)
   - Format: `MCL-######`
   - For grouping multiple claims
   
5. **Policy Type** (SELECT)
   - Options: Auto, Home, Life, Health, Business, Liability
   
6. **Claim Status** (SELECT)
   - Options: Open, Under Review, Approved, Denied, Paid, Closed
   
7. **Premium Amount** (DECIMAL)
   - Validation: 0 to 1,000,000 with 2 decimals
   
8. **Claim Amount** (DECIMAL)
   - Validation: 0 to 10,000,000 with 2 decimals
   
9. **Policy Start Date** (DATE)
   - Policy effective date
   
10. **Insured Party** (TEXT)
    - Name of insured customer

## Using Custom Fields

### Step 1: Access Custom Fields Manager
Navigate to **Custom Fields** in the sidebar menu.

### Step 2: Create Fields

**Option A: Use Insurance Template**
1. Click "Create Insurance Fields" button
2. Confirms creation of all 10 insurance-specific fields
3. Fields are immediately available for use

**Option B: Create Custom Fields Manually**
1. Click "Add Custom Field" button
2. Fill in the field details:
   - Field Name (internal identifier)
   - Display Name (shown to users)
   - Field Type (select from dropdown)
   - Description (optional but recommended)
   - Configure type-specific options
3. Set required/searchable/filterable flags
4. Click "Create Field"

### Step 3: Reorder Fields
- Use the Up/Down arrow buttons to change field display order
- Order affects how fields appear in forms and reports

### Step 4: Edit or Delete Fields
- Click the Edit icon to modify field settings
- Click the Delete icon to remove a field (confirmation required)
- Note: Deleting a field also removes all associated data

## Sample Data Generation

### Generating 1 Million Insurance Bookings

1. Navigate to **Custom Fields** page
2. Click "Generate Sample Data" button
3. Enter the number of records (e.g., `1000000`)
4. Confirm the generation (note: this may take several minutes)

**What Gets Generated:**
- 70% Premium collection entries
- 30% Claim payment entries
- Random policy types across all 6 categories
- Random policy numbers (POL-00000001 to POL-01000000)
- Claim numbers for claim entries
- Master policy numbers (grouping every 100 policies)
- Random dates over the past 2 years
- Random amounts within realistic ranges

**Generated Bookings Include:**
- Premium collections (Debit: Cash, Credit: Premium Revenue)
- Claim payments (Debit: Claims Expense, Credit: Claims Payable)
- All custom field values automatically populated
- All entries are automatically POSTED

## Data Aggregation & Reporting

### Policy Summaries
View aggregated data by:
- Policy Number
- Master Policy Number
- Policy Type
- Total premiums collected
- Number of transactions
- Date range of activities

### Claim Summaries
View aggregated data by:
- Claim Number
- Master Claim Number
- Claim Status
- Associated Policy Number
- Total claim payments
- Claim lifecycle dates

### Accessing Aggregations
```sql
-- View policy summary
SELECT * FROM v_policy_summary 
WHERE organization_id = 'YOUR_ORG_ID';

-- View claim summary
SELECT * FROM v_claim_summary
WHERE organization_id = 'YOUR_ORG_ID'
AND claim_status = 'Paid';
```

## Database Schema

### Custom Field Definitions Table
```sql
custom_field_definitions
- id (UUID)
- organization_id (UUID)
- field_name (VARCHAR)
- display_name (VARCHAR)
- field_type (ENUM)
- is_required (BOOLEAN)
- is_searchable (BOOLEAN)
- is_filterable (BOOLEAN)
- validation_rules (JSONB)
- select_options (JSONB)
- display_order (INTEGER)
- ...
```

### Custom Field Values Table
```sql
journal_entry_custom_fields
- id (UUID)
- journal_entry_id (UUID)
- field_definition_id (UUID)
- field_value (TEXT)
- ...
```

## API Endpoints

### Custom Field Definitions
```
GET    /api/organizations/:orgId/custom-fields
POST   /api/organizations/:orgId/custom-fields
GET    /api/custom-fields/:id
PUT    /api/custom-fields/:id
DELETE /api/custom-fields/:id
POST   /api/organizations/:orgId/custom-fields/reorder
POST   /api/organizations/:orgId/custom-fields/insurance-defaults
```

### Sample Data
```
POST   /api/organizations/:orgId/sample-data/insurance
```

### Reports & Aggregations
```
GET    /api/organizations/:orgId/reports/policy-summary
GET    /api/organizations/:orgId/reports/claim-summary
```

## Performance Considerations

### Indexing
The system automatically creates indexes on:
- `field_value` for fast searching
- `field_definition_id` for joins
- `journal_entry_id` for entry lookups

### Materialized Views
Two materialized views provide fast aggregations:
- `v_policy_summary`: Policy-level aggregations
- `v_claim_summary`: Claim-level aggregations

### TimescaleDB Benefits
- Hypertable partitioning for `journal_entries`
- Continuous aggregates for time-series reporting
- Automatic data compression for old entries
- Efficient queries even with millions of records

## Use Cases Beyond Insurance

### Real Estate
- Property ID
- Lease Agreement Number
- Tenant Name
- Property Address
- Lease Start/End Dates

### Healthcare
- Patient ID
- Claim Number
- Provider NPI
- Service Date
- Procedure Code

### Retail
- Order Number
- Customer ID
- Store Location
- POS Terminal ID
- Salesperson Code

### Manufacturing
- Work Order Number
- Product SKU
- Batch Number
- Production Line
- Quality Control Status

## Best Practices

1. **Naming Conventions**
   - Use lowercase with underscores for field names
   - Make display names user-friendly
   - Add descriptions for complex fields

2. **Field Design**
   - Don't create too many required fields
   - Use SELECT fields for controlled vocabularies
   - Add validation rules to ensure data quality

3. **Performance**
   - Mark fields as searchable only if needed
   - Use appropriate field types (NUMBER vs DECIMAL)
   - Consider indexing strategy for large datasets

4. **Data Migration**
   - Test custom fields with small datasets first
   - Use the sample data generator to test performance
   - Plan field changes carefully (deletion removes all data)

5. **User Training**
   - Document your custom fields for your team
   - Provide examples of properly formatted values
   - Create templates for common entry types

## Troubleshooting

### Field Not Appearing in Forms
- Check if field is marked as Active
- Verify display order settings
- Ensure organization ID matches

### Validation Errors
- Review validation rules JSON syntax
- Check min/max values are appropriate
- Verify select options are properly formatted

### Performance Issues
- Reduce number of custom fields if possible
- Use filtering to limit result sets
- Consider archiving old entries

## Future Enhancements

Planned features:
- [ ] Field dependencies (show field B only if field A has value X)
- [ ] Calculated fields (auto-compute based on other fields)
- [ ] Field templates (save field sets for reuse)
- [ ] Bulk field operations
- [ ] Field change history/audit trail
- [ ] Export field definitions
- [ ] API webhooks for field changes

---

**Need Help?**
Contact support or refer to the main README.md for general system documentation.

