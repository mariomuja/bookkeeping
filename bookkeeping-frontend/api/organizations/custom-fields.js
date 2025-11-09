// Custom fields endpoint with PostgreSQL database
const { getPool } = require('../_db');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const pool = getPool();
  const orgId = req.query.orgId || '550e8400-e29b-41d4-a716-446655440000';
  
  if (req.method === 'GET') {
    try {
      const result = await pool.query(
        `SELECT 
          id, organization_id as "organizationId", field_name as "fieldName", 
          display_name as "displayName", field_type as "fieldType",
          description, formatting_template as "formattingTemplate",
          select_options as "selectOptions", validation_rules as "validationRules",
          is_required as "isRequired", is_searchable as "isSearchable",
          is_filterable as "isFilterable", is_active as "isActive",
          display_order as "displayOrder",
          created_at as "createdAt", updated_at as "updatedAt"
        FROM custom_field_definitions 
        WHERE organization_id = $1 AND is_active = true
        ORDER BY display_order ASC`,
        [orgId]
      );
      
      console.log(`[Custom Fields GET] Found ${result.rows.length} fields for org ${orgId}`);
      return res.status(200).json(result.rows);
    } catch (error) {
      console.error('[Custom Fields GET] Database error:', error);
      return res.status(500).json({ 
        error: 'Failed to fetch custom fields',
        message: error.message 
      });
    }
  }
  
  if (req.method === 'POST') {
    try {
      const {
        fieldName,
        displayName,
        fieldType,
        description,
        formattingTemplate,
        selectOptions,
        validationRules,
        isRequired,
        isSearchable,
        isFilterable,
        displayOrder
      } = req.body;

      // Validate required fields
      if (!fieldName || !displayName || !fieldType) {
        return res.status(400).json({ 
          error: 'fieldName, displayName, and fieldType are required' 
        });
      }

      // Insert new custom field
      const result = await pool.query(
        `INSERT INTO custom_field_definitions (
          organization_id, field_name, display_name, field_type,
          description, formatting_template, select_options, validation_rules,
          is_required, is_searchable, is_filterable, display_order
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING 
          id, organization_id as "organizationId", field_name as "fieldName",
          display_name as "displayName", field_type as "fieldType",
          description, formatting_template as "formattingTemplate",
          select_options as "selectOptions", validation_rules as "validationRules",
          is_required as "isRequired", is_searchable as "isSearchable",
          is_filterable as "isFilterable", is_active as "isActive",
          display_order as "displayOrder",
          created_at as "createdAt", updated_at as "updatedAt"`,
        [
          orgId,
          fieldName,
          displayName,
          fieldType,
          description || null,
          formattingTemplate || null,
          selectOptions || null,
          validationRules ? JSON.stringify(validationRules) : null,
          isRequired || false,
          isSearchable || false,
          isFilterable || false,
          displayOrder || 0
        ]
      );

      const newField = result.rows[0];
      console.log(`[Custom Fields POST] Created field ${newField.id} for org ${orgId}`);
      
      return res.status(201).json(newField);
    } catch (error) {
      console.error('[Custom Fields POST] Database error:', error);
      
      // Check for unique constraint violation
      if (error.code === '23505') {
        return res.status(400).json({
          error: 'A field with this name already exists',
          message: error.message
        });
      }
      
      return res.status(500).json({ 
        error: 'Failed to create custom field',
        message: error.message 
      });
    }
  }
  
  res.status(405).json({ error: 'Method not allowed' });
};
