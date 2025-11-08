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

-- Insert Sample Accounts
INSERT INTO accounts (id, organization_id, account_number, account_name, account_type_id, currency, is_system_account, is_active) VALUES
('a1000000-0000-0000-0000-000000000001', '550e8400-e29b-41d4-a716-446655440000', '1000', 'Cash', 1, 'USD', false, true),
('a1000000-0000-0000-0000-000000000002', '550e8400-e29b-41d4-a716-446655440000', '1200', 'Accounts Receivable', 2, 'USD', false, true),
('a1000000-0000-0000-0000-000000000003', '550e8400-e29b-41d4-a716-446655440000', '1500', 'Inventory', 3, 'USD', false, true),
('a1000000-0000-0000-0000-000000000004', '550e8400-e29b-41d4-a716-446655440000', '1800', 'Equipment', 4, 'USD', false, true),
('a1000000-0000-0000-0000-000000000005', '550e8400-e29b-41d4-a716-446655440000', '2000', 'Accounts Payable', 5, 'USD', false, true),
('a1000000-0000-0000-0000-000000000006', '550e8400-e29b-41d4-a716-446655440000', '2500', 'Long-term Debt', 6, 'USD', false, true),
('a1000000-0000-0000-0000-000000000007', '550e8400-e29b-41d4-a716-446655440000', '3000', 'Owner Equity', 7, 'USD', true, true),
('a1000000-0000-0000-0000-000000000008', '550e8400-e29b-41d4-a716-446655440000', '3500', 'Retained Earnings', 8, 'USD', true, true),
('a1000000-0000-0000-0000-000000000009', '550e8400-e29b-41d4-a716-446655440000', '4000', 'Sales Revenue', 9, 'USD', false, true),
('a1000000-0000-0000-0000-000000000010', '550e8400-e29b-41d4-a716-446655440000', '5000', 'Cost of Goods Sold', 11, 'USD', false, true),
('a1000000-0000-0000-0000-000000000011', '550e8400-e29b-41d4-a716-446655440000', '6000', 'Rent Expense', 12, 'USD', false, true),
('a1000000-0000-0000-0000-000000000012', '550e8400-e29b-41d4-a716-446655440000', '6100', 'Utilities Expense', 12, 'USD', false, true),
('a1000000-0000-0000-0000-000000000013', '550e8400-e29b-41d4-a716-446655440000', '6200', 'Salaries Expense', 12, 'USD', false, true)
ON CONFLICT (organization_id, account_number) DO NOTHING;

-- Insert Sample Journal Entries
INSERT INTO journal_entries (id, organization_id, entry_date, entry_number, description, status, posted_at) VALUES
('j1000000-0000-0000-0000-000000000001', '550e8400-e29b-41d4-a716-446655440000', CURRENT_DATE - INTERVAL '30 days', 'JE-001', 'Initial Cash Investment', 'posted', NOW() - INTERVAL '30 days'),
('j1000000-0000-0000-0000-000000000002', '550e8400-e29b-41d4-a716-446655440000', CURRENT_DATE - INTERVAL '20 days', 'JE-002', 'Sales Revenue', 'posted', NOW() - INTERVAL '20 days'),
('j1000000-0000-0000-0000-000000000003', '550e8400-e29b-41d4-a716-446655440000', CURRENT_DATE - INTERVAL '15 days', 'JE-003', 'Rent Payment', 'posted', NOW() - INTERVAL '15 days')
ON CONFLICT (organization_id, entry_number) DO NOTHING;

-- Insert Journal Entry Lines
INSERT INTO journal_entry_lines (id, journal_entry_id, account_id, debit_amount, credit_amount, currency, line_number) VALUES
-- JE-001: Initial Investment (Debit Cash, Credit Equity)
('l1000000-0000-0000-0000-000000000001', 'j1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 100000.00, 0, 'USD', 1),
('l1000000-0000-0000-0000-000000000002', 'j1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000007', 0, 100000.00, 'USD', 2),
-- JE-002: Sales Revenue (Debit AR, Credit Revenue)
('l1000000-0000-0000-0000-000000000003', 'j1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000002', 50000.00, 0, 'USD', 1),
('l1000000-0000-0000-0000-000000000004', 'j1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000009', 0, 50000.00, 'USD', 2),
-- JE-003: Rent Payment (Debit Expense, Credit Cash)
('l1000000-0000-0000-0000-000000000005', 'j1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000011', 5000.00, 0, 'USD', 1),
('l1000000-0000-0000-0000-000000000006', 'j1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001', 0, 5000.00, 'USD', 2)
ON CONFLICT DO NOTHING;

