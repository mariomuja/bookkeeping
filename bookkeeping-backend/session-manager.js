// Session Manager for Demo User Isolation
const { v4: uuidv4 } = require('uuid');
const { Pool } = require('pg');

class SessionManager {
  constructor() {
    // Use PostgreSQL connection or fall back to in-memory
    this.useDatabase = !!process.env.DATABASE_URL;
    
    if (this.useDatabase) {
      this.pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
      });
      console.log('[SessionManager] Using PostgreSQL for session isolation');
    } else {
      // In-memory fallback for local development
      this.sessions = new Map();
      console.log('[SessionManager] Using in-memory storage (not recommended for production)');
    }
    
    this.SESSION_EXPIRY_HOURS = parseInt(process.env.SESSION_EXPIRY_HOURS) || 24;
  }

  /**
   * Creates a new demo session with isolated data
   */
  async createDemoSession(userAgent, ipAddress) {
    const sessionId = uuidv4();
    const expiresAt = new Date(Date.now() + (this.SESSION_EXPIRY_HOURS * 60 * 60 * 1000));

    if (this.useDatabase) {
      try {
        // Create session in database
        await this.pool.query(`
          INSERT INTO demo_sessions (session_id, expires_at, user_agent, ip_address)
          VALUES ($1, $2, $3, $4)
        `, [sessionId, expiresAt, userAgent, ipAddress]);

        // Initialize demo data for this session
        await this.pool.query('SELECT initialize_demo_session($1)', [sessionId]);

        console.log(`[SessionManager] Created session ${sessionId}, expires: ${expiresAt}`);
        return { sessionId, expiresAt };
      } catch (error) {
        console.error('[SessionManager] Error creating session:', error);
        throw error;
      }
    } else {
      // In-memory fallback
      this.sessions.set(sessionId, {
        sessionId,
        createdAt: new Date(),
        expiresAt,
        accounts: this.getDefaultAccounts(),
        journalEntries: this.getDefaultJournalEntries(),
        journalEntryLines: this.getDefaultJournalLines(),
        customFields: []
      });
      return { sessionId, expiresAt };
    }
  }

  /**
   * Validates and refreshes a session
   */
  async validateSession(sessionId) {
    if (!sessionId) return false;

    if (this.useDatabase) {
      try {
        const result = await this.pool.query(`
          UPDATE demo_sessions
          SET last_accessed = CURRENT_TIMESTAMP
          WHERE session_id = $1 
          AND expires_at > CURRENT_TIMESTAMP
          AND is_active = TRUE
          RETURNING session_id
        `, [sessionId]);

        return result.rows.length > 0;
      } catch (error) {
        console.error('[SessionManager] Error validating session:', error);
        return false;
      }
    } else {
      const session = this.sessions.get(sessionId);
      return session && session.expiresAt > new Date();
    }
  }

  /**
   * Gets data for a specific session
   */
  async getSessionData(sessionId, dataType) {
    if (!this.useDatabase) {
      const session = this.sessions.get(sessionId);
      return session?.[dataType] || [];
    }

    // Return null for database mode - data is fetched via SQL queries
    return null;
  }

  /**
   * Cleanup expired sessions
   */
  async cleanupExpiredSessions() {
    if (this.useDatabase) {
      try {
        const result = await this.pool.query('SELECT * FROM cleanup_expired_sessions()');
        const { deleted_count, freed_records } = result.rows[0];
        console.log(`[SessionManager] Cleaned up ${deleted_count} sessions, freed ${freed_records} records`);
        return { deleted_count, freed_records };
      } catch (error) {
        console.error('[SessionManager] Error cleaning up sessions:', error);
        return { deleted_count: 0, freed_records: 0 };
      }
    } else {
      // In-memory cleanup
      const now = new Date();
      let deleted = 0;
      for (const [sessionId, session] of this.sessions.entries()) {
        if (session.expiresAt < now) {
          this.sessions.delete(sessionId);
          deleted++;
        }
      }
      console.log(`[SessionManager] Cleaned up ${deleted} expired sessions`);
      return { deleted_count: deleted, freed_records: 0 };
    }
  }

  /**
   * Get default accounts for in-memory mode
   */
  getDefaultAccounts() {
    return [
      { id: uuidv4(), accountNumber: '1000', accountName: 'Cash', accountTypeId: 1, currency: 'USD', isActive: true },
      { id: uuidv4(), accountNumber: '1200', accountName: 'Accounts Receivable', accountTypeId: 1, currency: 'USD', isActive: true },
      { id: uuidv4(), accountNumber: '1500', accountName: 'Investments', accountTypeId: 1, currency: 'USD', isActive: true },
      { id: uuidv4(), accountNumber: '2000', accountName: 'Accounts Payable', accountTypeId: 4, currency: 'USD', isActive: true },
      { id: uuidv4(), accountNumber: '2100', accountName: 'Accrued Expenses', accountTypeId: 4, currency: 'USD', isActive: true },
      { id: uuidv4(), accountNumber: '3000', accountName: 'Owner Equity', accountTypeId: 6, currency: 'USD', isActive: true },
      { id: uuidv4(), accountNumber: '4000', accountName: 'Sales Revenue', accountTypeId: 8, currency: 'USD', isActive: true },
      { id: uuidv4(), accountNumber: '4100', accountName: 'Other Income', accountTypeId: 8, currency: 'USD', isActive: true },
      { id: uuidv4(), accountNumber: '6000', accountName: 'Cost of Services', accountTypeId: 10, currency: 'USD', isActive: true },
      { id: uuidv4(), accountNumber: '6100', accountName: 'Operating Expenses', accountTypeId: 10, currency: 'USD', isActive: true }
    ];
  }

  /**
   * Get default journal entries for in-memory mode
   */
  getDefaultJournalEntries() {
    return [
      { id: uuidv4(), entryNumber: 'JE-2024-001', entryDate: new Date('2024-01-15'), description: 'Sales revenue for January', currency: 'USD', status: 'POSTED' },
      { id: uuidv4(), entryNumber: 'JE-2024-002', entryDate: new Date('2024-01-20'), description: 'Other income received', currency: 'USD', status: 'POSTED' },
      { id: uuidv4(), entryNumber: 'JE-2024-003', entryDate: new Date('2024-02-01'), description: 'Cost of services', currency: 'USD', status: 'POSTED' },
      { id: uuidv4(), entryNumber: 'JE-2024-004', entryDate: new Date('2024-02-15'), description: 'Operating expenses - February', currency: 'USD', status: 'POSTED' }
    ];
  }

  /**
   * Get default journal lines for in-memory mode
   */
  getDefaultJournalLines() {
    return [];
  }
}

module.exports = new SessionManager();

