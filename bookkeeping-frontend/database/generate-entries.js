// Generate 1000 journal entries with realistic transactions
const { Pool } = require('pg');

async function generateJournalEntries() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔌 Connecting to Neon PostgreSQL...');
    const orgId = '550e8400-e29b-41d4-a716-446655440000';
    
    // Get all accounts
    const accountsResult = await pool.query(
      'SELECT id, account_number, account_name FROM accounts WHERE organization_id = $1 ORDER BY account_number',
      [orgId]
    );
    const accounts = accountsResult.rows;
    
    if (accounts.length === 0) {
      console.error('❌ No accounts found! Run init.js first.');
      process.exit(1);
    }
    
    console.log(`📊 Found ${accounts.length} accounts`);
    console.log('📝 Generating 1000 journal entries...');
    
    // Common transaction templates
    const transactionTemplates = [
      // Sales transactions
      { description: 'Sales Revenue', debitAcct: '1200', creditAcct: '4000', amountRange: [1000, 10000] },
      { description: 'Cash Sales', debitAcct: '1000', creditAcct: '4000', amountRange: [500, 5000] },
      { description: 'Customer Payment', debitAcct: '1000', creditAcct: '1200', amountRange: [1000, 8000] },
      
      // Purchase transactions
      { description: 'Inventory Purchase', debitAcct: '1500', creditAcct: '2000', amountRange: [2000, 15000] },
      { description: 'Equipment Purchase', debitAcct: '1800', creditAcct: '1000', amountRange: [5000, 50000] },
      { description: 'Supplier Payment', debitAcct: '2000', creditAcct: '1000', amountRange: [1000, 10000] },
      
      // Expense transactions
      { description: 'Rent Payment', debitAcct: '6000', creditAcct: '1000', amountRange: [3000, 8000] },
      { description: 'Utilities Payment', debitAcct: '6100', creditAcct: '1000', amountRange: [500, 2000] },
      { description: 'Salaries Payment', debitAcct: '6200', creditAcct: '1000', amountRange: [10000, 50000] },
      { description: 'COGS', debitAcct: '5000', creditAcct: '1500', amountRange: [3000, 20000] }
    ];
    
    let entriesCreated = 0;
    const batchSize = 50;
    
    for (let batch = 0; batch < 20; batch++) { // 20 batches of 50 entries
      const values = [];
      
      for (let i = 0; i < batchSize; i++) {
        const entryNum = batch * batchSize + i + 1;
        const template = transactionTemplates[Math.floor(Math.random() * transactionTemplates.length)];
        
        // Random date in last 365 days
        const daysAgo = Math.floor(Math.random() * 365);
        const entryDate = new Date();
        entryDate.setDate(entryDate.getDate() - daysAgo);
        
        // Random amount
        const amount = (Math.random() * (template.amountRange[1] - template.amountRange[0]) + template.amountRange[0]).toFixed(2);
        
        // Find accounts
        const debitAccount = accounts.find(a => a.account_number === template.debitAcct);
        const creditAccount = accounts.find(a => a.account_number === template.creditAcct);
        
        if (!debitAccount || !creditAccount) continue;
        
        values.push({
          entryNumber: `JE-${String(entryNum).padStart(6, '0')}`,
          entryDate: entryDate.toISOString().split('T')[0],
          description: template.description,
          debitAccountId: debitAccount.id,
          creditAccountId: creditAccount.id,
          amount: parseFloat(amount)
        });
      }
      
      // Batch insert journal entries and lines
      for (const entry of values) {
        try {
          // Insert journal entry
          const jeResult = await pool.query(`
            INSERT INTO journal_entries (organization_id, entry_date, entry_number, description, status, posted_at)
            VALUES ($1, $2, $3, $4, 'posted', NOW())
            ON CONFLICT (organization_id, entry_number) DO NOTHING
            RETURNING id
          `, [orgId, entry.entryDate, entry.entryNumber, entry.description]);
          
          if (jeResult.rows.length > 0) {
            const entryId = jeResult.rows[0].id;
            
            // Insert debit line
            await pool.query(`
              INSERT INTO journal_entry_lines (journal_entry_id, account_id, debit_amount, credit_amount, currency, line_number)
              VALUES ($1, $2, $3, 0, 'USD', 1)
            `, [entryId, entry.debitAccountId, entry.amount]);
            
            // Insert credit line
            await pool.query(`
              INSERT INTO journal_entry_lines (journal_entry_id, account_id, debit_amount, credit_amount, currency, line_number)
              VALUES ($1, $2, 0, $3, 'USD', 2)
            `, [entryId, entry.creditAccountId, entry.amount]);
            
            entriesCreated++;
          }
        } catch (err) {
          // Skip duplicates
          if (err.code !== '23505') { // Ignore unique constraint violations
            console.error(`Error creating entry ${entry.entryNumber}:`, err.message);
          }
        }
      }
      
      console.log(`✅ Batch ${batch + 1}/20 complete (${entriesCreated} entries created so far)`);
    }
    
    console.log(`🎉 Created ${entriesCreated} journal entries!`);
    
    // Verify final count
    const countResult = await pool.query(
      'SELECT COUNT(*) as count FROM journal_entries WHERE organization_id = $1',
      [orgId]
    );
    console.log(`📊 Total entries in database: ${countResult.rows[0].count}`);
    
    await pool.end();
    console.log('✅ Complete!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

generateJournalEntries();

