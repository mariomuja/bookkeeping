// Database queries for session-isolated data
const { Pool } = require('pg');

class DatabaseQueries {
  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
  }

  // Accounts
  async getAccounts(sessionId) {
    const result = await this.pool.query(
      'SELECT * FROM demo_accounts WHERE session_id = $1 AND is_active = TRUE ORDER BY account_number',
      [sessionId]
    );
    return result.rows;
  }

  async createAccount(sessionId, accountData) {
    const result = await this.pool.query(`
      INSERT INTO demo_accounts (session_id, account_number, account_name, account_type_id, currency)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [sessionId, accountData.accountNumber, accountData.accountName, accountData.accountTypeId, accountData.currency || 'USD']);
    return result.rows[0];
  }

  async updateAccount(sessionId, accountId, accountData) {
    const result = await this.pool.query(`
      UPDATE demo_accounts
      SET account_name = COALESCE($3, account_name),
          account_type_id = COALESCE($4, account_type_id),
          currency = COALESCE($5, currency),
          updated_at = CURRENT_TIMESTAMP
      WHERE session_id = $1 AND id = $2
      RETURNING *
    `, [sessionId, accountId, accountData.accountName, accountData.accountTypeId, accountData.currency]);
    return result.rows[0];
  }

  async deleteAccount(sessionId, accountId) {
    await this.pool.query(
      'UPDATE demo_accounts SET is_active = FALSE WHERE session_id = $1 AND id = $2',
      [sessionId, accountId]
    );
  }

  // Journal Entries
  async getJournalEntries(sessionId, filters = {}) {
    let query = 'SELECT * FROM demo_journal_entries WHERE session_id = $1';
    const params = [sessionId];
    let paramIndex = 2;

    if (filters.status) {
      query += ` AND status = $${paramIndex}`;
      params.push(filters.status);
      paramIndex++;
    }

    if (filters.startDate) {
      query += ` AND entry_date >= $${paramIndex}`;
      params.push(filters.startDate);
      paramIndex++;
    }

    if (filters.endDate) {
      query += ` AND entry_date <= $${paramIndex}`;
      params.push(filters.endDate);
      paramIndex++;
    }

    query += ' ORDER BY entry_date DESC, entry_number DESC';

    const result = await this.pool.query(query, params);
    return result.rows;
  }

  async getJournalEntryLines(sessionId, journalEntryId) {
    const result = await this.pool.query(
      'SELECT * FROM demo_journal_entry_lines WHERE session_id = $1 AND journal_entry_id = $2 ORDER BY line_number',
      [sessionId, journalEntryId]
    );
    return result.rows;
  }

  async createJournalEntry(sessionId, entryData) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      // Create entry
      const entryResult = await client.query(`
        INSERT INTO demo_journal_entries (session_id, entry_number, entry_date, description, currency, status)
        VALUES ($1, $2, $3, $4, $5, 'DRAFT')
        RETURNING *
      `, [sessionId, entryData.entryNumber, entryData.entryDate, entryData.description, entryData.currency || 'USD']);

      const entry = entryResult.rows[0];

      // Create lines
      if (entryData.lines && entryData.lines.length > 0) {
        for (let i = 0; i < entryData.lines.length; i++) {
          const line = entryData.lines[i];
          await client.query(`
            INSERT INTO demo_journal_entry_lines 
            (session_id, journal_entry_id, account_id, line_number, description, debit_amount, credit_amount)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
          `, [sessionId, entry.id, line.accountId, i + 1, line.description, line.debitAmount || 0, line.creditAmount || 0]);
        }
      }

      await client.query('COMMIT');
      return entry;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async postJournalEntry(sessionId, entryId, postedBy) {
    const result = await this.pool.query(`
      UPDATE demo_journal_entries
      SET status = 'POSTED',
          posted_at = CURRENT_TIMESTAMP,
          posted_by = $3,
          updated_at = CURRENT_TIMESTAMP
      WHERE session_id = $1 AND id = $2
      RETURNING *
    `, [sessionId, entryId, postedBy]);
    return result.rows[0];
  }

  async voidJournalEntry(sessionId, entryId, voidedBy, voidReason) {
    const result = await this.pool.query(`
      UPDATE demo_journal_entries
      SET status = 'VOID',
          voided_at = CURRENT_TIMESTAMP,
          voided_by = $3,
          void_reason = $4,
          updated_at = CURRENT_TIMESTAMP
      WHERE session_id = $1 AND id = $2
      RETURNING *
    `, [sessionId, entryId, voidedBy, voidReason]);
    return result.rows[0];
  }

  // Dashboard Metrics
  async getDashboardMetrics(sessionId, targetCurrency = 'USD') {
    // Get all posted entries and their lines
    const result = await this.pool.query(`
      SELECT 
        da.account_number,
        da.account_name,
        da.account_type_id,
        SUM(djel.debit_amount) as total_debits,
        SUM(djel.credit_amount) as total_credits
      FROM demo_journal_entry_lines djel
      JOIN demo_accounts da ON djel.account_id = da.id
      JOIN demo_journal_entries dje ON djel.journal_entry_id = dje.id
      WHERE djel.session_id = $1 
      AND dje.status = 'POSTED'
      GROUP BY da.id, da.account_number, da.account_name, da.account_type_id
    `, [sessionId]);

    // Calculate metrics
    let totalAssets = 0, totalLiabilities = 0, totalEquity = 0;
    let totalRevenue = 0, totalExpenses = 0;

    result.rows.forEach(row => {
      const balance = row.total_debits - row.total_credits;
      
      if (row.account_type_id <= 3) totalAssets += balance;
      else if (row.account_type_id <= 5) totalLiabilities += Math.abs(balance);
      else if (row.account_type_id <= 7) totalEquity += Math.abs(balance);
      else if (row.account_type_id === 8) totalRevenue += Math.abs(balance);
      else if (row.account_type_id >= 9) totalExpenses += balance;
    });

    const entryCount = await this.pool.query(
      'SELECT COUNT(*) as count FROM demo_journal_entries WHERE session_id = $1',
      [sessionId]
    );

    const accountCount = await this.pool.query(
      'SELECT COUNT(*) as count FROM demo_accounts WHERE session_id = $1 AND is_active = TRUE',
      [sessionId]
    );

    return {
      totalAssets,
      totalLiabilities,
      totalEquity,
      totalRevenue,
      totalExpenses,
      netIncome: totalRevenue - totalExpenses,
      entryCount: parseInt(entryCount.rows[0].count),
      accountCount: parseInt(accountCount.rows[0].count),
      currency: targetCurrency
    };
  }
}

module.exports = new DatabaseQueries();

