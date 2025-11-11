-- Bookkeeping Database Schema for Neon PostgreSQL

-- Organizations table
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  country_code VARCHAR(2) NOT NULL,
  default_currency VARCHAR(3) NOT NULL,
  default_timezone VARCHAR(50) NOT NULL,
  fiscal_year_start INTEGER NOT NULL,
  fiscal_year_end INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Account Types table
CREATE TABLE IF NOT EXISTS account_types (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE')),
  normal_balance VARCHAR(10) NOT NULL CHECK (normal_balance IN ('DEBIT', 'CREDIT')),
  is_balance_sheet BOOLEAN NOT NULL,
  display_order INTEGER NOT NULL
);

-- Accounts table
CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  account_number VARCHAR(50) NOT NULL,
  account_name VARCHAR(255) NOT NULL,
  account_type_id INTEGER NOT NULL REFERENCES account_types(id),
  parent_account_id UUID REFERENCES accounts(id),
  currency VARCHAR(3) NOT NULL,
  description TEXT,
  is_system_account BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  tax_code VARCHAR(50),
  cost_center VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(organization_id, account_number)
);

-- Journal Entries table
CREATE TABLE IF NOT EXISTS journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  entry_date DATE NOT NULL,
  entry_number VARCHAR(50),
  description TEXT NOT NULL,
  reference_number VARCHAR(100),
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'posted', 'void')),
  posted_at TIMESTAMP,
  posted_by VARCHAR(255),
  voided_at TIMESTAMP,
  voided_by VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(organization_id, entry_number)
);

-- Journal Entry Lines table
CREATE TABLE IF NOT EXISTS journal_entry_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journal_entry_id UUID NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES accounts(id),
  debit_amount DECIMAL(19, 4) DEFAULT 0,
  credit_amount DECIMAL(19, 4) DEFAULT 0,
  currency VARCHAR(3) NOT NULL,
  description TEXT,
  line_number INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Custom Field Definitions table
CREATE TABLE IF NOT EXISTS custom_field_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  field_name VARCHAR(100) NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  field_type VARCHAR(50) NOT NULL CHECK (field_type IN ('TEXT', 'NUMBER', 'DECIMAL', 'DATE', 'DATETIME', 'TIMESTAMP', 'BOOLEAN', 'SELECT')),
  description TEXT,
  formatting_template VARCHAR(255),
  select_options TEXT[], -- Array of string options for SELECT type
  validation_rules JSONB,
  is_required BOOLEAN DEFAULT false,
  is_searchable BOOLEAN DEFAULT false,
  is_filterable BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(organization_id, field_name)
);

-- Audit Log table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id VARCHAR(255) NOT NULL,
  username VARCHAR(255) NOT NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100) NOT NULL,
  entity_id VARCHAR(255),
  description TEXT NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  changes JSONB,
  timestamp TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_accounts_org_id ON accounts(organization_id);
CREATE INDEX IF NOT EXISTS idx_accounts_number ON accounts(account_number);
CREATE INDEX IF NOT EXISTS idx_accounts_type ON accounts(account_type_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_org_id ON journal_entries(organization_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_date ON journal_entries(entry_date);
CREATE INDEX IF NOT EXISTS idx_journal_entries_status ON journal_entries(status);
CREATE INDEX IF NOT EXISTS idx_journal_entry_lines_entry_id ON journal_entry_lines(journal_entry_id);
CREATE INDEX IF NOT EXISTS idx_journal_entry_lines_account_id ON journal_entry_lines(account_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_org_id ON audit_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);




