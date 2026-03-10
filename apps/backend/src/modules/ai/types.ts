export interface ScoringResponse {
  score: number;
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
