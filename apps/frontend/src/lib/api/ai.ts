import { fetchJson } from '@/lib/utils';

export async function scoreLead(token: string, leadId: number) {
  return fetchJson('/api/ai/score-lead', {
    method: 'POST',
    body: JSON.stringify({ leadId }),
    token,
  } as any);
}

export async function generateReplyLead(token: string, leadId: number) {
  return fetchJson('/api/ai/generate-reply-lead', {
    method: 'POST',
    body: JSON.stringify({ leadId }),
    token,
  } as any);
}

export interface WebsiteAnalysis {
  companyName: string;
  brandVariations: string[];
  companyDescription: string;
}

export async function analyzeWebsite(token: string, website: string): Promise<WebsiteAnalysis> {
  return fetchJson('/api/ai/analyze-website', {
    method: 'POST',
    body: JSON.stringify({ website }),
    token,
  } as any);
}

