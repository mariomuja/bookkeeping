// Custom fields endpoint
module.exports = (req, res) => {
  if (req.method === 'GET') {
    // Return empty array for demo
    const customFields = [];
    return res.status(200).json(customFields);
  }
  
  if (req.method === 'POST') {
    // Mock create custom field
    const newField = {
      id: 'cf-' + Date.now(),
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    return res.status(201).json(newField);
  }
  
  res.status(405).json({ error: 'Method not allowed' });
};


