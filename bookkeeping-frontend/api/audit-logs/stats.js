const axios = require('axios');

const BACKEND_URL = process.env.BACKEND_URL || 'https://international-bookkeeping-api.onrender.com';

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const url = `${BACKEND_URL}/api/audit-logs/stats`;
    
    console.log('Proxying audit logs stats request to:', url);

    const response = await axios.get(url, {
      headers: {
        'Content-Type': 'application/json',
        // Forward authorization if present
        ...(req.headers.authorization && { Authorization: req.headers.authorization })
      }
    });

    return res.status(200).json(response.data);
  } catch (error) {
    console.error('Audit logs stats proxy error:', error.response?.data || error.message);
    return res.status(error.response?.status || 500).json({
      error: error.response?.data?.error || 'Failed to fetch audit logs statistics',
      message: error.message
    });
  }
};

