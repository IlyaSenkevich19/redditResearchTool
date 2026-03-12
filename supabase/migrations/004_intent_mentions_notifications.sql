-- Contextual intent fields + mentions + notifications

-- 1) Extend leads with richer AI context
ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS intent_score INT,
  ADD COLUMN IF NOT EXISTS fit_score INT,
  ADD COLUMN IF NOT EXISTS is_noise BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS pain_tags JSONB DEFAULT '[]';

CREATE INDEX IF NOT EXISTS idx_leads_intent_score ON leads(intent_score DESC, created_at DESC);

-- 2) Mentions: brand & competitors per project
CREATE TABLE IF NOT EXISTS mentions (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  project_id INT REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('brand', 'competitor')),
  name TEXT NOT NULL,
  post_id TEXT NOT NULL,
  subreddit TEXT,
  username TEXT,
  title TEXT,
  content TEXT,
  score DECIMAL(5,2),
  post_url TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT mentions_project_post_kind_unique UNIQUE(project_id, post_id, kind)
);

CREATE INDEX IF NOT EXISTS idx_mentions_project_created ON mentions(project_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mentions_user_created ON mentions(user_id, created_at DESC);

ALTER TABLE mentions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "User owns mentions" ON mentions;
CREATE POLICY "User owns mentions" ON mentions
  FOR ALL USING (auth.uid() = user_id);

-- 3) In-app notifications (high-intent leads/mentions)
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  kind TEXT NOT NULL, -- e.g. 'lead_high_intent', 'mention_high_intent'
  payload JSONB DEFAULT '{}'::jsonb,
  channel TEXT DEFAULT 'in_app', -- future: 'email', 'slack'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id) WHERE read_at IS NULL;

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "User owns notifications" ON notifications;
CREATE POLICY "User owns notifications" ON notifications
  FOR ALL USING (auth.uid() = user_id);

