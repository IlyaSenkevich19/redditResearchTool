export interface Campaign {
  id: number;
  name: string;
  keywords: string[];
  subreddits: string[];
  score_threshold: number;
  is_active: boolean;
  created_at: string;
}

