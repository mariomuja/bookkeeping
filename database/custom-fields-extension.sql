-- Custom Fields Extension for Bookkeeping System
-- Allows organizations to define custom fields for journal entries

-- ============================================================================
-- CUSTOM FIELD DEFINITIONS
-- ============================================================================

CREATE TABLE custom_field_definitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    field_name VARCHAR(100) NOT NULL,
    display_name VARCHAR(200) NOT NULL,
    field_type VARCHAR(50) NOT NULL CHECK (field_type IN ('TEXT', 'NUMBER', 'DATE', 'BOOLEAN', 'DECIMAL', 'SELECT')),
    is_required BOOLEAN NOT NULL DEFAULT false,
    is_searchable BOOLEAN NOT NULL DEFAULT true,
    is_filterable BOOLEAN NOT NULL DEFAULT true,
    default_value TEXT,
    validation_rules JSONB, -- Format patterns, min/max values, etc.
    select_options JSONB, -- For SELECT type: ["Option1", "Option2"]
    display_order INTEGER NOT NULL DEFAULT 0,
    description TEXT,
    formatting_template VARCHAR(100), -- e.g., "POL-####-####" for policy numbers
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by VARCHAR(255) NOT NULL,
    CONSTRAINT unique_field_name_per_org UNIQUE (organization_id, field_name)
);

CREATE INDEX idx_custom_field_defs_org ON custom_field_definitions(organization_id);
CREATE INDEX idx_custom_field_defs_active ON custom_field_definitions(is_active);

-- ============================================================================
-- CUSTOM FIELD VALUES (Stored per journal entry)
-- ============================================================================

CREATE TABLE journal_entry_custom_fields (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    journal_entry_id UUID NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
    field_definition_id UUID NOT NULL REFERENCES custom_field_definitions(id) ON DELETE CASCADE,
    field_value TEXT, -- Stored as text, converted based on field_type
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_field_per_entry UNIQUE (journal_entry_id, field_definition_id)
);

CREATE INDEX idx_custom_fields_entry ON journal_entry_custom_fields(journal_entry_id);
CREATE INDEX idx_custom_fields_definition ON journal_entry_custom_fields(field_definition_id);
CREATE INDEX idx_custom_fields_value ON journal_entry_custom_fields(field_value);

-- ============================================================================
-- INSURANCE-SPECIFIC SAMPLE FIELD DEFINITIONS
-- ============================================================================

-- Function to create default insurance custom fields for an organization
CREATE OR REPLACE FUNCTION create_insurance_custom_fields(p_org_id UUID, p_created_by VARCHAR(255))
RETURNS VOID AS $$
BEGIN
    -- Policy Number
    INSERT INTO custom_field_definitions (
        organization_id, field_name, display_name, field_type, 
        is_required, is_searchable, is_filterable, 
        formatting_template, display_order, created_by, description
    ) VALUES (
        p_org_id, 'policy_number', 'Policy Number', 'TEXT',
        true, true, true,
        'POL-########', 1, p_created_by,
        'Individual insurance policy identifier'
    );

    -- Master Policy Number
    INSERT INTO custom_field_definitions (
        organization_id, field_name, display_name, field_type,
        is_required, is_searchable, is_filterable,
        formatting_template, display_order, created_by, description
    ) VALUES (
        p_org_id, 'master_policy_number', 'Master Policy Number', 'TEXT',
        false, true, true,
        'MP-######', 2, p_created_by,
        'Master policy for grouped policies'
    );

    -- Claim Number
    INSERT INTO custom_field_definitions (
        organization_id, field_name, display_name, field_type,
        is_required, is_searchable, is_filterable,
        formatting_template, display_order, created_by, description
    ) VALUES (
        p_org_id, 'claim_number', 'Claim Number', 'TEXT',
        false, true, true,
        'CLM-########', 3, p_created_by,
        'Individual claim identifier'
    );

    -- Master Claim Number
    INSERT INTO custom_field_definitions (
        organization_id, field_name, display_name, field_type,
        is_required, is_searchable, is_filterable,
        formatting_template, display_order, created_by, description
    ) VALUES (
        p_org_id, 'master_claim_number', 'Master Claim Number', 'TEXT',
        false, true, true,
        'MCL-######', 4, p_created_by,
        'Master claim for grouped claims'
    );

    -- Policy Type
    INSERT INTO custom_field_definitions (
        organization_id, field_name, display_name, field_type,
        is_required, is_searchable, is_filterable,
        select_options, display_order, created_by, description
    ) VALUES (
        p_org_id, 'policy_type', 'Policy Type', 'SELECT',
        true, true, true,
        '["Auto", "Home", "Life", "Health", "Business", "Liability"]'::jsonb,
        5, p_created_by,
        'Type of insurance policy'
    );

    -- Claim Status
    INSERT INTO custom_field_definitions (
        organization_id, field_name, display_name, field_type,
        is_required, is_searchable, is_filterable,
        select_options, display_order, created_by, description
    ) VALUES (
        p_org_id, 'claim_status', 'Claim Status', 'SELECT',
        false, true, true,
        '["Open", "Under Review", "Approved", "Denied", "Paid", "Closed"]'::jsonb,
        6, p_created_by,
        'Current status of the claim'
    );

    -- Premium Amount
    INSERT INTO custom_field_definitions (
        organization_id, field_name, display_name, field_type,
        is_required, is_searchable, is_filterable,
        validation_rules, display_order, created_by, description
    ) VALUES (
        p_org_id, 'premium_amount', 'Premium Amount', 'DECIMAL',
        false, false, true,
        '{"min": 0, "max": 1000000, "decimals": 2}'::jsonb,
        7, p_created_by,
        'Insurance premium amount'
    );

    -- Claim Amount
    INSERT INTO custom_field_definitions (
        organization_id, field_name, display_name, field_type,
        is_required, is_searchable, is_filterable,
        validation_rules, display_order, created_by, description
    ) VALUES (
        p_org_id, 'claim_amount', 'Claim Amount', 'DECIMAL',
        false, false, true,
        '{"min": 0, "max": 10000000, "decimals": 2}'::jsonb,
        8, p_created_by,
        'Insurance claim payout amount'
    );

    -- Policy Start Date
    INSERT INTO custom_field_definitions (
        organization_id, field_name, display_name, field_type,
        is_required, is_searchable, is_filterable,
        display_order, created_by, description
    ) VALUES (
        p_org_id, 'policy_start_date', 'Policy Start Date', 'DATE',
        false, false, true,
        9, p_created_by,
        'Policy effective start date'
    );

    -- Insured Party
    INSERT INTO custom_field_definitions (
        organization_id, field_name, display_name, field_type,
        is_required, is_searchable, is_filterable,
        display_order, created_by, description
    ) VALUES (
        p_org_id, 'insured_party', 'Insured Party', 'TEXT',
        false, true, true,
        10, p_created_by,
        'Name of the insured party'
    );

END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- AGGREGATION VIEWS FOR CUSTOM FIELDS
-- ============================================================================

-- View for policy aggregations
CREATE OR REPLACE VIEW v_policy_summary AS
SELECT
    je.organization_id,
    cf_policy.field_value AS policy_number,
    cf_master.field_value AS master_policy_number,
    cf_type.field_value AS policy_type,
    COUNT(DISTINCT je.id) AS entry_count,
    SUM(jel.debit_amount) AS total_debits,
    SUM(jel.credit_amount) AS total_credits,
    MIN(je.entry_date) AS first_entry_date,
    MAX(je.entry_date) AS last_entry_date
FROM journal_entries je
LEFT JOIN journal_entry_custom_fields cf_policy ON 
    je.id = cf_policy.journal_entry_id AND 
    EXISTS (SELECT 1 FROM custom_field_definitions cfd 
            WHERE cfd.id = cf_policy.field_definition_id 
            AND cfd.field_name = 'policy_number')
LEFT JOIN journal_entry_custom_fields cf_master ON 
    je.id = cf_master.journal_entry_id AND 
    EXISTS (SELECT 1 FROM custom_field_definitions cfd 
            WHERE cfd.id = cf_master.field_definition_id 
            AND cfd.field_name = 'master_policy_number')
LEFT JOIN journal_entry_custom_fields cf_type ON 
    je.id = cf_type.journal_entry_id AND 
    EXISTS (SELECT 1 FROM custom_field_definitions cfd 
            WHERE cfd.id = cf_type.field_definition_id 
            AND cfd.field_name = 'policy_type')
LEFT JOIN journal_entry_lines jel ON je.id = jel.journal_entry_id
WHERE je.status = 'POSTED'
GROUP BY je.organization_id, cf_policy.field_value, cf_master.field_value, cf_type.field_value;

-- View for claim aggregations
CREATE OR REPLACE VIEW v_claim_summary AS
SELECT
    je.organization_id,
    cf_claim.field_value AS claim_number,
    cf_master.field_value AS master_claim_number,
    cf_status.field_value AS claim_status,
    cf_policy.field_value AS policy_number,
    COUNT(DISTINCT je.id) AS entry_count,
    SUM(jel.credit_amount) AS total_claim_payments,
    MIN(je.entry_date) AS claim_date,
    MAX(je.entry_date) AS last_update_date
FROM journal_entries je
LEFT JOIN journal_entry_custom_fields cf_claim ON 
    je.id = cf_claim.journal_entry_id AND 
    EXISTS (SELECT 1 FROM custom_field_definitions cfd 
            WHERE cfd.id = cf_claim.field_definition_id 
            AND cfd.field_name = 'claim_number')
LEFT JOIN journal_entry_custom_fields cf_master ON 
    je.id = cf_master.journal_entry_id AND 
    EXISTS (SELECT 1 FROM custom_field_definitions cfd 
            WHERE cfd.id = cf_master.field_definition_id 
            AND cfd.field_name = 'master_claim_number')
LEFT JOIN journal_entry_custom_fields cf_status ON 
    je.id = cf_status.journal_entry_id AND 
    EXISTS (SELECT 1 FROM custom_field_definitions cfd 
            WHERE cfd.id = cf_status.field_definition_id 
            AND cfd.field_name = 'claim_status')
LEFT JOIN journal_entry_custom_fields cf_policy ON 
    je.id = cf_policy.journal_entry_id AND 
    EXISTS (SELECT 1 FROM custom_field_definitions cfd 
            WHERE cfd.id = cf_policy.field_definition_id 
            AND cfd.field_name = 'policy_number')
LEFT JOIN journal_entry_lines jel ON je.id = jel.journal_entry_id
WHERE je.status = 'POSTED'
  AND cf_claim.field_value IS NOT NULL
GROUP BY je.organization_id, cf_claim.field_value, cf_master.field_value, cf_status.field_value, cf_policy.field_value;

-- ============================================================================
-- SAMPLE DATA GENERATION FOR INSURANCE BOOKINGS
-- ============================================================================

-- Function to generate sample insurance bookings (call in batches)
CREATE OR REPLACE FUNCTION generate_insurance_sample_data(
    p_org_id UUID,
    p_batch_size INTEGER DEFAULT 10000,
    p_start_id INTEGER DEFAULT 1
)
RETURNS INTEGER AS $$
DECLARE
    v_entry_id UUID;
    v_policy_field_id UUID;
    v_master_policy_field_id UUID;
    v_claim_field_id UUID;
    v_master_claim_field_id UUID;
    v_policy_type_field_id UUID;
    v_claim_status_field_id UUID;
    v_premium_account_id UUID;
    v_cash_account_id UUID;
    v_claims_account_id UUID;
    v_claims_payable_account_id UUID;
    v_counter INTEGER;
    v_policy_types TEXT[] := ARRAY['Auto', 'Home', 'Life', 'Health', 'Business', 'Liability'];
    v_claim_statuses TEXT[] := ARRAY['Open', 'Under Review', 'Approved', 'Paid', 'Closed'];
    v_entry_date DATE;
    v_policy_num TEXT;
    v_claim_num TEXT;
    v_is_claim BOOLEAN;
    v_amount NUMERIC(20,2);
BEGIN
    -- Get field definition IDs
    SELECT id INTO v_policy_field_id 
    FROM custom_field_definitions 
    WHERE organization_id = p_org_id AND field_name = 'policy_number';
    
    SELECT id INTO v_master_policy_field_id 
    FROM custom_field_definitions 
    WHERE organization_id = p_org_id AND field_name = 'master_policy_number';
    
    SELECT id INTO v_claim_field_id 
    FROM custom_field_definitions 
    WHERE organization_id = p_org_id AND field_name = 'claim_number';
    
    SELECT id INTO v_policy_type_field_id 
    FROM custom_field_definitions 
    WHERE organization_id = p_org_id AND field_name = 'policy_type';
    
    SELECT id INTO v_claim_status_field_id 
    FROM custom_field_definitions 
    WHERE organization_id = p_org_id AND field_name = 'claim_status';
    
    -- Get account IDs (you'll need to create these accounts first)
    SELECT id INTO v_premium_account_id FROM accounts 
    WHERE organization_id = p_org_id AND account_number = '4000' LIMIT 1;
    
    SELECT id INTO v_cash_account_id FROM accounts 
    WHERE organization_id = p_org_id AND account_number = '1000' LIMIT 1;
    
    SELECT id INTO v_claims_account_id FROM accounts 
    WHERE organization_id = p_org_id AND account_number = '6000' LIMIT 1;
    
    SELECT id INTO v_claims_payable_account_id FROM accounts 
    WHERE organization_id = p_org_id AND account_number = '2000' LIMIT 1;
    
    -- Generate entries in batch
    FOR v_counter IN p_start_id..(p_start_id + p_batch_size - 1) LOOP
        -- Randomize if this is a premium or claim entry
        v_is_claim := (random() < 0.3); -- 30% are claims
        
        -- Generate date (spread over last 2 years)
        v_entry_date := CURRENT_DATE - (random() * 730)::INTEGER;
        
        -- Generate policy number
        v_policy_num := 'POL-' || LPAD(v_counter::TEXT, 8, '0');
        
        -- Generate amount
        IF v_is_claim THEN
            v_amount := (random() * 50000 + 1000)::NUMERIC(20,2);
        ELSE
            v_amount := (random() * 5000 + 100)::NUMERIC(20,2);
        END IF;
        
        -- Insert journal entry
        INSERT INTO journal_entries (
            organization_id, entry_number, entry_date, entry_timestamp,
            description, source, currency, base_currency, status,
            posted_at, posted_by, created_by
        ) VALUES (
            p_org_id,
            'JE-' || LPAD(v_counter::TEXT, 10, '0'),
            v_entry_date,
            v_entry_date::TIMESTAMP,
            CASE WHEN v_is_claim THEN 'Insurance Claim Payment' ELSE 'Premium Collection' END,
            'BULK_IMPORT',
            'USD',
            'USD',
            'POSTED',
            NOW(),
            'System',
            'System'
        ) RETURNING id INTO v_entry_id;
        
        -- Insert journal entry lines
        IF v_is_claim THEN
            -- Debit: Claims Expense
            INSERT INTO journal_entry_lines (
                journal_entry_id, line_number, account_id, 
                debit_amount, credit_amount, debit_base_amount, credit_base_amount
            ) VALUES (
                v_entry_id, 1, v_claims_account_id,
                v_amount, 0, v_amount, 0
            );
            
            -- Credit: Claims Payable / Cash
            INSERT INTO journal_entry_lines (
                journal_entry_id, line_number, account_id,
                debit_amount, credit_amount, debit_base_amount, credit_base_amount
            ) VALUES (
                v_entry_id, 2, v_claims_payable_account_id,
                0, v_amount, 0, v_amount
            );
            
            -- Add claim custom fields
            v_claim_num := 'CLM-' || LPAD(v_counter::TEXT, 8, '0');
            
            INSERT INTO journal_entry_custom_fields (journal_entry_id, field_definition_id, field_value)
            VALUES (v_entry_id, v_claim_field_id, v_claim_num);
            
            INSERT INTO journal_entry_custom_fields (journal_entry_id, field_definition_id, field_value)
            VALUES (v_entry_id, v_claim_status_field_id, v_claim_statuses[1 + floor(random() * 5)::INTEGER]);
            
        ELSE
            -- Debit: Cash
            INSERT INTO journal_entry_lines (
                journal_entry_id, line_number, account_id,
                debit_amount, credit_amount, debit_base_amount, credit_base_amount
            ) VALUES (
                v_entry_id, 1, v_cash_account_id,
                v_amount, 0, v_amount, 0
            );
            
            -- Credit: Premium Revenue
            INSERT INTO journal_entry_lines (
                journal_entry_id, line_number, account_id,
                debit_amount, credit_amount, debit_base_amount, credit_base_amount
            ) VALUES (
                v_entry_id, 2, v_premium_account_id,
                0, v_amount, 0, v_amount
            );
        END IF;
        
        -- Add policy custom fields (both premiums and claims have policies)
        INSERT INTO journal_entry_custom_fields (journal_entry_id, field_definition_id, field_value)
        VALUES (v_entry_id, v_policy_field_id, v_policy_num);
        
        INSERT INTO journal_entry_custom_fields (journal_entry_id, field_definition_id, field_value)
        VALUES (v_entry_id, v_policy_type_field_id, v_policy_types[1 + floor(random() * 6)::INTEGER]);
        
        -- Group policies into master policies (every 100 policies)
        IF v_counter % 100 = 0 THEN
            INSERT INTO journal_entry_custom_fields (journal_entry_id, field_definition_id, field_value)
            VALUES (v_entry_id, v_master_policy_field_id, 'MP-' || LPAD((v_counter / 100)::TEXT, 6, '0'));
        END IF;
        
    END LOOP;
    
    RETURN p_batch_size;
END;
$$ LANGUAGE plpgsql;

-- Example usage to generate 1 million records:
-- SELECT generate_insurance_sample_data('YOUR_ORG_ID', 10000, 1);
-- Repeat 100 times changing the start_id: 1, 10001, 20001, 30001, etc.
-- Or create a loop to call it 100 times

COMMENT ON FUNCTION generate_insurance_sample_data IS 
'Generates sample insurance bookings for testing. Call multiple times with different start_id values to generate 1M records.';

