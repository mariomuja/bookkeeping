# Quick Setup Guide

## Step-by-Step Installation

### 1. Database Setup (PostgreSQL + TimescaleDB)

#### Option A: Using Docker (Recommended for Development)
```bash
# Run PostgreSQL with TimescaleDB
docker run -d --name bookkeeping-db \
  -p 5432:5432 \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=bookkeeping \
  timescale/timescaledb:latest-pg15

# Wait a few seconds for the database to start, then run the schema
docker exec -i bookkeeping-db psql -U postgres -d bookkeeping < database/bookkeeping-schema.sql
```

#### Option B: Local PostgreSQL Installation
```bash
# Install TimescaleDB extension (Ubuntu/Debian)
sudo add-apt-repository ppa:timescale/timescaledb-ppa
sudo apt update
sudo apt install timescaledb-postgresql-15

# Or on macOS with Homebrew
brew tap timescale/tap
brew install timescaledb

# Create database
createdb bookkeeping

# Run schema
psql -d bookkeeping -f database/bookkeeping-schema.sql
```

### 2. Backend API Setup

You'll need to implement or use a backend API. Here's a sample Node.js/Express setup:

#### Create a simple Express backend:
```bash
mkdir bookkeeping-backend
cd bookkeeping-backend
npm init -y
npm install express pg cors dotenv
```

#### Create `server.js`:
```javascript
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const port = 3000;

// Database connection
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'bookkeeping',
  password: 'postgres',
  port: 5432,
});

app.use(cors());
app.use(express.json());

// Example: Get organizations
app.get('/api/organizations', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM organizations WHERE is_active = true');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Example: Get accounts
app.get('/api/organizations/:orgId/accounts', async (req, res) => {
  try {
    const { orgId } = req.params;
    const result = await pool.query(`
      SELECT a.*, at.name as account_type_name, at.category
      FROM accounts a
      JOIN account_types at ON a.account_type_id = at.id
      WHERE a.organization_id = $1 AND a.is_active = true
      ORDER BY a.account_number
    `, [orgId]);
    
    // Map snake_case to camelCase
    const accounts = result.rows.map(row => ({
      id: row.id,
      organizationId: row.organization_id,
      accountNumber: row.account_number,
      accountName: row.account_name,
      accountTypeId: row.account_type_id,
      currency: row.currency,
      description: row.description,
      isSystemAccount: row.is_system_account,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      accountType: {
        name: row.account_type_name,
        category: row.category
      }
    }));
    
    res.json(accounts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// TODO: Add more endpoints as needed

app.listen(port, () => {
  console.log(`Backend API running on http://localhost:${port}`);
});
```

#### Start the backend:
```bash
node server.js
```

### 3. Frontend Setup

```bash
# Install dependencies
cd bookkeeping-frontend
npm install

# Start development server
npm start

# Open browser to http://localhost:4200
```

## Sample Data Setup

### Insert Sample Organization
```sql
INSERT INTO organizations (name, country_code, default_currency, default_timezone, fiscal_year_start, fiscal_year_end)
VALUES ('Demo Company Inc.', 'US', 'USD', 'America/New_York', 1, 12)
RETURNING id;
```

### Insert Sample Accounts
```sql
-- Get the organization ID from previous query
-- Replace 'YOUR_ORG_ID' with actual UUID

INSERT INTO accounts (organization_id, account_number, account_name, account_type_id, currency) VALUES
('YOUR_ORG_ID', '1000', 'Cash', 1, 'USD'),
('YOUR_ORG_ID', '1200', 'Accounts Receivable', 1, 'USD'),
('YOUR_ORG_ID', '2000', 'Accounts Payable', 4, 'USD'),
('YOUR_ORG_ID', '3000', 'Owner''s Equity', 6, 'USD'),
('YOUR_ORG_ID', '4000', 'Sales Revenue', 8, 'USD'),
('YOUR_ORG_ID', '5000', 'Cost of Goods Sold', 9, 'USD'),
('YOUR_ORG_ID', '6000', 'Operating Expenses', 10, 'USD');
```

### Create Sample Journal Entry
```sql
-- Insert journal entry header
INSERT INTO journal_entries (
  organization_id, entry_number, entry_date, description, 
  currency, base_currency, created_by, source, status
) VALUES (
  'YOUR_ORG_ID', 'JE-001', CURRENT_DATE, 'Initial cash investment',
  'USD', 'USD', 'Admin', 'MANUAL', 'DRAFT'
) RETURNING id;

-- Insert journal entry lines (Replace 'ENTRY_ID' with returned ID)
-- Debit Cash
INSERT INTO journal_entry_lines (journal_entry_id, line_number, account_id, debit_amount, credit_amount)
SELECT 'ENTRY_ID', 1, id, 10000.00, 0 FROM accounts WHERE account_number = '1000';

-- Credit Owner's Equity
INSERT INTO journal_entry_lines (journal_entry_id, line_number, account_id, debit_amount, credit_amount)
SELECT 'ENTRY_ID', 2, id, 0, 10000.00 FROM accounts WHERE account_number = '3000';

-- Post the entry
SELECT post_journal_entry('ENTRY_ID', 'Admin');
```

## Testing the Application

### 1. Access Dashboard
Navigate to `http://localhost:4200/dashboard`
- Should see metrics cards (will show $0 initially)
- Activity summary
- Quick actions

### 2. View Chart of Accounts
Navigate to `http://localhost:4200/accounts`
- See list of accounts
- Try filtering by category
- Create a new account

### 3. Create Journal Entry
Navigate to `http://localhost:4200/journal-entries`
- Click "New Entry"
- Select accounts for debit and credit
- Ensure debits equal credits
- Create entry

### 4. View Reports
Navigate to `http://localhost:4200/reports`
- View Trial Balance
- Check Balance Sheet
- Review Profit & Loss

## Common Issues

### Database Connection Error
- Ensure PostgreSQL is running: `pg_isready`
- Check credentials in backend configuration
- Verify database exists: `psql -l | grep bookkeeping`

### CORS Errors
- Ensure backend has CORS enabled
- Check backend is running on port 3000
- Verify API URL in `environment.ts`

### Journal Entry Won't Post
- Check that debits equal credits
- Verify accounts exist and are active
- Check console for validation errors

### Reports Show No Data
- Ensure journal entries are POSTED, not DRAFT
- Check that entries are within the fiscal period
- Verify backend endpoints are returning data

## Production Deployment

### Frontend
```bash
cd bookkeeping-frontend
npm run build
# Deploy dist/ folder to web server
```

### Backend
- Use environment variables for database credentials
- Add authentication and authorization
- Implement rate limiting
- Enable HTTPS
- Set up monitoring and logging

### Database
- Configure regular backups
- Set up replication for high availability
- Optimize TimescaleDB chunk intervals
- Monitor query performance
- Set up continuous aggregate policies

## Next Steps

1. **Implement Full Backend API**: Complete all endpoints listed in README.md
2. **Add Authentication**: Implement user login and permissions
3. **Add Validation**: Server-side validation for all transactions
4. **Implement Audit Trail**: Track all changes to entries
5. **Add Export Features**: Generate PDF reports
6. **Implement Email Notifications**: Alert on important events
7. **Add Multi-language Support**: i18n for international use

## Resources

- [Angular Documentation](https://angular.dev)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [TimescaleDB Documentation](https://docs.timescale.com/)
- [Double-Entry Bookkeeping](https://en.wikipedia.org/wiki/Double-entry_bookkeeping)

---

**Happy Bookkeeping! 📊**

