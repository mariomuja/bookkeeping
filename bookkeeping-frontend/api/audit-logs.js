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
    // Build query string from request query parameters
    const queryParams = new URLSearchParams();
    if (req.query.userId) queryParams.append('userId', req.query.userId);
    if (req.query.username) queryParams.append('username', req.query.username);
    if (req.query.action) queryParams.append('action', req.query.action);
    if (req.query.entityType) queryParams.append('entityType', req.query.entityType);
    if (req.query.startDate) queryParams.append('startDate', req.query.startDate);
    if (req.query.endDate) queryParams.append('endDate', req.query.endDate);
    if (req.query.limit) queryParams.append('limit', req.query.limit);
    if (req.query.offset) queryParams.append('offset', req.query.offset);
    if (req.query.sortBy) queryParams.append('sortBy', req.query.sortBy);
    if (req.query.sortOrder) queryParams.append('sortOrder', req.query.sortOrder);

    const queryString = queryParams.toString();
    const url = `${BACKEND_URL}/api/audit-logs${queryString ? '?' + queryString : ''}`;

    console.log('Proxying audit logs request to:', url);

    const response = await axios.get(url, {
      headers: {
        'Content-Type': 'application/json',
        // Forward authorization if present
        ...(req.headers.authorization && { Authorization: req.headers.authorization })
      }
    });

    return res.status(200).json(response.data);
  } catch (error) {
    console.error('Audit logs proxy error:', error.response?.data || error.message);
    return res.status(error.response?.status || 500).json({
      error: error.response?.data?.error || 'Failed to fetch audit logs',
      message: error.message
    });
  }
};

