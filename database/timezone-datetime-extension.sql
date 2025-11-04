-- Timezone and DateTime Extension for Custom Fields
-- Adds DATETIME and TIMESTAMP support with timezone handling

-- ============================================================================
-- UPDATE CUSTOM FIELD DEFINITIONS TO SUPPORT DATETIME
-- ============================================================================

-- Add new field types
ALTER TABLE custom_field_definitions 
DROP CONSTRAINT IF EXISTS custom_field_definitions_field_type_check;

ALTER TABLE custom_field_definitions 
ADD CONSTRAINT custom_field_definitions_field_type_check 
CHECK (field_type IN ('TEXT', 'NUMBER', 'DATE', 'DATETIME', 'TIMESTAMP', 'BOOLEAN', 'DECIMAL', 'SELECT'));

-- ============================================================================
-- TIMEZONE CONVERSION FUNCTIONS
-- ============================================================================

-- Function to convert timestamp to organization's timezone
CREATE OR REPLACE FUNCTION convert_to_org_timezone(
    p_timestamp TIMESTAMPTZ,
    p_organization_id UUID
)
RETURNS TIMESTAMP AS $$
DECLARE
    v_timezone VARCHAR(50);
BEGIN
    SELECT default_timezone INTO v_timezone
    FROM organizations
    WHERE id = p_organization_id;
    
    RETURN p_timestamp AT TIME ZONE COALESCE(v_timezone, 'UTC');
END;
$$ LANGUAGE plpgsql;

-- Function to format datetime for display
CREATE OR REPLACE FUNCTION format_datetime_for_org(
    p_timestamp TIMESTAMPTZ,
    p_organization_id UUID,
    p_format VARCHAR(50) DEFAULT 'YYYY-MM-DD HH24:MI:SS'
)
RETURNS TEXT AS $$
DECLARE
    v_timezone VARCHAR(50);
    v_local_time TIMESTAMP;
BEGIN
    SELECT default_timezone INTO v_timezone
    FROM organizations
    WHERE id = p_organization_id;
    
    v_local_time := p_timestamp AT TIME ZONE COALESCE(v_timezone, 'UTC');
    
    RETURN TO_CHAR(v_local_time, p_format) || ' ' || COALESCE(v_timezone, 'UTC');
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ENHANCED INSURANCE CUSTOM FIELDS WITH DATETIME
-- ============================================================================

-- Function to create datetime-enabled insurance fields
CREATE OR REPLACE FUNCTION create_insurance_datetime_fields(p_org_id UUID, p_created_by VARCHAR(255))
RETURNS VOID AS $$
DECLARE
    v_timezone VARCHAR(50);
BEGIN
    -- Get organization timezone
    SELECT default_timezone INTO v_timezone FROM organizations WHERE id = p_org_id;
    
    -- Policy Issue DateTime (when policy was issued)
    INSERT INTO custom_field_definitions (
        organization_id, field_name, display_name, field_type,
        is_required, is_searchable, is_filterable,
        description, display_order, created_by
    ) VALUES (
        p_org_id, 'policy_issue_datetime', 'Policy Issue Date & Time', 'DATETIME',
        false, true, true,
        'Date and time when the insurance policy was issued (in ' || v_timezone || ')',
        11, p_created_by
    ) ON CONFLICT (organization_id, field_name) DO NOTHING;

    -- Policy Effective DateTime (when coverage starts)
    INSERT INTO custom_field_definitions (
        organization_id, field_name, display_name, field_type,
        is_required, is_searchable, is_filterable,
        description, display_order, created_by
    ) VALUES (
        p_org_id, 'policy_effective_datetime', 'Policy Effective Date & Time', 'DATETIME',
        false, true, true,
        'Date and time when policy coverage becomes effective',
        12, p_created_by
    ) ON CONFLICT (organization_id, field_name) DO NOTHING;

    -- Policy Expiration DateTime
    INSERT INTO custom_field_definitions (
        organization_id, field_name, display_name, field_type,
        is_required, is_searchable, is_filterable,
        description, display_order, created_by
    ) VALUES (
        p_org_id, 'policy_expiration_datetime', 'Policy Expiration Date & Time', 'DATETIME',
        false, true, true,
        'Date and time when policy coverage expires',
        13, p_created_by
    ) ON CONFLICT (organization_id, field_name) DO NOTHING;

    -- Claim Reported DateTime (when claim was first reported)
    INSERT INTO custom_field_definitions (
        organization_id, field_name, display_name, field_type,
        is_required, is_searchable, is_filterable,
        description, display_order, created_by
    ) VALUES (
        p_org_id, 'claim_reported_datetime', 'Claim Reported Date & Time', 'DATETIME',
        false, true, true,
        'Date and time when the claim was reported to the insurance company',
        14, p_created_by
    ) ON CONFLICT (organization_id, field_name) DO NOTHING;

    -- Claim Occurred DateTime (actual accident/loss datetime)
    INSERT INTO custom_field_definitions (
        organization_id, field_name, display_name, field_type,
        is_required, is_searchable, is_filterable,
        description, display_order, created_by
    ) VALUES (
        p_org_id, 'claim_occurred_datetime', 'Claim Occurred Date & Time', 'DATETIME',
        true, true, true,
        'Date and time when the actual loss/accident occurred',
        15, p_created_by
    ) ON CONFLICT (organization_id, field_name) DO NOTHING;

    -- Claim Closed DateTime
    INSERT INTO custom_field_definitions (
        organization_id, field_name, display_name, field_type,
        is_required, is_searchable, is_filterable,
        description, display_order, created_by
    ) VALUES (
        p_org_id, 'claim_closed_datetime', 'Claim Closed Date & Time', 'DATETIME',
        false, true, true,
        'Date and time when the claim was closed',
        16, p_created_by
    ) ON CONFLICT (organization_id, field_name) DO NOTHING;

    -- Payment Processed DateTime
    INSERT INTO custom_field_definitions (
        organization_id, field_name, display_name, field_type,
        is_required, is_searchable, is_filterable,
        description, display_order, created_by
    ) VALUES (
        p_org_id, 'payment_processed_datetime', 'Payment Processed Date & Time', 'TIMESTAMP',
        false, true, true,
        'Exact timestamp when payment was processed',
        17, p_created_by
    ) ON CONFLICT (organization_id, field_name) DO NOTHING;

END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TIMEZONE-AWARE VIEWS
-- ============================================================================

-- View showing claims with timezone-converted datetimes
CREATE OR REPLACE VIEW v_claims_with_timezone AS
SELECT
    je.id AS entry_id,
    je.organization_id,
    je.entry_date,
    je.entry_timestamp,
    o.default_timezone,
    cf_claim.field_value AS claim_number,
    cf_occurred.field_value AS claim_occurred_raw,
    (cf_occurred.field_value::TIMESTAMPTZ AT TIME ZONE o.default_timezone) AS claim_occurred_local,
    cf_reported.field_value AS claim_reported_raw,
    (cf_reported.field_value::TIMESTAMPTZ AT TIME ZONE o.default_timezone) AS claim_reported_local,
    cf_closed.field_value AS claim_closed_raw,
    (cf_closed.field_value::TIMESTAMPTZ AT TIME ZONE o.default_timezone) AS claim_closed_local,
    EXTRACT(EPOCH FROM (
        COALESCE(cf_reported.field_value::TIMESTAMPTZ, je.entry_timestamp) - 
        cf_occurred.field_value::TIMESTAMPTZ
    )) / 3600 AS hours_to_report,
    je.status
FROM journal_entries je
JOIN organizations o ON je.organization_id = o.id
LEFT JOIN journal_entry_custom_fields cf_claim ON 
    je.id = cf_claim.journal_entry_id AND 
    EXISTS (SELECT 1 FROM custom_field_definitions cfd 
            WHERE cfd.id = cf_claim.field_definition_id 
            AND cfd.field_name = 'claim_number')
LEFT JOIN journal_entry_custom_fields cf_occurred ON 
    je.id = cf_occurred.journal_entry_id AND 
    EXISTS (SELECT 1 FROM custom_field_definitions cfd 
            WHERE cfd.id = cf_occurred.field_definition_id 
            AND cfd.field_name = 'claim_occurred_datetime')
LEFT JOIN journal_entry_custom_fields cf_reported ON 
    je.id = cf_reported.journal_entry_id AND 
    EXISTS (SELECT 1 FROM custom_field_definitions cfd 
            WHERE cfd.id = cf_reported.field_definition_id 
            AND cfd.field_name = 'claim_reported_datetime')
LEFT JOIN journal_entry_custom_fields cf_closed ON 
    je.id = cf_closed.journal_entry_id AND 
    EXISTS (SELECT 1 FROM custom_field_definitions cfd 
            WHERE cfd.id = cf_closed.field_definition_id 
            AND cfd.field_name = 'claim_closed_datetime')
WHERE cf_claim.field_value IS NOT NULL;

-- ============================================================================
-- EXAMPLE QUERIES
-- ============================================================================

-- Example: Get claims with reporting delay > 24 hours
-- SELECT * FROM v_claims_with_timezone WHERE hours_to_report > 24;

-- Example: Get claims by hour of day
-- SELECT EXTRACT(HOUR FROM claim_occurred_local) AS hour_of_day, COUNT(*) 
-- FROM v_claims_with_timezone 
-- GROUP BY hour_of_day 
-- ORDER BY hour_of_day;

COMMENT ON VIEW v_claims_with_timezone IS 
'Shows insurance claims with timezone-converted datetimes and calculated reporting delays';

