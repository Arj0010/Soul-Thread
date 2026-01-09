-- =====================================================
-- SoulThread Community & Gamification Migration
-- Free tier compatible (Supabase PostgreSQL)
-- =====================================================

-- 1. Add public flag to existing drafts table
ALTER TABLE drafts ADD COLUMN IF NOT EXISTS public BOOLEAN DEFAULT false;
ALTER TABLE drafts ADD COLUMN IF NOT EXISTS upvotes INTEGER DEFAULT 0;

-- 2. Create trends cache table
CREATE TABLE IF NOT EXISTS trends_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  summary TEXT,
  url TEXT,
  source TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '1 hour'
);

-- Index for quick retrieval
CREATE INDEX IF NOT EXISTS idx_trends_cache_expires ON trends_cache(expires_at);

-- 3. Create user stats table for gamification
CREATE TABLE IF NOT EXISTS user_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  streak_count INTEGER DEFAULT 0,
  last_active DATE,
  total_drafts INTEGER DEFAULT 0,
  total_upvotes INTEGER DEFAULT 0,
  badges JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 4. Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draft_id UUID NOT NULL REFERENCES drafts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for efficient comment queries
CREATE INDEX IF NOT EXISTS idx_comments_draft ON comments(draft_id, created_at DESC);

-- 5. Create upvotes tracking table
CREATE TABLE IF NOT EXISTS draft_upvotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draft_id UUID NOT NULL REFERENCES drafts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(draft_id, user_id)
);

-- Index for quick upvote checks
CREATE INDEX IF NOT EXISTS idx_draft_upvotes_draft ON draft_upvotes(draft_id);
CREATE INDEX IF NOT EXISTS idx_draft_upvotes_user ON draft_upvotes(user_id);

-- 6. Create user profiles table (for public info)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- =====================================================
-- Row Level Security (RLS) Policies
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE trends_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE draft_upvotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Trends cache: Anyone can read, no one can write (app manages it)
CREATE POLICY "Anyone can read trends" ON trends_cache FOR SELECT USING (true);

-- User stats: Users can read their own, read others for leaderboard
CREATE POLICY "Users can read all stats" ON user_stats FOR SELECT USING (true);
CREATE POLICY "Users can update own stats" ON user_stats FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own stats" ON user_stats FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Comments: Anyone can read, authenticated users can create
CREATE POLICY "Anyone can read comments" ON comments FOR SELECT USING (true);
CREATE POLICY "Users can create comments" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own comments" ON comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON comments FOR DELETE USING (auth.uid() = user_id);

-- Upvotes: Anyone can read, users can manage their own
CREATE POLICY "Anyone can read upvotes" ON draft_upvotes FOR SELECT USING (true);
CREATE POLICY "Users can create upvotes" ON draft_upvotes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own upvotes" ON draft_upvotes FOR DELETE USING (auth.uid() = user_id);

-- User profiles: Anyone can read, users manage their own
CREATE POLICY "Anyone can read profiles" ON user_profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Update drafts RLS to allow public drafts to be read by anyone
DROP POLICY IF EXISTS "Users can view own drafts" ON drafts;
CREATE POLICY "Users can view own drafts or public drafts" ON drafts
  FOR SELECT USING (auth.uid() = user_id OR public = true);

-- =====================================================
-- Functions & Triggers
-- =====================================================

-- Function to update draft upvote count
CREATE OR REPLACE FUNCTION update_draft_upvote_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE drafts SET upvotes = upvotes + 1 WHERE id = NEW.draft_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE drafts SET upvotes = upvotes - 1 WHERE id = OLD.draft_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for upvote count
DROP TRIGGER IF EXISTS trigger_update_draft_upvotes ON draft_upvotes;
CREATE TRIGGER trigger_update_draft_upvotes
AFTER INSERT OR DELETE ON draft_upvotes
FOR EACH ROW EXECUTE FUNCTION update_draft_upvote_count();

-- Function to update user stats upvote count
CREATE OR REPLACE FUNCTION update_user_stats_upvotes()
RETURNS TRIGGER AS $$
DECLARE
  draft_owner_id UUID;
BEGIN
  IF TG_OP = 'INSERT' THEN
    SELECT user_id INTO draft_owner_id FROM drafts WHERE id = NEW.draft_id;
    UPDATE user_stats SET total_upvotes = total_upvotes + 1 WHERE user_id = draft_owner_id;
  ELSIF TG_OP = 'DELETE' THEN
    SELECT user_id INTO draft_owner_id FROM drafts WHERE id = OLD.draft_id;
    UPDATE user_stats SET total_upvotes = total_upvotes - 1 WHERE user_id = draft_owner_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for user stats upvotes
DROP TRIGGER IF EXISTS trigger_update_user_upvotes ON draft_upvotes;
CREATE TRIGGER trigger_update_user_upvotes
AFTER INSERT OR DELETE ON draft_upvotes
FOR EACH ROW EXECUTE FUNCTION update_user_stats_upvotes();

-- Function to clean expired trends
CREATE OR REPLACE FUNCTION clean_expired_trends()
RETURNS void AS $$
BEGIN
  DELETE FROM trends_cache WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Auto-update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_user_stats_updated_at ON user_stats;
CREATE TRIGGER update_user_stats_updated_at BEFORE UPDATE ON user_stats
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_comments_updated_at ON comments;
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Initial Data (Optional)
-- =====================================================

-- Grant necessary permissions (if needed on free tier)
-- Already handled by RLS policies

COMMENT ON TABLE trends_cache IS 'Cached trends from external APIs';
COMMENT ON TABLE user_stats IS 'User gamification stats and streaks';
COMMENT ON TABLE comments IS 'Comments on public drafts';
COMMENT ON TABLE draft_upvotes IS 'Upvotes tracking for drafts';
COMMENT ON TABLE user_profiles IS 'Public user profile information';
