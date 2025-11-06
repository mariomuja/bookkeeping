-- Session-Based Demo Isolation Schema for Bookkeeping App
-- This schema allows multiple demo users to have isolated data sandboxes

-- Demo Sessions Table
CREATE TABLE IF NOT EXISTS demo_sessions (
    session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    user_agent TEXT,
    ip_address VARCHAR(45)
);

-- Session-isolated Accounts
CREATE TABLE IF NOT EXISTS demo_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES demo_sessions(session_id) ON DELETE CASCADE,
    account_number VARCHAR(20) NOT NULL,
    account_name VARCHAR(255) NOT NULL,
    account_type_id INTEGER NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Session-isolated Journal Entries
CREATE TABLE IF NOT EXISTS demo_journal_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES demo_sessions(session_id) ON DELETE CASCADE,
    entry_number VARCHAR(50) NOT NULL,
    entry_date DATE NOT NULL,
    description TEXT,
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(20) DEFAULT 'DRAFT', -- DRAFT, POSTED, VOID
    posted_at TIMESTAMP,
    posted_by VARCHAR(255),
    voided_at TIMESTAMP,
    voided_by VARCHAR(255),
    void_reason TEXT,
    hash TEXT,
    hash_algorithm VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Session-isolated Journal Entry Lines
CREATE TABLE IF NOT EXISTS demo_journal_entry_lines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES demo_sessions(session_id) ON DELETE CASCADE,
    journal_entry_id UUID REFERENCES demo_journal_entries(id) ON DELETE CASCADE,
    account_id UUID REFERENCES demo_accounts(id),
    line_number INTEGER NOT NULL,
    description TEXT,
    debit_amount DECIMAL(15,2) DEFAULT 0,
    credit_amount DECIMAL(15,2) DEFAULT 0,
    cost_center VARCHAR(50),
    cost_object VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Session-isolated Custom Field Definitions
CREATE TABLE IF NOT EXISTS demo_custom_fields (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES demo_sessions(session_id) ON DELETE CASCADE,
    field_name VARCHAR(100) NOT NULL,
    field_type VARCHAR(20) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    is_required BOOLEAN DEFAULT FALSE,
    display_order INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_demo_sessions_expires ON demo_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_demo_sessions_active ON demo_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_demo_accounts_session ON demo_accounts(session_id);
CREATE INDEX IF NOT EXISTS idx_demo_journal_entries_session ON demo_journal_entries(session_id);
CREATE INDEX IF NOT EXISTS idx_demo_journal_lines_session ON demo_journal_entry_lines(session_id);
CREATE INDEX IF NOT EXISTS idx_demo_journal_lines_entry ON demo_journal_entry_lines(journal_entry_id);

-- Function to cleanup expired sessions (run via cron)
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS TABLE(deleted_count INTEGER, freed_records INTEGER) AS $$
DECLARE
    v_deleted_count INTEGER;
    v_freed_records INTEGER;
BEGIN
    -- Count records before deletion
    SELECT COUNT(*) INTO v_freed_records
    FROM demo_accounts
    WHERE session_id IN (
        SELECT session_id FROM demo_sessions
        WHERE expires_at < CURRENT_TIMESTAMP
    );
    
    -- Delete expired sessions (CASCADE will delete all related data)
    DELETE FROM demo_sessions
    WHERE expires_at < CURRENT_TIMESTAMP
    OR (last_accessed < CURRENT_TIMESTAMP - INTERVAL '24 hours' AND is_active = FALSE);
    
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    
    RETURN QUERY SELECT v_deleted_count, v_freed_records;
END;
$$ LANGUAGE plpgsql;

-- Function to initialize demo data for a new session
CREATE OR REPLACE FUNCTION initialize_demo_session(p_session_id UUID)
RETURNS VOID AS $$
DECLARE
    v_cash_account_id UUID;
    v_ar_account_id UUID;
    v_ap_account_id UUID;
    v_equity_account_id UUID;
    v_sales_account_id UUID;
    v_income_account_id UUID;
    v_cogs_account_id UUID;
    v_opex_account_id UUID;
    v_je1_id UUID;
    v_je2_id UUID;
    v_je3_id UUID;
    v_je4_id UUID;
BEGIN
    -- Create demo accounts
    INSERT INTO demo_accounts (id, session_id, account_number, account_name, account_type_id, currency)
    VALUES 
        (gen_random_uuid(), p_session_id, '1000', 'Cash', 1, 'USD') RETURNING id INTO v_cash_account_id;
    
    INSERT INTO demo_accounts (id, session_id, account_number, account_name, account_type_id, currency)
    VALUES 
        (gen_random_uuid(), p_session_id, '1200', 'Accounts Receivable', 1, 'USD') RETURNING id INTO v_ar_account_id;
    
    INSERT INTO demo_accounts (id, session_id, account_number, account_name, account_type_id, currency)
    VALUES 
        (gen_random_uuid(), p_session_id, '1500', 'Investments', 1, 'USD'),
        (gen_random_uuid(), p_session_id, '2000', 'Accounts Payable', 4, 'USD'),
        (gen_random_uuid(), p_session_id, '2100', 'Accrued Expenses', 4, 'USD'),
        (gen_random_uuid(), p_session_id, '3000', 'Owner Equity', 6, 'USD'),
        (gen_random_uuid(), p_session_id, '4000', 'Sales Revenue', 8, 'USD'),
        (gen_random_uuid(), p_session_id, '4100', 'Other Income', 8, 'USD'),
        (gen_random_uuid(), p_session_id, '6000', 'Cost of Services', 10, 'USD'),
        (gen_random_uuid(), p_session_id, '6100', 'Operating Expenses', 10, 'USD');
    
    -- Get account IDs for journal entries
    SELECT id INTO v_sales_account_id FROM demo_accounts 
    WHERE session_id = p_session_id AND account_number = '4000';
    
    SELECT id INTO v_income_account_id FROM demo_accounts 
    WHERE session_id = p_session_id AND account_number = '4100';
    
    SELECT id INTO v_cogs_account_id FROM demo_accounts 
    WHERE session_id = p_session_id AND account_number = '6000';
    
    SELECT id INTO v_opex_account_id FROM demo_accounts 
    WHERE session_id = p_session_id AND account_number = '6100';
    
    -- Create demo journal entries
    INSERT INTO demo_journal_entries (id, session_id, entry_number, entry_date, description, currency, status)
    VALUES 
        (gen_random_uuid(), p_session_id, 'JE-2024-001', '2024-01-15', 'Sales revenue for January', 'USD', 'POSTED') 
        RETURNING id INTO v_je1_id;
    
    INSERT INTO demo_journal_entries (id, session_id, entry_number, entry_date, description, currency, status)
    VALUES 
        (gen_random_uuid(), p_session_id, 'JE-2024-002', '2024-01-20', 'Other income received', 'USD', 'POSTED')
        RETURNING id INTO v_je2_id;
    
    INSERT INTO demo_journal_entries (id, session_id, entry_number, entry_date, description, currency, status)
    VALUES 
        (gen_random_uuid(), p_session_id, 'JE-2024-003', '2024-02-01', 'Cost of services', 'USD', 'POSTED')
        RETURNING id INTO v_je3_id;
    
    INSERT INTO demo_journal_entries (id, session_id, entry_number, entry_date, description, currency, status)
    VALUES 
        (gen_random_uuid(), p_session_id, 'JE-2024-004', '2024-02-15', 'Operating expenses - February', 'USD', 'POSTED')
        RETURNING id INTO v_je4_id;
    
    -- Create journal entry lines
    INSERT INTO demo_journal_entry_lines (session_id, journal_entry_id, account_id, line_number, description, debit_amount, credit_amount)
    VALUES 
        -- JE-2024-001: Sales revenue
        (p_session_id, v_je1_id, v_cash_account_id, 1, 'Cash received', 50000, 0),
        (p_session_id, v_je1_id, v_sales_account_id, 2, 'Sales revenue', 0, 50000),
        -- JE-2024-002: Other income
        (p_session_id, v_je2_id, v_cash_account_id, 1, 'Other income received', 5000, 0),
        (p_session_id, v_je2_id, v_income_account_id, 2, 'Other income', 0, 5000),
        -- JE-2024-003: Cost of services
        (p_session_id, v_je3_id, v_cogs_account_id, 1, 'Cost of services', 15000, 0),
        (p_session_id, v_je3_id, v_cash_account_id, 2, 'Cash paid for services', 0, 15000),
        -- JE-2024-004: Operating expenses
        (p_session_id, v_je4_id, v_opex_account_id, 1, 'Operating expenses', 8000, 0),
        (p_session_id, v_je4_id, v_cash_account_id, 2, 'Cash paid for expenses', 0, 8000);
END;
$$ LANGUAGE plpgsql;

-- View to get session statistics
CREATE OR REPLACE VIEW demo_session_stats AS
SELECT 
    ds.session_id,
    ds.created_at,
    ds.expires_at,
    ds.is_active,
    COUNT(DISTINCT da.id) as account_count,
    COUNT(DISTINCT dje.id) as journal_entry_count,
    COUNT(DISTINCT djel.id) as journal_line_count
FROM demo_sessions ds
LEFT JOIN demo_accounts da ON ds.session_id = da.session_id
LEFT JOIN demo_journal_entries dje ON ds.session_id = dje.session_id
LEFT JOIN demo_journal_entry_lines djel ON ds.session_id = djel.session_id
GROUP BY ds.session_id, ds.created_at, ds.expires_at, ds.is_active;

