import { createClient } from '@/lib/supabase/client';

export interface Project {
  id: number;
  user_id: string;
  name: string;
  website: string | null;
  company_description: string | null;
  brand_variations: string[];
  competitors: string[];
  plan: string | null;
  created_at: string;
}

export interface CreateProjectInput {
  name: string;
  website?: string;
  company_description?: string;
  brand_variations?: string[];
  competitors?: string[];
  plan?: string;
}

export async function listProjects(): Promise<Project[]> {
  const client = createClient();
  const { data, error } = await client
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Project[];
}

export async function createProject(row: CreateProjectInput): Promise<Project> {
  const client = createClient();
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  const { data, error } = await client
    .from('projects')
    .insert({
      user_id: user.id,
      name: row.name,
      website: row.website ?? null,
      company_description: row.company_description ?? null,
      brand_variations: row.brand_variations ?? [],
      competitors: row.competitors ?? [],
      plan: row.plan ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return data as Project;
}
