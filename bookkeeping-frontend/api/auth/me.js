// Get current user endpoint
module.exports = (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Mock user data for demo
  const user = {
    id: 'demo-user',
    username: 'demo',
    email: 'demo@example.com',
    displayName: 'Demo User',
    roles: ['user', 'admin']
  };

  res.status(200).json(user);
};


