// Single Custom Field endpoint with PostgreSQL database
const { getPool } = require('../_db');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const pool = getPool();
  const { id } = req.query;

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
        WHERE id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Custom field not found' });
      }

      return res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error('[Custom Field GET] Error:', error);
      return res.status(500).json({
        error: 'Failed to get custom field',
        message: error.message
      });
    }
  }

  if (req.method === 'PUT') {
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

      const result = await pool.query(
        `UPDATE custom_field_definitions 
        SET 
          field_name = COALESCE($2, field_name),
          display_name = COALESCE($3, display_name),
          field_type = COALESCE($4, field_type),
          description = $5,
          formatting_template = $6,
          select_options = $7,
          validation_rules = $8,
          is_required = COALESCE($9, is_required),
          is_searchable = COALESCE($10, is_searchable),
          is_filterable = COALESCE($11, is_filterable),
          display_order = COALESCE($12, display_order),
          updated_at = NOW()
        WHERE id = $1
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
          id,
          fieldName,
          displayName,
          fieldType,
          description,
          formattingTemplate,
          selectOptions,
          validationRules ? JSON.stringify(validationRules) : null,
          isRequired,
          isSearchable,
          isFilterable,
          displayOrder
        ]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Custom field not found' });
      }

      console.log(`[Custom Field PUT] Updated field ${id}`);
      return res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error('[Custom Field PUT] Error:', error);
      return res.status(500).json({
        error: 'Failed to update custom field',
        message: error.message
      });
    }
  }

  if (req.method === 'DELETE') {
    try {
      // Soft delete by setting is_active = false
      const result = await pool.query(
        `UPDATE custom_field_definitions 
        SET is_active = false, updated_at = NOW()
        WHERE id = $1
        RETURNING id`,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Custom field not found' });
      }

      console.log(`[Custom Field DELETE] Deleted field ${id}`);
      return res.status(200).json({ success: true, message: 'Custom field deleted' });
    } catch (error) {
      console.error('[Custom Field DELETE] Error:', error);
      return res.status(500).json({
        error: 'Failed to delete custom field',
        message: error.message
      });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
};
