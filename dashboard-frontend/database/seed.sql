-- Seed Data for KPI Dashboard Demo

-- Insert Demo User
INSERT INTO users (id, username, email, display_name, roles, is_active) VALUES
('u0000000-0000-0000-0000-000000000001', 'demo', 'demo@example.com', 'Demo User', ARRAY['user', 'admin'], true)
ON CONFLICT (username) DO UPDATE SET 
  display_name = EXCLUDED.display_name,
  roles = EXCLUDED.roles,
  updated_at = NOW();

-- Insert Demo Dashboard
INSERT INTO dashboards (id, name, description, owner_id, layout, is_public, is_active) VALUES
('d0000000-0000-0000-0000-000000000001', 'Executive Dashboard', 'High-level KPIs and metrics', 'u0000000-0000-0000-0000-000000000001', '[]', true, true)
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  updated_at = NOW();

-- Insert Demo Data Source
INSERT INTO data_sources (id, name, type, connection_string, is_active) VALUES
('ds000000-0000-0000-0000-000000000001', 'Bookkeeping Integration', 'api', 'https://international-bookkeeping.vercel.app/api', true)
ON CONFLICT (name) DO UPDATE SET 
  connection_string = EXCLUDED.connection_string,
  updated_at = NOW();

-- Insert Demo KPIs
INSERT INTO kpis (id, dashboard_id, name, description, data_source, unit, display_format, is_active) VALUES
('k0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'Total Revenue', 'Year-to-date revenue', 'bookkeeping', 'USD', 'currency', true),
('k0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000001', 'Active Users', 'Number of active users', 'internal', 'users', 'number', true),
('k0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000001', 'Profit Margin', 'Net profit as percentage of revenue', 'calculated', '%', 'percentage', true)
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  updated_at = NOW();

-- Insert Sample KPI Values (last 30 days)
INSERT INTO kpi_values (kpi_id, timestamp, value)
SELECT 
  'k0000000-0000-0000-0000-000000000001',
  NOW() - (i || ' days')::INTERVAL,
  50000 + (random() * 10000)::DECIMAL(19,4)
FROM generate_series(30, 0, -1) AS i
ON CONFLICT DO NOTHING;

INSERT INTO kpi_values (kpi_id, timestamp, value)
SELECT 
  'k0000000-0000-0000-0000-000000000002',
  NOW() - (i || ' days')::INTERVAL,
  100 + (random() * 50)::DECIMAL(19,4)
FROM generate_series(30, 0, -1) AS i
ON CONFLICT DO NOTHING;

INSERT INTO kpi_values (kpi_id, timestamp, value)
SELECT 
  'k0000000-0000-0000-0000-000000000003',
  NOW() - (i || ' days')::INTERVAL,
  15 + (random() * 10)::DECIMAL(19,4)
FROM generate_series(30, 0, -1) AS i
ON CONFLICT DO NOTHING;



