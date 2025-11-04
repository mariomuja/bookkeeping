-- International Bookkeeping System Database Schema
-- PostgreSQL + TimescaleDB
-- Supports: Double-entry accounting, Multi-currency, Timezones, Millions of bookings

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- ============================================================================
-- ORGANIZATIONS & COMPANIES
-- ============================================================================

CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    country_code VARCHAR(3) NOT NULL,
    default_currency VARCHAR(3) NOT NULL,
    default_timezone VARCHAR(50) NOT NULL DEFAULT 'UTC',
    fiscal_year_start INTEGER NOT NULL DEFAULT 1, -- Month (1-12)
    fiscal_year_end INTEGER NOT NULL DEFAULT 12,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_active BOOLEAN NOT NULL DEFAULT true
);

CREATE INDEX idx_organizations_active ON organizations(is_active);

-- ============================================================================
-- FISCAL PERIODS
-- ============================================================================

CREATE TABLE fiscal_periods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    period_name VARCHAR(100) NOT NULL, -- e.g., "2024 Q1", "January 2024"
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    fiscal_year INTEGER NOT NULL,
    is_closed BOOLEAN NOT NULL DEFAULT false,
    closed_at TIMESTAMPTZ,
    closed_by VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_fiscal_periods_org FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

CREATE INDEX idx_fiscal_periods_org ON fiscal_periods(organization_id);
CREATE INDEX idx_fiscal_periods_year ON fiscal_periods(fiscal_year);
CREATE INDEX idx_fiscal_periods_dates ON fiscal_periods(start_date, end_date);

-- ============================================================================
-- CURRENCIES & EXCHANGE RATES
-- ============================================================================

CREATE TABLE currencies (
    code VARCHAR(3) PRIMARY KEY, -- ISO 4217
    name VARCHAR(100) NOT NULL,
    symbol VARCHAR(10),
    decimal_places INTEGER NOT NULL DEFAULT 2,
    is_active BOOLEAN NOT NULL DEFAULT true
);

-- Exchange rates for multi-currency support
CREATE TABLE exchange_rates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    from_currency VARCHAR(3) NOT NULL REFERENCES currencies(code),
    to_currency VARCHAR(3) NOT NULL REFERENCES currencies(code),
    rate NUMERIC(20, 10) NOT NULL,
    effective_date DATE NOT NULL,
    source VARCHAR(100), -- e.g., "ECB", "Manual"
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_exchange_rates_currencies ON exchange_rates(from_currency, to_currency, effective_date DESC);

-- ============================================================================
-- CHART OF ACCOUNTS (DATEV-style account structure)
-- ============================================================================

CREATE TABLE account_types (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE'
    normal_balance VARCHAR(10) NOT NULL CHECK (normal_balance IN ('DEBIT', 'CREDIT')),
    is_balance_sheet BOOLEAN NOT NULL, -- true for balance sheet, false for P&L
    display_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    account_number VARCHAR(50) NOT NULL, -- e.g., "1000", "8400" (DATEV-style)
    account_name VARCHAR(255) NOT NULL,
    account_type_id INTEGER NOT NULL REFERENCES account_types(id),
    parent_account_id UUID REFERENCES accounts(id), -- For hierarchical structure
    currency VARCHAR(3) NOT NULL REFERENCES currencies(code),
    description TEXT,
    is_system_account BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    tax_code VARCHAR(50), -- VAT/Tax codes
    cost_center VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_account_number_per_org UNIQUE (organization_id, account_number)
);

CREATE INDEX idx_accounts_org ON accounts(organization_id);
CREATE INDEX idx_accounts_number ON accounts(account_number);
CREATE INDEX idx_accounts_type ON accounts(account_type_id);
CREATE INDEX idx_accounts_parent ON accounts(parent_account_id);
CREATE INDEX idx_accounts_active ON accounts(is_active);

-- ============================================================================
-- JOURNAL ENTRIES (BOOKINGS) - Double Entry System
-- ============================================================================

CREATE TABLE journal_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    entry_number VARCHAR(100) NOT NULL, -- Sequential booking number
    entry_date DATE NOT NULL, -- Business date
    entry_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(), -- Actual creation time with timezone
    fiscal_period_id UUID REFERENCES fiscal_periods(id),
    description TEXT NOT NULL,
    reference_number VARCHAR(100), -- External reference (invoice #, etc.)
    document_type VARCHAR(50), -- 'INVOICE', 'PAYMENT', 'JOURNAL', etc.
    source VARCHAR(50) NOT NULL, -- 'MANUAL', 'IMPORT_CSV', 'IMPORT_EXCEL', etc.
    currency VARCHAR(3) NOT NULL REFERENCES currencies(code),
    exchange_rate NUMERIC(20, 10) DEFAULT 1.0,
    base_currency VARCHAR(3) NOT NULL, -- Organization base currency
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'POSTED', 'VOID')),
    posted_at TIMESTAMPTZ,
    posted_by VARCHAR(255),
    void_reason TEXT,
    voided_at TIMESTAMPTZ,
    voided_by VARCHAR(255),
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_entry_number_per_org UNIQUE (organization_id, entry_number)
);

-- Convert to hypertable for TimescaleDB optimization
SELECT create_hypertable('journal_entries', 'entry_timestamp', 
    chunk_time_interval => INTERVAL '1 month',
    if_not_exists => TRUE);

-- Indexes for fast queries
CREATE INDEX idx_journal_entries_org ON journal_entries(organization_id, entry_timestamp DESC);
CREATE INDEX idx_journal_entries_date ON journal_entries(entry_date);
CREATE INDEX idx_journal_entries_number ON journal_entries(entry_number);
CREATE INDEX idx_journal_entries_status ON journal_entries(status);
CREATE INDEX idx_journal_entries_period ON journal_entries(fiscal_period_id);
CREATE INDEX idx_journal_entries_reference ON journal_entries(reference_number);

-- ============================================================================
-- JOURNAL ENTRY LINES (Double-entry debit/credit lines)
-- ============================================================================

CREATE TABLE journal_entry_lines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    journal_entry_id UUID NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
    line_number INTEGER NOT NULL,
    account_id UUID NOT NULL REFERENCES accounts(id),
    debit_amount NUMERIC(20, 2) DEFAULT 0.00,
    credit_amount NUMERIC(20, 2) DEFAULT 0.00,
    debit_base_amount NUMERIC(20, 2) DEFAULT 0.00, -- In organization base currency
    credit_base_amount NUMERIC(20, 2) DEFAULT 0.00,
    description TEXT,
    cost_center VARCHAR(50),
    tax_code VARCHAR(50),
    tax_amount NUMERIC(20, 2) DEFAULT 0.00,
    CONSTRAINT check_debit_credit CHECK (
        (debit_amount > 0 AND credit_amount = 0) OR 
        (credit_amount > 0 AND debit_amount = 0)
    ),
    CONSTRAINT unique_line_per_entry UNIQUE (journal_entry_id, line_number)
);

CREATE INDEX idx_journal_lines_entry ON journal_entry_lines(journal_entry_id);
CREATE INDEX idx_journal_lines_account ON journal_entry_lines(account_id);

-- ============================================================================
-- ACCOUNT BALANCES - Materialized for fast reporting
-- ============================================================================

CREATE TABLE account_balances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    fiscal_period_id UUID NOT NULL REFERENCES fiscal_periods(id) ON DELETE CASCADE,
    period_start_date DATE NOT NULL,
    period_end_date DATE NOT NULL,
    opening_balance NUMERIC(20, 2) NOT NULL DEFAULT 0.00,
    debit_total NUMERIC(20, 2) NOT NULL DEFAULT 0.00,
    credit_total NUMERIC(20, 2) NOT NULL DEFAULT 0.00,
    closing_balance NUMERIC(20, 2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(3) NOT NULL,
    last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_balance_per_period UNIQUE (account_id, fiscal_period_id)
);

CREATE INDEX idx_account_balances_org ON account_balances(organization_id);
CREATE INDEX idx_account_balances_account ON account_balances(account_id);
CREATE INDEX idx_account_balances_period ON account_balances(fiscal_period_id);

-- ============================================================================
-- IMPORT JOBS - Track data imports
-- ============================================================================

CREATE TABLE import_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    job_name VARCHAR(255) NOT NULL,
    import_type VARCHAR(50) NOT NULL, -- 'CSV', 'EXCEL', 'JSON', 'DATABASE'
    file_name VARCHAR(255),
    file_size_bytes BIGINT,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED')),
    total_records INTEGER,
    processed_records INTEGER DEFAULT 0,
    failed_records INTEGER DEFAULT 0,
    error_message TEXT,
    mapping_config JSONB, -- Field mapping configuration
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_import_jobs_org ON import_jobs(organization_id);
CREATE INDEX idx_import_jobs_status ON import_jobs(status);
CREATE INDEX idx_import_jobs_created ON import_jobs(created_at DESC);

-- ============================================================================
-- CONTINUOUS AGGREGATES (TimescaleDB) - For ultra-fast reporting
-- ============================================================================

-- Monthly account summary
CREATE MATERIALIZED VIEW account_monthly_summary
WITH (timescaledb.continuous) AS
SELECT
    time_bucket('1 month', je.entry_timestamp) AS month,
    je.organization_id,
    jel.account_id,
    a.account_number,
    a.account_name,
    je.currency,
    SUM(jel.debit_amount) AS total_debits,
    SUM(jel.credit_amount) AS total_credits,
    SUM(jel.debit_base_amount) AS total_debits_base,
    SUM(jel.credit_base_amount) AS total_credits_base,
    COUNT(*) AS transaction_count
FROM journal_entries je
JOIN journal_entry_lines jel ON je.id = jel.journal_entry_id
JOIN accounts a ON jel.account_id = a.id
WHERE je.status = 'POSTED'
GROUP BY month, je.organization_id, jel.account_id, a.account_number, a.account_name, je.currency
WITH NO DATA;

-- Add refresh policy (refresh every day)
SELECT add_continuous_aggregate_policy('account_monthly_summary',
    start_offset => INTERVAL '3 months',
    end_offset => INTERVAL '1 hour',
    schedule_interval => INTERVAL '1 day',
    if_not_exists => TRUE);

-- Daily transaction summary
CREATE MATERIALIZED VIEW daily_transaction_summary
WITH (timescaledb.continuous) AS
SELECT
    time_bucket('1 day', je.entry_timestamp) AS day,
    je.organization_id,
    je.currency,
    COUNT(*) AS entry_count,
    SUM(jel.debit_amount) AS total_debits,
    SUM(jel.credit_amount) AS total_credits
FROM journal_entries je
JOIN journal_entry_lines jel ON je.id = jel.journal_entry_id
WHERE je.status = 'POSTED'
GROUP BY day, je.organization_id, je.currency
WITH NO DATA;

SELECT add_continuous_aggregate_policy('daily_transaction_summary',
    start_offset => INTERVAL '1 month',
    end_offset => INTERVAL '1 hour',
    schedule_interval => INTERVAL '1 hour',
    if_not_exists => TRUE);

-- ============================================================================
-- SEED DATA - Account Types (DATEV-style structure)
-- ============================================================================

INSERT INTO account_types (code, name, category, normal_balance, is_balance_sheet, display_order) VALUES
-- Assets
('ASSET_CURRENT', 'Current Assets', 'ASSET', 'DEBIT', true, 100),
('ASSET_FIXED', 'Fixed Assets', 'ASSET', 'DEBIT', true, 200),
('ASSET_INTANGIBLE', 'Intangible Assets', 'ASSET', 'DEBIT', true, 300),
-- Liabilities
('LIABILITY_CURRENT', 'Current Liabilities', 'LIABILITY', 'CREDIT', true, 400),
('LIABILITY_LONG_TERM', 'Long-term Liabilities', 'LIABILITY', 'CREDIT', true, 500),
-- Equity
('EQUITY_CAPITAL', 'Share Capital', 'EQUITY', 'CREDIT', true, 600),
('EQUITY_RETAINED', 'Retained Earnings', 'EQUITY', 'CREDIT', true, 700),
-- Revenue
('REVENUE_SALES', 'Sales Revenue', 'REVENUE', 'CREDIT', false, 800),
('REVENUE_OTHER', 'Other Revenue', 'REVENUE', 'CREDIT', false, 850),
-- Expenses
('EXPENSE_COGS', 'Cost of Goods Sold', 'EXPENSE', 'DEBIT', false, 900),
('EXPENSE_OPERATING', 'Operating Expenses', 'EXPENSE', 'DEBIT', false, 1000),
('EXPENSE_FINANCIAL', 'Financial Expenses', 'EXPENSE', 'DEBIT', false, 1100),
('EXPENSE_TAX', 'Tax Expenses', 'EXPENSE', 'DEBIT', false, 1200);

-- Common currencies
INSERT INTO currencies (code, name, symbol, decimal_places) VALUES
('EUR', 'Euro', '€', 2),
('USD', 'US Dollar', '$', 2),
('GBP', 'British Pound', '£', 2),
('JPY', 'Japanese Yen', '¥', 0),
('CHF', 'Swiss Franc', 'CHF', 2),
('CAD', 'Canadian Dollar', 'C$', 2),
('AUD', 'Australian Dollar', 'A$', 2),
('CNY', 'Chinese Yuan', '¥', 2),
('INR', 'Indian Rupee', '₹', 2),
('MXN', 'Mexican Peso', '$', 2);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to validate double-entry balance
CREATE OR REPLACE FUNCTION validate_journal_entry_balance(p_journal_entry_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    total_debits NUMERIC(20, 2);
    total_credits NUMERIC(20, 2);
BEGIN
    SELECT 
        COALESCE(SUM(debit_amount), 0),
        COALESCE(SUM(credit_amount), 0)
    INTO total_debits, total_credits
    FROM journal_entry_lines
    WHERE journal_entry_id = p_journal_entry_id;
    
    RETURN ABS(total_debits - total_credits) < 0.01; -- Allow for rounding
END;
$$ LANGUAGE plpgsql;

-- Function to post a journal entry
CREATE OR REPLACE FUNCTION post_journal_entry(
    p_journal_entry_id UUID,
    p_posted_by VARCHAR(255)
)
RETURNS BOOLEAN AS $$
DECLARE
    is_balanced BOOLEAN;
    period_closed BOOLEAN;
BEGIN
    -- Validate balance
    is_balanced := validate_journal_entry_balance(p_journal_entry_id);
    
    IF NOT is_balanced THEN
        RAISE EXCEPTION 'Journal entry is not balanced';
    END IF;
    
    -- Check if period is closed
    SELECT fp.is_closed INTO period_closed
    FROM journal_entries je
    JOIN fiscal_periods fp ON je.fiscal_period_id = fp.id
    WHERE je.id = p_journal_entry_id;
    
    IF period_closed THEN
        RAISE EXCEPTION 'Cannot post to a closed fiscal period';
    END IF;
    
    -- Post the entry
    UPDATE journal_entries
    SET status = 'POSTED',
        posted_at = NOW(),
        posted_by = p_posted_by,
        updated_at = NOW()
    WHERE id = p_journal_entry_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate account balance for a date range
CREATE OR REPLACE FUNCTION calculate_account_balance(
    p_account_id UUID,
    p_start_date DATE,
    p_end_date DATE
)
RETURNS TABLE(
    opening_balance NUMERIC(20, 2),
    total_debits NUMERIC(20, 2),
    total_credits NUMERIC(20, 2),
    closing_balance NUMERIC(20, 2)
) AS $$
DECLARE
    v_normal_balance VARCHAR(10);
BEGIN
    -- Get account normal balance type
    SELECT at.normal_balance INTO v_normal_balance
    FROM accounts a
    JOIN account_types at ON a.account_type_id = at.id
    WHERE a.id = p_account_id;
    
    RETURN QUERY
    WITH balance_calc AS (
        SELECT
            COALESCE(SUM(CASE WHEN je.entry_date < p_start_date THEN jel.debit_amount - jel.credit_amount ELSE 0 END), 0) AS opening,
            COALESCE(SUM(CASE WHEN je.entry_date BETWEEN p_start_date AND p_end_date THEN jel.debit_amount ELSE 0 END), 0) AS debits,
            COALESCE(SUM(CASE WHEN je.entry_date BETWEEN p_start_date AND p_end_date THEN jel.credit_amount ELSE 0 END), 0) AS credits
        FROM journal_entry_lines jel
        JOIN journal_entries je ON jel.journal_entry_id = je.id
        WHERE jel.account_id = p_account_id
        AND je.status = 'POSTED'
        AND je.entry_date <= p_end_date
    )
    SELECT
        bc.opening,
        bc.debits,
        bc.credits,
        bc.opening + bc.debits - bc.credits
    FROM balance_calc bc;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- VIEWS FOR REPORTING
-- ============================================================================

-- Trial Balance View
CREATE OR REPLACE VIEW v_trial_balance AS
SELECT
    a.organization_id,
    a.id AS account_id,
    a.account_number,
    a.account_name,
    at.category AS account_category,
    at.normal_balance,
    je.fiscal_period_id,
    SUM(jel.debit_amount) AS total_debits,
    SUM(jel.credit_amount) AS total_credits,
    CASE 
        WHEN at.normal_balance = 'DEBIT' THEN SUM(jel.debit_amount) - SUM(jel.credit_amount)
        ELSE SUM(jel.credit_amount) - SUM(jel.debit_amount)
    END AS balance
FROM accounts a
JOIN account_types at ON a.account_type_id = at.id
LEFT JOIN journal_entry_lines jel ON a.id = jel.account_id
LEFT JOIN journal_entries je ON jel.journal_entry_id = je.id AND je.status = 'POSTED'
WHERE a.is_active = true
GROUP BY a.organization_id, a.id, a.account_number, a.account_name, at.category, at.normal_balance, je.fiscal_period_id;

-- Balance Sheet View
CREATE OR REPLACE VIEW v_balance_sheet AS
SELECT
    a.organization_id,
    je.fiscal_period_id,
    at.category,
    at.name AS account_type_name,
    a.account_number,
    a.account_name,
    CASE 
        WHEN at.normal_balance = 'DEBIT' THEN SUM(jel.debit_amount) - SUM(jel.credit_amount)
        ELSE SUM(jel.credit_amount) - SUM(jel.debit_amount)
    END AS balance
FROM accounts a
JOIN account_types at ON a.account_type_id = at.id
LEFT JOIN journal_entry_lines jel ON a.id = jel.account_id
LEFT JOIN journal_entries je ON jel.journal_entry_id = je.id AND je.status = 'POSTED'
WHERE a.is_active = true
AND at.is_balance_sheet = true
GROUP BY a.organization_id, je.fiscal_period_id, at.category, at.name, at.display_order, a.account_number, a.account_name
ORDER BY at.display_order, a.account_number;

-- Profit & Loss View
CREATE OR REPLACE VIEW v_profit_loss AS
SELECT
    a.organization_id,
    je.fiscal_period_id,
    at.category,
    at.name AS account_type_name,
    a.account_number,
    a.account_name,
    CASE 
        WHEN at.category = 'EXPENSE' THEN SUM(jel.debit_amount) - SUM(jel.credit_amount)
        ELSE SUM(jel.credit_amount) - SUM(jel.debit_amount)
    END AS amount
FROM accounts a
JOIN account_types at ON a.account_type_id = at.id
LEFT JOIN journal_entry_lines jel ON a.id = jel.account_id
LEFT JOIN journal_entries je ON jel.journal_entry_id = je.id AND je.status = 'POSTED'
WHERE a.is_active = true
AND at.is_balance_sheet = false
GROUP BY a.organization_id, je.fiscal_period_id, at.category, at.name, at.display_order, a.account_number, a.account_name
ORDER BY at.display_order, a.account_number;

-- Grant permissions (adjust as needed)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO bookkeeping_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO bookkeeping_user;
-- GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO bookkeeping_user;


