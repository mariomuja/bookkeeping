// Custom fields endpoint with in-memory storage
// Note: In serverless, this resets on cold starts. For production, use a database.
const customFieldsStore = new Map();

module.exports = (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Extract orgId from query or body
  const orgId = req.query.orgId || req.body?.organizationId || 'default-org';
  
  // Initialize storage for this org if it doesn't exist
  if (!customFieldsStore.has(orgId)) {
    customFieldsStore.set(orgId, []);
  }
  
  if (req.method === 'GET') {
    // Return custom fields for this organization
    const customFields = customFieldsStore.get(orgId) || [];
    console.log(`[Custom Fields GET] Returning ${customFields.length} fields for org ${orgId}`);
    return res.status(200).json(customFields);
  }
  
  if (req.method === 'POST') {
    // Create new custom field
    const fields = customFieldsStore.get(orgId);
    const newField = {
      id: 'cf-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
      organizationId: orgId,
      ...req.body,
      displayOrder: fields.length,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    fields.push(newField);
    customFieldsStore.set(orgId, fields);
    
    console.log(`[Custom Fields POST] Created field ${newField.id} for org ${orgId}`);
    console.log(`[Custom Fields POST] Total fields now: ${fields.length}`);
    
    return res.status(201).json(newField);
  }
  
  res.status(405).json({ error: 'Method not allowed' });
};
