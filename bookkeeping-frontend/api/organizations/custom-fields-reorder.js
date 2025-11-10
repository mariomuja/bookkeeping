// Reorder Custom Fields endpoint with PostgreSQL database
const { getPool } = require('../_db');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const pool = getPool();
    const { fieldIds } = req.body;

    if (!fieldIds || !Array.isArray(fieldIds)) {
      return res.status(400).json({ error: 'fieldIds array is required' });
    }

    // Update display order for each field
    const updatePromises = fieldIds.map((fieldId, index) => {
      return pool.query(
        'UPDATE custom_field_definitions SET display_order = $1, updated_at = NOW() WHERE id = $2',
        [index, fieldId]
      );
    });

    await Promise.all(updatePromises);

    console.log(`[Custom Fields Reorder] Updated order for ${fieldIds.length} fields`);
    return res.status(200).json({ success: true, message: 'Field order updated' });
  } catch (error) {
    console.error('[Custom Fields Reorder] Database error:', error);
    return res.status(500).json({
      error: 'Failed to reorder custom fields',
      message: error.message
    });
  }
};


