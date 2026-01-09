-- SoulThread Database Setup
-- Run this in Supabase SQL Editor

-- Step 1: Update drafts table
ALTER TABLE drafts ADD COLUMN IF NOT EXISTS title VARCHAR(255);
ALTER TABLE drafts ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'draft';
ALTER TABLE drafts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Step 2: Update existing drafts
UPDATE drafts 
SET title = 'Untitled Draft', 
    status = 'draft',
    updated_at = created_at
WHERE title IS NULL OR status IS NULL;

-- Step 3: Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_drafts_updated_at ON drafts;
CREATE TRIGGER update_drafts_updated_at
    BEFORE UPDATE ON drafts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Step 4: Verify setup
SELECT 'Database setup complete!' as status;

