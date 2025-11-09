// Audit logs endpoint for Vercel Serverless
// Returns demo audit logs data

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Demo audit logs
    const demoLogs = [
      {
        id: '1',
        userId: 'demo-user',
        username: 'demo',
        action: 'LOGIN',
        entityType: 'USER',
        entityId: 'demo-user',
        description: 'User logged in successfully',
        changes: null,
        metadata: null,
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
        createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString()
      },
      {
        id: '2',
        userId: 'demo-user',
        username: 'demo',
        action: 'CREATE',
        entityType: 'JOURNAL_ENTRY',
        entityId: 'je-001',
        description: 'Created journal entry JE-2024-001',
        changes: null,
        metadata: { entryNumber: 'JE-2024-001' },
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString()
      },
      {
        id: '3',
        userId: 'demo-user',
        username: 'demo',
        action: 'UPDATE',
        entityType: 'ACCOUNT',
        entityId: 'acc-001',
        description: 'Updated account 1000 - Cash',
        changes: {
          before: { accountName: 'Cash' },
          after: { accountName: 'Cash - USD' }
        },
        metadata: null,
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
        createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString()
      },
      {
        id: '4',
        userId: 'demo-user',
        username: 'demo',
        action: 'GENERATE',
        entityType: 'REPORT',
        entityId: 'report-001',
        description: 'Generated Trial Balance report',
        changes: null,
        metadata: { reportType: 'TRIAL_BALANCE' },
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
      },
      {
        id: '5',
        userId: 'demo-user',
        username: 'demo',
        action: 'POST',
        entityType: 'JOURNAL_ENTRY',
        entityId: 'je-002',
        description: 'Posted journal entry JE-2024-002',
        changes: null,
        metadata: { entryNumber: 'JE-2024-002' },
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 hours ago
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString()
      }
    ];

    // Get query parameters
    const {
      userId,
      username,
      action,
      entityType,
      startDate,
      endDate,
      limit = '100',
      offset = '0',
      sortBy = 'timestamp',
      sortOrder = 'desc'
    } = req.query;

    // Filter logs
    let filtered = [...demoLogs];

    if (userId) {
      filtered = filtered.filter(log => log.userId === userId);
    }

    if (username) {
      filtered = filtered.filter(log => 
        log.username && log.username.toLowerCase().includes(username.toLowerCase())
      );
    }

    if (action) {
      filtered = filtered.filter(log => log.action === action);
    }

    if (entityType) {
      filtered = filtered.filter(log => log.entityType === entityType);
    }

    if (startDate) {
      const start = new Date(startDate);
      filtered = filtered.filter(log => new Date(log.timestamp) >= start);
    }

    if (endDate) {
      const end = new Date(endDate);
      filtered = filtered.filter(log => new Date(log.timestamp) <= end);
    }

    // Sort
    filtered.sort((a, b) => {
      let compareValue = 0;
      
      if (sortBy === 'timestamp') {
        compareValue = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      } else if (sortBy === 'username') {
        compareValue = (a.username || '').localeCompare(b.username || '');
      } else if (sortBy === 'action') {
        compareValue = (a.action || '').localeCompare(b.action || '');
      }

      return sortOrder === 'desc' ? -compareValue : compareValue;
    });

    // Get total count before pagination
    const totalCount = filtered.length;

    // Apply pagination
    const limitNum = parseInt(limit);
    const offsetNum = parseInt(offset);
    const paginatedLogs = filtered.slice(offsetNum, offsetNum + limitNum);

    res.status(200).json({
      logs: paginatedLogs,
      totalCount,
      limit: limitNum,
      offset: offsetNum,
      hasMore: offsetNum + limitNum < totalCount
    });
  } catch (error) {
    console.error('[Audit Logs] Error:', error);
    res.status(500).json({
      error: 'Failed to fetch audit logs',
      message: error.message
    });
  }
};
