// Database initialization script for Neon
// Run this once to set up your bookkeeping database

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function initializeDatabase() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔌 Connecting to Neon PostgreSQL...');
    
    // Read and execute schema
    const schemaSQL = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    console.log('📋 Creating tables...');
    await pool.query(schemaSQL);
    console.log('✅ Tables created successfully!');
    
    // Read and execute seed data
    const seedSQL = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf8');
    console.log('🌱 Seeding demo data...');
    await pool.query(seedSQL);
    console.log('✅ Demo data seeded successfully!');
    
    // Verify data
    const result = await pool.query('SELECT COUNT(*) as count FROM accounts');
    console.log(`✅ Database initialized! ${result.rows[0].count} accounts created.`);
    
    await pool.end();
    console.log('🎉 Database setup complete!');
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    process.exit(1);
  }
}

initializeDatabase();




