-- Seed Data for Bookkeeping Demo

-- Insert Demo Organization
INSERT INTO organizations (id, name, country_code, default_currency, default_timezone, fiscal_year_start, fiscal_year_end)
VALUES ('550e8400-e29b-41d4-a716-446655440000', 'Demo Company', 'US', 'USD', 'America/New_York', 1, 12)
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  updated_at = NOW();

-- Insert Account Types
INSERT INTO account_types (id, code, name, category, normal_balance, is_balance_sheet, display_order) VALUES
(1, 'CASH', 'Cash', 'ASSET', 'DEBIT', true, 1),
(2, 'AR', 'Accounts Receivable', 'ASSET', 'DEBIT', true, 2),
(3, 'INVENTORY', 'Inventory', 'ASSET', 'DEBIT', true, 3),
(4, 'FIXED_ASSETS', 'Fixed Assets', 'ASSET', 'DEBIT', true, 4),
(5, 'AP', 'Accounts Payable', 'LIABILITY', 'CREDIT', true, 5),
(6, 'LOANS', 'Loans Payable', 'LIABILITY', 'CREDIT', true, 6),
(7, 'EQUITY', 'Owner Equity', 'EQUITY', 'CREDIT', true, 7),
(8, 'RETAINED', 'Retained Earnings', 'EQUITY', 'CREDIT', true, 8),
(9, 'SALES_REV', 'Sales Revenue', 'REVENUE', 'CREDIT', false, 9),
(10, 'SERVICE_REV', 'Service Revenue', 'REVENUE', 'CREDIT', false, 10),
(11, 'COGS', 'Cost of Goods Sold', 'EXPENSE', 'DEBIT', false, 11),
(12, 'OP_EXP', 'Operating Expenses', 'EXPENSE', 'DEBIT', false, 12)
ON CONFLICT (code) DO NOTHING;

-- Insert Sample Accounts (using proper UUIDs)
INSERT INTO accounts (organization_id, account_number, account_name, account_type_id, currency, is_system_account, is_active) VALUES
('550e8400-e29b-41d4-a716-446655440000', '1000', 'Cash', 1, 'USD', false, true),
('550e8400-e29b-41d4-a716-446655440000', '1200', 'Accounts Receivable', 2, 'USD', false, true),
('550e8400-e29b-41d4-a716-446655440000', '1500', 'Inventory', 3, 'USD', false, true),
('550e8400-e29b-41d4-a716-446655440000', '1800', 'Equipment', 4, 'USD', false, true),
('550e8400-e29b-41d4-a716-446655440000', '2000', 'Accounts Payable', 5, 'USD', false, true),
('550e8400-e29b-41d4-a716-446655440000', '2500', 'Long-term Debt', 6, 'USD', false, true),
('550e8400-e29b-41d4-a716-446655440000', '3000', 'Owner Equity', 7, 'USD', true, true),
('550e8400-e29b-41d4-a716-446655440000', '3500', 'Retained Earnings', 8, 'USD', true, true),
('550e8400-e29b-41d4-a716-446655440000', '4000', 'Sales Revenue', 9, 'USD', false, true),
('550e8400-e29b-41d4-a716-446655440000', '5000', 'Cost of Goods Sold', 11, 'USD', false, true),
('550e8400-e29b-41d4-a716-446655440000', '6000', 'Rent Expense', 12, 'USD', false, true),
('550e8400-e29b-41d4-a716-446655440000', '6100', 'Utilities Expense', 12, 'USD', false, true),
('550e8400-e29b-41d4-a716-446655440000', '6200', 'Salaries Expense', 12, 'USD', false, true)
ON CONFLICT (organization_id, account_number) DO NOTHING;

-- Insert Sample Journal Entries (let PostgreSQL generate UUIDs)
WITH je1 AS (
  INSERT INTO journal_entries (organization_id, entry_date, entry_number, description, status, posted_at)
  VALUES ('550e8400-e29b-41d4-a716-446655440000', CURRENT_DATE - INTERVAL '30 days', 'JE-001', 'Initial Cash Investment', 'posted', NOW() - INTERVAL '30 days')
  ON CONFLICT (organization_id, entry_number) DO UPDATE SET entry_number = EXCLUDED.entry_number
  RETURNING id
),
je2 AS (
  INSERT INTO journal_entries (organization_id, entry_date, entry_number, description, status, posted_at)
  VALUES ('550e8400-e29b-41d4-a716-446655440000', CURRENT_DATE - INTERVAL '20 days', 'JE-002', 'Sales Revenue', 'posted', NOW() - INTERVAL '20 days')
  ON CONFLICT (organization_id, entry_number) DO UPDATE SET entry_number = EXCLUDED.entry_number
  RETURNING id
),
je3 AS (
  INSERT INTO journal_entries (organization_id, entry_date, entry_number, description, status, posted_at)
  VALUES ('550e8400-e29b-41d4-a716-446655440000', CURRENT_DATE - INTERVAL '15 days', 'JE-003', 'Rent Payment', 'posted', NOW() - INTERVAL '15 days')
  ON CONFLICT (organization_id, entry_number) DO UPDATE SET entry_number = EXCLUDED.entry_number
  RETURNING id
),
acc1 AS (SELECT id FROM accounts WHERE account_number = '1000' AND organization_id = '550e8400-e29b-41d4-a716-446655440000'),
acc2 AS (SELECT id FROM accounts WHERE account_number = '1200' AND organization_id = '550e8400-e29b-41d4-a716-446655440000'),
acc7 AS (SELECT id FROM accounts WHERE account_number = '3000' AND organization_id = '550e8400-e29b-41d4-a716-446655440000'),
acc9 AS (SELECT id FROM accounts WHERE account_number = '4000' AND organization_id = '550e8400-e29b-41d4-a716-446655440000'),
acc11 AS (SELECT id FROM accounts WHERE account_number = '6000' AND organization_id = '550e8400-e29b-41d4-a716-446655440000')
-- Insert Journal Entry Lines for JE-001
INSERT INTO journal_entry_lines (journal_entry_id, account_id, debit_amount, credit_amount, currency, line_number)
SELECT je1.id, acc1.id, 100000.00, 0, 'USD', 1 FROM je1, acc1
UNION ALL
SELECT je1.id, acc7.id, 0, 100000.00, 'USD', 2 FROM je1, acc7
UNION ALL
-- JE-002
SELECT je2.id, acc2.id, 50000.00, 0, 'USD', 1 FROM je2, acc2
UNION ALL
SELECT je2.id, acc9.id, 0, 50000.00, 'USD', 2 FROM je2, acc9
UNION ALL
-- JE-003
SELECT je3.id, acc11.id, 5000.00, 0, 'USD', 1 FROM je3, acc11
UNION ALL
SELECT je3.id, acc1.id, 0, 5000.00, 'USD', 2 FROM je3, acc1
ON CONFLICT DO NOTHING;

