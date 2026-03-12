import { Injectable } from '@nestjs/common';
import { getSupabaseAdmin } from '../../lib/supabase-admin';

export interface Campaign {
  id: number;
  user_id: string;
  name: string;
  keywords: string[];
  subreddits: string[];
  score_threshold: number;
  is_active: boolean;
}

export interface Project {
  id: number;
  user_id: string;
  brand_variations: string[];
  competitors: string[];
}

@Injectable()
export class SupabaseService {
  private get client() {
    return getSupabaseAdmin();
  }

  async getActiveCampaigns(): Promise<Campaign[]> {
    const { data, error } = await this.client
      .from('campaigns')
      .select('id, user_id, name, keywords, subreddits, score_threshold, is_active')
      .eq('is_active', true);

    if (error) throw error;
    return (data ?? []).filter(
      (c) => Array.isArray(c.subreddits) && c.subreddits.length > 0 && Array.isArray(c.keywords) && c.keywords.length > 0,
    ) as Campaign[];
  }

  async insertLead(row: {
    campaign_id: number;
    post_id: string;
    subreddit: string;
    username: string;
    title: string;
    content?: string;
    score: number;
    post_url: string;
  }) {
    const { error } = await this.client.from('leads').upsert(row, {
      onConflict: 'campaign_id,post_id',
      ignoreDuplicates: true,
    });
    if (error) throw error;
  }

  async updateLeadScore(leadId: number, score: number) {
    const { error } = await this.client
      .from('leads')
      .update({ score })
      .eq('id', leadId);
    if (error) throw error;
  }

  async getLeadById(leadId: number) {
    const { data, error } = await this.client
      .from('leads')
      .select('id, campaign_id, title, content')
      .eq('id', leadId)
      .single();
    if (error) throw error;
    return data;
  }

  async getCampaignById(campaignId: number) {
    const { data, error } = await this.client
      .from('campaigns')
      .select('id, user_id')
      .eq('id', campaignId)
      .single();
    if (error) throw error;
    return data;
  }

  async getProjectById(projectId: number): Promise<Project | null> {
    const { data, error } = await this.client
      .from('projects')
      .select('id, user_id, brand_variations, competitors')
      .eq('id', projectId)
      .single();
    if (error) {
      // For safety, log and return null instead of throwing here to not break scans completely.
      // eslint-disable-next-line no-console
      console.error('getProjectById error', error);
      return null;
    }
    return data as Project;
  }

  async insertMention(row: {
    user_id: string;
    project_id: number;
    kind: 'brand' | 'competitor';
    name: string;
    post_id: string;
    subreddit?: string;
    username?: string;
    title?: string;
    content?: string;
    score?: number;
    post_url?: string;
  }) {
    const { error } = await this.client.from('mentions').upsert(
      {
        ...row,
      },
      {
        onConflict: 'project_id,post_id,kind',
        ignoreDuplicates: true,
      },
    );
    if (error) throw error;
  }

  async createNotification(row: {
    user_id: string;
    kind: string;
    payload?: Record<string, unknown>;
    channel?: string;
  }) {
    const { error } = await this.client.from('notifications').insert({
      user_id: row.user_id,
      kind: row.kind,
      payload: row.payload ?? {},
      channel: row.channel ?? 'in_app',
    });
    if (error) throw error;
  }
}
