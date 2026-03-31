-- ============================================================
-- Create system_settings table for storing app configuration
-- ============================================================

CREATE TABLE IF NOT EXISTS system_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create unique index on key for upsert operations
CREATE UNIQUE INDEX IF NOT EXISTS system_settings_key_idx ON system_settings(key);

-- Enable RLS
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all authenticated users to read system settings
CREATE POLICY "Allow authenticated read system_settings"
  ON system_settings FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Allow anonymous users to read system settings (for login page slides)
CREATE POLICY "Allow anon read system_settings"
  ON system_settings FOR SELECT
  TO anon
  USING (true);

-- Policy: Only super_admin and admin can insert/update system settings
CREATE POLICY "Allow admin insert system_settings"
  ON system_settings FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('super_admin', 'admin')
    )
  );

CREATE POLICY "Allow admin update system_settings"
  ON system_settings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('super_admin', 'admin')
    )
  );

-- Insert default login slides if not exists
INSERT INTO system_settings (key, value, description)
VALUES (
  'login_slides',
  '[{"image":"/slides/slide1.jpg","gradient":"from-green-800 via-green-900 to-emerald-900","title":"Back to School Loans","subtitle":"Apply for your loan today. Same day approval and payout guaranteed."},{"image":"/slides/slide2.jpg","gradient":"from-blue-800 via-blue-900 to-indigo-900","title":"Emergency Cash When You Need It","subtitle":"Quick loans for groceries, school fees, medical bills, or other expenses."}]',
  'Login page carousel slides configuration'
)
ON CONFLICT (key) DO NOTHING;
