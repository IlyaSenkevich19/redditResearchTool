import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { SCORING_PROMPT, REPLY_PROMPT, WEBSITE_ANALYSIS_PROMPT } from './prompts';
import type { PostInput, ScoringResponse, WebsiteAnalysisResponse } from './types';

@Injectable()
export class AiService {
  private client: OpenAI;
  private model: string;

  constructor() {
    const apiKey =
      process.env.AI_API_KEY ||
      process.env.OPENAI_API_KEY;
    const baseURL =
      process.env.AI_BASE_URL ||
      'https://api.x.ai/v1';
    this.model = process.env.AI_MODEL || 'grok-2-1212'; // xAI model

    if (!apiKey) {
      throw new Error('AI_API_KEY or OPENAI_API_KEY is required');
    }

    this.client = new OpenAI({
      apiKey,
      baseURL,
    });
  }

  /**
   * Intent scoring 0-100. Universal prompts work with xAI Grok, AIAI.BY, OpenAI.
   */
  async scoreIntent(title: string, content: string): Promise<number> {
    const post = `${title}\n\n${content}`.slice(0, 2000);
    const prompt = SCORING_PROMPT.replace('{{post}}', post);

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      max_tokens: 100,
    });

    const raw = response.choices[0]?.message?.content?.trim() ?? '{"score":0}';
    return this.parseScore(raw);
  }

  private parseScore(raw: string): number {
    try {
      const cleaned = raw.replace(/```json?\s*/g, '').replace(/```\s*/g, '').trim();
      const parsed = JSON.parse(cleaned) as ScoringResponse;
      const score = typeof parsed.score === 'number' ? parsed.score : parseInt(String(parsed.score), 10);
      return Math.max(0, Math.min(100, isNaN(score) ? 0 : score));
    } catch {
      const match = raw.match(/\d+/);
      const n = match ? parseInt(match[0], 10) : 0;
      return Math.max(0, Math.min(100, n));
    }
  }

  /**
   * Generate natural Reddit reply. Anti-spam, human-like.
   */
  async generateReply(
    post: PostInput,
    productDescription = 'our product/service',
  ): Promise<string> {
    const postText = `${post.title}\n\n${post.content}`.slice(0, 2000);
    const prompt = REPLY_PROMPT.replace('{{post}}', postText)
      .replace('{{product}}', productDescription);

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 200,
    });

    return response.choices[0]?.message?.content?.trim() ?? '';
  }

  /** Backward compat: alias for scoreIntent */
  async scorePost(title: string, content: string): Promise<number> {
    return this.scoreIntent(title, content);
  }

  private readonly MAX_PAGE_CHARS = 12000;

  /**
   * Fetch URL and extract text from HTML (strip scripts, styles, tags).
   */
  private async fetchWebsiteText(url: string): Promise<string> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    try {
      const res = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept: 'text/html,application/xhtml+xml',
        },
        redirect: 'follow',
      });
      clearTimeout(timeout);
      if (!res.ok) return '';
      const html = await res.text();
      return this.stripHtmlToText(html);
    } catch {
      clearTimeout(timeout);
      return '';
    }
  }

  private stripHtmlToText(html: string): string {
    let text = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    return text.slice(0, this.MAX_PAGE_CHARS);
  }

  /**
   * Analyze a website URL: fetch content and use AI to extract company name,
   * brand variations, and description.
   */
  async analyzeWebsite(websiteUrl: string): Promise<WebsiteAnalysisResponse> {
    const url = websiteUrl.startsWith('http') ? websiteUrl : `https://${websiteUrl}`;
    const content = await this.fetchWebsiteText(url);
    const prompt = WEBSITE_ANALYSIS_PROMPT.replace('{{url}}', url).replace(
      '{{content}}',
      content || '(No content could be fetched; use the URL and domain only.)',
    );

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
      max_tokens: 1200,
    });

    const raw = response.choices[0]?.message?.content?.trim() ?? '{}';
    return this.parseWebsiteAnalysis(raw, url);
  }

  private parseWebsiteAnalysis(raw: string, fallbackUrl: string): WebsiteAnalysisResponse {
    try {
      const cleaned = raw.replace(/```json?\s*/g, '').replace(/```\s*/g, '').trim();
      const parsed = JSON.parse(cleaned) as Partial<WebsiteAnalysisResponse>;
      const hostname = fallbackUrl.replace(/^https?:\/\//, '').split('/')[0] ?? '';
      const defaultName = hostname.replace(/\.(com|io|co|net|org)$/i, '').replace(/^www\./, '') || 'Company';
      return {
        companyName: typeof parsed.companyName === 'string' ? parsed.companyName : defaultName,
        brandVariations: Array.isArray(parsed.brandVariations)
          ? parsed.brandVariations.filter((x): x is string => typeof x === 'string').slice(0, 3)
          : [defaultName],
        companyDescription:
          typeof parsed.companyDescription === 'string'
            ? parsed.companyDescription.slice(0, 1600)
            : `Company or product from ${hostname}.`,
      };
    } catch {
      const name = fallbackUrl.replace(/^https?:\/\//, '').split('/')[0] ?? 'Company';
      const base = name.replace(/\.(com|io|co|net|org)$/i, '').replace(/^www\./, '') || 'Company';
      return {
        companyName: base,
        brandVariations: [base],
        companyDescription: `Company or product from ${name}. Add a description in Settings later.`,
      };
    }
  }
}
