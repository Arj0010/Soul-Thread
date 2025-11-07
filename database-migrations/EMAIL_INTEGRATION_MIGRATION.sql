-- Email Integration Migration for SoulThread
-- Run this in Supabase SQL Editor

-- ============================================
-- 1. Email Preferences Table
-- ============================================
CREATE TABLE IF NOT EXISTS email_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Email settings
  email_enabled BOOLEAN DEFAULT false,
  email_frequency VARCHAR(20) DEFAULT 'daily' CHECK (email_frequency IN ('daily', 'weekly', 'never')),
  delivery_time VARCHAR(20) DEFAULT 'morning' CHECK (delivery_time IN ('morning', 'afternoon', 'evening')),
  delivery_hour INTEGER DEFAULT 9 CHECK (delivery_hour >= 0 AND delivery_hour <= 23),
  timezone VARCHAR(50) DEFAULT 'UTC',

  -- Content preferences
  topics JSONB DEFAULT '["technology"]'::jsonb,
  preferred_sources JSONB DEFAULT '["reddit", "hackernews", "github", "perplexity"]'::jsonb,
  content_length VARCHAR(20) DEFAULT 'medium' CHECK (content_length IN ('short', 'medium', 'long')),
  max_items INTEGER DEFAULT 8 CHECK (max_items >= 3 AND max_items <= 15),

  -- Generation preferences
  use_ai_generation BOOLEAN DEFAULT false,
  include_images BOOLEAN DEFAULT true,
  include_commentary BOOLEAN DEFAULT true,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_email_sent_at TIMESTAMP WITH TIME ZONE,

  UNIQUE(user_id)
);

-- ============================================
-- 2. Email Delivery Log Table
-- ============================================
CREATE TABLE IF NOT EXISTS email_delivery_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Email details
  email_to VARCHAR(255) NOT NULL,
  subject_line TEXT NOT NULL,
  newsletter_id UUID, -- Reference to saved draft if applicable

  -- Delivery status
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'bounced', 'opened', 'clicked')),
  provider_message_id VARCHAR(255), -- Resend message ID
  error_message TEXT,

  -- Content metadata
  news_items_count INTEGER DEFAULT 0,
  generation_method VARCHAR(20) DEFAULT 'template' CHECK (generation_method IN ('template', 'ai')),
  data_sources JSONB, -- Array of sources used: ["reddit", "perplexity", etc]

  -- Engagement tracking
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  unsubscribed_at TIMESTAMP WITH TIME ZONE,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_at TIMESTAMP WITH TIME ZONE,

  -- Indexes for queries
  INDEX idx_email_delivery_user (user_id),
  INDEX idx_email_delivery_status (status),
  INDEX idx_email_delivery_sent (sent_at)
);

-- ============================================
-- 3. Email Schedule Queue Table
-- ============================================
CREATE TABLE IF NOT EXISTS email_schedule_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Schedule details
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),

  -- Retry logic
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  last_error TEXT,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,

  -- Indexes
  INDEX idx_email_queue_scheduled (scheduled_for, status),
  INDEX idx_email_queue_user (user_id)
);

-- ============================================
-- 4. News Cache Table (Perplexity & Others)
-- ============================================
CREATE TABLE IF NOT EXISTS news_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Cache key
  source VARCHAR(50) NOT NULL, -- 'perplexity', 'reddit', 'hackernews', etc
  topic VARCHAR(100) NOT NULL,
  cache_key VARCHAR(255) NOT NULL, -- Unique key for this query

  -- Content
  news_items JSONB NOT NULL,
  item_count INTEGER DEFAULT 0,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  fetch_duration_ms INTEGER,

  UNIQUE(cache_key),
  INDEX idx_news_cache_expiry (expires_at),
  INDEX idx_news_cache_source (source, topic)
);

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================

-- Email Preferences RLS
ALTER TABLE email_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own email preferences" ON email_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own email preferences" ON email_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own email preferences" ON email_preferences
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own email preferences" ON email_preferences
  FOR DELETE USING (auth.uid() = user_id);

-- Email Delivery Log RLS
ALTER TABLE email_delivery_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own email delivery log" ON email_delivery_log
  FOR SELECT USING (auth.uid() = user_id);

-- Email Queue RLS (Admin only for write, users can read their own)
ALTER TABLE email_schedule_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own email queue" ON email_schedule_queue
  FOR SELECT USING (auth.uid() = user_id);

-- News Cache RLS (Public read, service write)
ALTER TABLE news_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read news cache" ON news_cache
  FOR SELECT USING (true);

-- ============================================
-- Functions & Triggers
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for email_preferences
CREATE TRIGGER update_email_preferences_updated_at
  BEFORE UPDATE ON email_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to clean expired news cache
CREATE OR REPLACE FUNCTION clean_expired_news_cache()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM news_cache WHERE expires_at < NOW();
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to schedule next email for user
CREATE OR REPLACE FUNCTION schedule_next_email(p_user_id UUID)
RETURNS UUID AS $$
DECLARE
  v_schedule_id UUID;
  v_next_time TIMESTAMP WITH TIME ZONE;
  v_delivery_hour INTEGER;
  v_timezone VARCHAR(50);
BEGIN
  -- Get user's preferences
  SELECT delivery_hour, timezone INTO v_delivery_hour, v_timezone
  FROM email_preferences
  WHERE user_id = p_user_id AND email_enabled = true;

  -- Calculate next delivery time (tomorrow at delivery_hour in user's timezone)
  v_next_time := (NOW() AT TIME ZONE v_timezone + INTERVAL '1 day')::DATE
                 + (v_delivery_hour || ' hours')::INTERVAL;

  -- Insert into queue
  INSERT INTO email_schedule_queue (user_id, scheduled_for)
  VALUES (p_user_id, v_next_time)
  RETURNING id INTO v_schedule_id;

  RETURN v_schedule_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Initial Data & Indexes
-- ============================================

-- Create composite indexes for performance
CREATE INDEX IF NOT EXISTS idx_email_log_user_sent
  ON email_delivery_log(user_id, sent_at DESC);

CREATE INDEX IF NOT EXISTS idx_email_preferences_enabled
  ON email_preferences(email_enabled) WHERE email_enabled = true;

-- ============================================
-- Views for Analytics
-- ============================================

-- View: Email delivery stats per user
CREATE OR REPLACE VIEW user_email_stats AS
SELECT
  user_id,
  COUNT(*) as total_emails,
  COUNT(*) FILTER (WHERE status = 'sent') as sent_count,
  COUNT(*) FILTER (WHERE status = 'failed') as failed_count,
  COUNT(*) FILTER (WHERE opened_at IS NOT NULL) as opened_count,
  COUNT(*) FILTER (WHERE clicked_at IS NOT NULL) as clicked_count,
  ROUND(
    COUNT(*) FILTER (WHERE opened_at IS NOT NULL)::NUMERIC /
    NULLIF(COUNT(*) FILTER (WHERE status = 'sent'), 0) * 100,
    2
  ) as open_rate_percent,
  MAX(sent_at) as last_email_sent,
  MIN(sent_at) as first_email_sent
FROM email_delivery_log
GROUP BY user_id;

-- Grant permissions
GRANT SELECT ON user_email_stats TO authenticated;

-- ============================================
-- Migration Complete
-- ============================================

-- Verify tables
SELECT
  tablename,
  schemaname
FROM pg_tables
WHERE tablename IN (
  'email_preferences',
  'email_delivery_log',
  'email_schedule_queue',
  'news_cache'
)
ORDER BY tablename;
