import { createClient } from '@/lib/supabase/client';

export interface LeadsListParams {
  campaignId?: number;
  campaignIds?: number[];
  limit?: number;
}

export async function listLeads(params?: LeadsListParams) {
  const client = createClient();
  let query = client
    .from('leads')
    .select(`
      id, campaign_id, post_id, subreddit, username, title, content, score, post_url, created_at
    `)
    .order('created_at', { ascending: false });

  if (params?.campaignId) {
    query = query.eq('campaign_id', params.campaignId);
  } else if (params?.campaignIds?.length) {
    query = query.in('campaign_id', params.campaignIds);
  }

  const limit = params?.limit ?? 50;
  const { data, error } = await query.limit(limit);
  if (error) throw error;
  return data ?? [];
}

