-- Projects: one per onboarding flow (website, company info, etc.)
CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  website TEXT,
  company_description TEXT,
  brand_variations JSONB DEFAULT '[]',
  competitors JSONB DEFAULT '[]',
  plan TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "User owns projects" ON projects;
CREATE POLICY "User owns projects" ON projects
  FOR ALL USING (auth.uid() = user_id);

-- Link campaigns to project (nullable for backward compatibility)
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS project_id INT REFERENCES projects(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_campaigns_project_id ON campaigns(project_id);
