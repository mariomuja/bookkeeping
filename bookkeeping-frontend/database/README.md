# Database Seed Instructions

## To seed the Bookkeeping database:

1. Connect to your Neon PostgreSQL database
2. Run the schema first:
   ```bash
   psql $DATABASE_URL < schema.sql
   ```
3. Run the seed data:
   ```bash
   psql $DATABASE_URL < seed.sql
   ```

## What the seed data includes:

- **Demo Organization**: ID `550e8400-e29b-41d4-a716-446655440000`, name "Demo Company"
- **12 Account Types**: Asset, Liability, Equity, Revenue, Expense categories
- **15 Accounts**: Cash, AR, AP, Equity, Revenue, Expense accounts
- **6 Journal Entries**: 
  - Initial cash investment ($100,000)
  - Product sales ($35,000)
  - Service revenue ($15,000)
  - Rent payment ($5,000)
  - Utilities payment ($800)
  - Salary payment ($12,000)
- **12 Journal Entry Lines**: Debit and credit lines for each entry
- **7 Audit Log Entries**: Sample audit trail records

## Verifying the data:

```sql
-- Check organizations
SELECT * FROM organizations;

-- Check accounts
SELECT account_number, account_name FROM accounts WHERE organization_id = '550e8400-e29b-41d4-a716-446655440000';

-- Check journal entries
SELECT entry_number, description, status FROM journal_entries;

-- Check trial balance
SELECT 
  a.account_number, a.account_name,
  SUM(jel.debit_amount) as debits,
  SUM(jel.credit_amount) as credits
FROM accounts a
LEFT JOIN journal_entry_lines jel ON a.id = jel.account_id
WHERE a.organization_id = '550e8400-e29b-41d4-a716-446655440000'
GROUP BY a.account_number, a.account_name
ORDER BY a.account_number;

-- Check audit logs
SELECT action, entity_type, description, timestamp FROM audit_logs ORDER BY timestamp DESC LIMIT 10;
```

## Financial Summary:

After seeding, the Demo Company will have:
- **Total Assets**: $145,200 (Cash: $97,200 + AR: $35,000 + Equipment: $0)
- **Total Equity**: $100,000 (Owner Equity)
- **Total Revenue**: $50,000 ($35,000 Product + $15,000 Service)
- **Total Expenses**: $17,800 (Rent $5,000 + Utilities $800 + Salaries $12,000)
- **Net Profit**: $32,200

## Re-seeding:

The seed script uses `ON CONFLICT` clauses for most tables. To completely reset:

```sql
TRUNCATE TABLE journal_entry_lines CASCADE;
TRUNCATE TABLE journal_entries CASCADE;
TRUNCATE TABLE accounts CASCADE;
TRUNCATE TABLE account_types CASCADE;
TRUNCATE TABLE audit_logs CASCADE;
TRUNCATE TABLE custom_field_definitions CASCADE;
TRUNCATE TABLE organizations CASCADE;
```

Then run the seed script again.

