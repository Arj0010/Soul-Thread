-- =====================================================
-- SoulThread Voice Profile (voicedna) Table Migration
-- Run this in Supabase SQL Editor
-- =====================================================

-- Create voicedna table if it doesn't exist
CREATE TABLE IF NOT EXISTS voicedna (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create index for efficient user lookups
CREATE INDEX IF NOT EXISTS idx_voicedna_user_id ON voicedna(user_id);

-- Enable Row Level Security
ALTER TABLE voicedna ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only read their own voice profile
CREATE POLICY "Users can read own voice profile" ON voicedna
  FOR SELECT USING (auth.uid() = user_id);

-- RLS Policy: Users can insert their own voice profile
CREATE POLICY "Users can insert own voice profile" ON voicedna
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can update their own voice profile
CREATE POLICY "Users can update own voice profile" ON voicedna
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policy: Users can delete their own voice profile
CREATE POLICY "Users can delete own voice profile" ON voicedna
  FOR DELETE USING (auth.uid() = user_id);

-- Create trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_voicedna_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_voicedna_updated_at_trigger ON voicedna;
CREATE TRIGGER update_voicedna_updated_at_trigger
    BEFORE UPDATE ON voicedna
    FOR EACH ROW
    EXECUTE FUNCTION update_voicedna_updated_at();

-- Verify setup
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'voicedna'
AND schemaname = 'public';

-- Show policies
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd
FROM pg_policies
WHERE tablename = 'voicedna'
AND schemaname = 'public';
