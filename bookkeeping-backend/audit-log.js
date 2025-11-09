// Audit Logging Module
const { v4: uuidv4 } = require('uuid');

// In-memory audit log storage (in production, use database)
const auditLogs = [];

// Log types
const LOG_TYPES = {
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  POST: 'POST',
  VOID: 'VOID',
  IMPORT: 'IMPORT',
  EXPORT: 'EXPORT',
  GENERATE: 'GENERATE',
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  SETUP_2FA: 'SETUP_2FA',
  ENABLE_2FA: 'ENABLE_2FA',
  DISABLE_2FA: 'DISABLE_2FA'
};

// Entity types
const ENTITY_TYPES = {
  JOURNAL_ENTRY: 'JOURNAL_ENTRY',
  ACCOUNT: 'ACCOUNT',
  ORGANIZATION: 'ORGANIZATION',
  CUSTOM_FIELD: 'CUSTOM_FIELD',
  USER: 'USER',
  REPORT: 'REPORT',
  SAMPLE_DATA: 'SAMPLE_DATA'
};

/**
 * Create an audit log entry
 */
const createAuditLog = (params) => {
  const {
    userId,
    username,
    action,
    entityType,
    entityId,
    description,
    changes = null,
    metadata = null,
    ipAddress = null,
    userAgent = null
  } = params;

  const log = {
    id: uuidv4(),
    userId,
    username,
    action,
    entityType,
    entityId,
    description,
    changes,
    metadata,
    ipAddress,
    userAgent,
    timestamp: new Date(),
    createdAt: new Date()
  };

  auditLogs.push(log);
  console.log(`[AUDIT] ${username} - ${action} ${entityType} - ${description}`);
  
  return log;
};

/**
 * Get audit logs with filtering and pagination
 */
const getAuditLogs = (filters = {}) => {
  const {
    userId,
    username,
    action,
    entityType,
    startDate,
    endDate,
    limit = 100,
    offset = 0,
    sortBy = 'timestamp',
    sortOrder = 'desc'
  } = filters;

  let filtered = [...auditLogs];

  // Apply filters
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
  const paginatedLogs = filtered.slice(offset, offset + limit);

  return {
    logs: paginatedLogs,
    totalCount,
    limit,
    offset,
    hasMore: offset + limit < totalCount
  };
};

/**
 * Get audit log statistics
 */
const getAuditStats = () => {
  const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const last7days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const stats = {
    totalLogs: auditLogs.length,
    last24Hours: auditLogs.filter(log => new Date(log.timestamp) >= last24h).length,
    last7Days: auditLogs.filter(log => new Date(log.timestamp) >= last7days).length,
    byAction: {},
    byEntityType: {},
    byUser: {}
  };

  // Count by action
  auditLogs.forEach(log => {
    stats.byAction[log.action] = (stats.byAction[log.action] || 0) + 1;
    stats.byEntityType[log.entityType] = (stats.byEntityType[log.entityType] || 0) + 1;
    stats.byUser[log.username] = (stats.byUser[log.username] || 0) + 1;
  });

  return stats;
};

/**
 * Middleware to automatically log API requests
 */
const auditMiddleware = (action, entityType) => {
  return (req, res, next) => {
    // Store original methods
    const originalJson = res.json.bind(res);
    const originalSend = res.send.bind(res);

    // Override response methods to capture success
    res.json = function(data) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        logRequest(req, action, entityType, data);
      }
      return originalJson(data);
    };

    res.send = function(data) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        logRequest(req, action, entityType, data);
      }
      return originalSend(data);
    };

    next();
  };
};

/**
 * Helper to log the request
 */
const logRequest = (req, action, entityType, responseData) => {
  const user = req.user || { userId: 'system', username: 'System' };
  const entityId = req.params.id || req.params.orgId || responseData?.id || 'N/A';
  
  let description = `${action} ${entityType}`;
  
  // Add more context based on action
  if (action === LOG_TYPES.CREATE && responseData?.entryNumber) {
    description = `Created journal entry ${responseData.entryNumber}`;
  } else if (action === LOG_TYPES.GENERATE && req.body?.count) {
    description = `Generated ${req.body.count} sample data entries`;
  } else if (action === LOG_TYPES.IMPORT) {
    description = `Imported data from file`;
  }

  createAuditLog({
    userId: user.userId,
    username: user.username,
    action,
    entityType,
    entityId,
    description,
    changes: null,
    metadata: {
      method: req.method,
      path: req.path,
      params: req.params,
      body: sanitizeBody(req.body)
    },
    ipAddress: req.ip || req.connection.remoteAddress,
    userAgent: req.headers['user-agent']
  });
};

/**
 * Sanitize request body (remove sensitive data)
 */
const sanitizeBody = (body) => {
  if (!body) return null;
  
  const sanitized = { ...body };
  
  // Remove sensitive fields
  delete sanitized.password;
  delete sanitized.twoFactorSecret;
  delete sanitized.token;
  
  // Truncate large arrays
  Object.keys(sanitized).forEach(key => {
    if (Array.isArray(sanitized[key]) && sanitized[key].length > 10) {
      sanitized[key] = `[${sanitized[key].length} items]`;
    }
  });
  
  return sanitized;
};

/**
 * Clear old audit logs (retention policy)
 */
const clearOldLogs = (daysToKeep = 90) => {
  const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);
  const initialCount = auditLogs.length;
  
  const filtered = auditLogs.filter(log => new Date(log.timestamp) >= cutoffDate);
  auditLogs.length = 0;
  auditLogs.push(...filtered);
  
  const deletedCount = initialCount - auditLogs.length;
  console.log(`[AUDIT] Cleared ${deletedCount} logs older than ${daysToKeep} days`);
  
  return deletedCount;
};

module.exports = {
  LOG_TYPES,
  ENTITY_TYPES,
  createAuditLog,
  getAuditLogs,
  getAuditStats,
  auditMiddleware,
  clearOldLogs,
  auditLogs
};

