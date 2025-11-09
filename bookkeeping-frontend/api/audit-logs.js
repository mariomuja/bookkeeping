// Audit logs endpoint - using PostgreSQL database
const { getPool } = require('./_db');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    try {
      const pool = getPool();
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

      let query = `
        SELECT 
          id, user_id as "userId", username, action,
          entity_type as "entityType", entity_id as "entityId",
          description, changes, metadata,
          ip_address as "ipAddress", user_agent as "userAgent",
          timestamp, created_at as "createdAt"
        FROM audit_logs 
        WHERE 1=1
      `;
      const params = [];
      let paramCount = 1;

      // Add filters
      if (userId) {
        query += ` AND user_id = $${paramCount}`;
        params.push(userId);
        paramCount++;
      }

      if (username) {
        query += ` AND username ILIKE $${paramCount}`;
        params.push(`%${username}%`);
        paramCount++;
      }

      if (action) {
        query += ` AND action = $${paramCount}`;
        params.push(action);
        paramCount++;
      }

      if (entityType) {
        query += ` AND entity_type = $${paramCount}`;
        params.push(entityType);
        paramCount++;
      }

      if (startDate) {
        query += ` AND timestamp >= $${paramCount}`;
        params.push(startDate);
        paramCount++;
      }

      if (endDate) {
        query += ` AND timestamp <= $${paramCount}`;
        params.push(endDate);
        paramCount++;
      }

      // Add sorting
      const validSortColumns = ['timestamp', 'username', 'action'];
      const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'timestamp';
      const sortDirection = sortOrder === 'asc' ? 'ASC' : 'DESC';
      query += ` ORDER BY ${sortColumn} ${sortDirection}`;

      // Add pagination
      query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
      params.push(parseInt(limit), parseInt(offset));

      const result = await pool.query(query, params);

      // Get total count
      let countQuery = 'SELECT COUNT(*) as total FROM audit_logs WHERE 1=1';
      const countParams = params.slice(0, -2); // Remove limit and offset
      
      if (userId) countQuery += ' AND user_id = $1';
      if (username) countQuery += ` AND username ILIKE $${countParams.length}`;
      if (action) countQuery += ` AND action = $${countParams.length}`;
      if (entityType) countQuery += ` AND entity_type = $${countParams.length}`;
      if (startDate) countQuery += ` AND timestamp >= $${countParams.length}`;
      if (endDate) countQuery += ` AND timestamp <= $${countParams.length}`;

      const countResult = await pool.query(countQuery, countParams);
      const totalCount = parseInt(countResult.rows[0].total);

      console.log(`[Audit Logs] Fetched ${result.rows.length} of ${totalCount} audit logs from database`);

      res.status(200).json({
        logs: result.rows,
        totalCount,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + result.rows.length < totalCount
      });
    } catch (error) {
      console.error('[Audit Logs] Database error:', error);
      res.status(500).json({
        error: 'Failed to fetch audit logs',
        message: error.message
      });
    }
  }

  if (req.method === 'POST') {
    try {
      const pool = getPool();
      const {
        organizationId,
        userId,
        username,
        action,
        entityType,
        entityId,
        description,
        changes,
        metadata,
        ipAddress,
        userAgent
      } = req.body;

      const result = await pool.query(
        `INSERT INTO audit_logs (
          organization_id, user_id, username, action, entity_type, entity_id,
          description, changes, metadata, ip_address, user_agent, timestamp
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
        RETURNING 
          id, user_id as "userId", username, action,
          entity_type as "entityType", entity_id as "entityId",
          description, changes, metadata,
          ip_address as "ipAddress", user_agent as "userAgent",
          timestamp, created_at as "createdAt"`,
        [
          organizationId || '550e8400-e29b-41d4-a716-446655440000',
          userId,
          username,
          action,
          entityType,
          entityId,
          description,
          changes ? JSON.stringify(changes) : null,
          metadata ? JSON.stringify(metadata) : null,
          ipAddress,
          userAgent
        ]
      );

      console.log(`[Audit Logs] Created audit log ${result.rows[0].id}`);
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('[Audit Logs POST] Database error:', error);
      res.status(500).json({
        error: 'Failed to create audit log',
        message: error.message
      });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
};
