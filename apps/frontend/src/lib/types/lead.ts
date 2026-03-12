export interface Lead {
  id: number;
  campaign_id: number;
  post_id: string;
  subreddit: string;
  username: string;
  title: string;
  content?: string;
  score: number;
  post_url: string;
  created_at?: string;
  intent_score?: number;
  pain_tags?: string[];
}

