-- Database migration for enhanced drafts functionality
-- Run this in your Supabase SQL editor

-- Add new columns to existing drafts table
ALTER TABLE drafts ADD COLUMN IF NOT EXISTS title VARCHAR(255);
ALTER TABLE drafts ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'draft';
ALTER TABLE drafts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for drafts table
DROP TRIGGER IF EXISTS update_drafts_updated_at ON drafts;
CREATE TRIGGER update_drafts_updated_at
    BEFORE UPDATE ON drafts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create draft_versions table for version history
CREATE TABLE IF NOT EXISTS draft_versions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    draft_id UUID REFERENCES drafts(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    version_number INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Add RLS policies for draft_versions
ALTER TABLE draft_versions ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own draft versions
CREATE POLICY "Users can view their own draft versions" ON draft_versions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM drafts 
            WHERE drafts.id = draft_versions.draft_id 
            AND drafts.user_id = auth.uid()
        )
    );

-- Policy for users to insert their own draft versions
CREATE POLICY "Users can insert their own draft versions" ON draft_versions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM drafts 
            WHERE drafts.id = draft_versions.draft_id 
            AND drafts.user_id = auth.uid()
        )
    );

-- Policy for users to update their own draft versions
CREATE POLICY "Users can update their own draft versions" ON draft_versions
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM drafts 
            WHERE drafts.id = draft_versions.draft_id 
            AND drafts.user_id = auth.uid()
        )
    );

-- Policy for users to delete their own draft versions
CREATE POLICY "Users can delete their own draft versions" ON draft_versions
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM drafts 
            WHERE drafts.id = draft_versions.draft_id 
            AND drafts.user_id = auth.uid()
        )
    );

-- Create scheduled_newsletters table
CREATE TABLE IF NOT EXISTS scheduled_newsletters (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    draft_id UUID REFERENCES drafts(id) ON DELETE CASCADE,
    scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
    recurrence VARCHAR(50), -- 'none', 'weekly', 'monthly'
    status VARCHAR(50) DEFAULT 'scheduled', -- 'scheduled', 'sent', 'cancelled'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sent_at TIMESTAMP WITH TIME ZONE
);

-- Add RLS policies for scheduled_newsletters
ALTER TABLE scheduled_newsletters ENABLE ROW LEVEL SECURITY;

-- Policy for users to manage their own scheduled newsletters
CREATE POLICY "Users can manage their own scheduled newsletters" ON scheduled_newsletters
    FOR ALL USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_drafts_user_id ON drafts(user_id);
CREATE INDEX IF NOT EXISTS idx_drafts_status ON drafts(status);
CREATE INDEX IF NOT EXISTS idx_drafts_created_at ON drafts(created_at);
CREATE INDEX IF NOT EXISTS idx_drafts_updated_at ON drafts(updated_at);

CREATE INDEX IF NOT EXISTS idx_draft_versions_draft_id ON draft_versions(draft_id);
CREATE INDEX IF NOT EXISTS idx_draft_versions_created_at ON draft_versions(created_at);

CREATE INDEX IF NOT EXISTS idx_scheduled_newsletters_user_id ON scheduled_newsletters(user_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_newsletters_scheduled_for ON scheduled_newsletters(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_scheduled_newsletters_status ON scheduled_newsletters(status);

-- Update existing drafts with default values
UPDATE drafts 
SET title = 'Untitled Draft', 
    status = 'draft',
    updated_at = created_at
WHERE title IS NULL OR status IS NULL;

-- Create function to automatically create version when draft is updated
CREATE OR REPLACE FUNCTION create_draft_version()
RETURNS TRIGGER AS $$
BEGIN
    -- Only create version if content actually changed
    IF OLD.content IS DISTINCT FROM NEW.content THEN
        INSERT INTO draft_versions (draft_id, content, version_number, created_by)
        VALUES (
            NEW.id, 
            OLD.content, 
            COALESCE((SELECT MAX(version_number) FROM draft_versions WHERE draft_id = NEW.id), 0) + 1,
            NEW.user_id
        );
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for automatic versioning
DROP TRIGGER IF EXISTS create_draft_version_trigger ON drafts;
CREATE TRIGGER create_draft_version_trigger
    AFTER UPDATE ON drafts
    FOR EACH ROW
    EXECUTE FUNCTION create_draft_version();

-- Verify tables and policies
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename IN ('drafts', 'draft_versions', 'scheduled_newsletters')
AND schemaname = 'public';

-- Show policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename IN ('drafts', 'draft_versions', 'scheduled_newsletters')
AND schemaname = 'public';

