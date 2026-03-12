export interface ScoringResponse {
  score: number;
  reason?: string;
  intent_score?: number;
  fit_score?: number;
  is_noise?: boolean;
  pain_tags?: string[] | string;
}

export interface IntentAnalysis {
  score: number;
  intentScore: number;
  fitScore: number;
  isNoise: boolean;
  painTags: string[];
  reason?: string;
}

export interface PostInput {
  title: string;
  content: string;
}

export interface WebsiteAnalysisResponse {
  companyName: string;
  brandVariations: string[];
  companyDescription: string;
}
