// Single Custom Field endpoint for Vercel Serverless
// Note: This is a simplified implementation for demo purposes
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

  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      // Return demo custom field
      const customField = {
        id: id,
        organizationId: '550e8400-e29b-41d4-a716-446655440000',
        fieldName: 'Policy Number',
        fieldType: 'TEXT',
        entityType: 'JOURNAL_ENTRY',
        isRequired: false,
        defaultValue: null,
        displayOrder: 1,
        validationRules: null,
        options: null,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: new Date().toISOString()
      };

      res.status(200).json(customField);
    } catch (error) {
      console.error('[Custom Field GET] Error:', error);
      res.status(500).json({
        error: 'Failed to get custom field',
        message: error.message
      });
    }
  } else if (req.method === 'PUT') {
    // Update custom field
    try {
      const updateData = req.body;
      const customField = {
        id: id,
        ...updateData,
        updatedAt: new Date().toISOString()
      };

      res.status(200).json(customField);
    } catch (error) {
      console.error('[Custom Field PUT] Error:', error);
      res.status(500).json({
        error: 'Failed to update custom field',
        message: error.message
      });
    }
  } else if (req.method === 'DELETE') {
    // Delete custom field
    res.status(200).json({ success: true, message: 'Custom field deleted' });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};

