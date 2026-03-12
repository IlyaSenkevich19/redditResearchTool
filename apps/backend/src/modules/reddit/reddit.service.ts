import { Injectable, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { SupabaseService } from '../supabase/supabase.service';
import { AiService } from '../ai/ai.service';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Snoowrap = require('snoowrap');

export interface RedditPost {
  id: string;
  subreddit: string;
  author: string;
  title: string;
  selftext: string;
  url: string;
  permalink: string;
  createdUtc: number;
}

@Injectable()
export class RedditService implements OnModuleInit {
  private client: any | null = null;

  constructor(
    private readonly supabase: SupabaseService,
    private readonly ai: AiService,
  ) {}

  onModuleInit() {
    const clientId = process.env.REDDIT_CLIENT_ID;
    const clientSecret = process.env.REDDIT_CLIENT_SECRET;
    const refreshToken = process.env.REDDIT_REFRESH_TOKEN;

    if (clientId && clientSecret && refreshToken) {
      this.client = new Snoowrap({
        userAgent: 'CommunityInsights/1.0',
        clientId,
        clientSecret,
        refreshToken,
      });
    }
  }

  async scanAllCampaigns(): Promise<{ processed: number; leadsAdded: number }> {
    if (!this.client) {
      throw new Error('Reddit API not configured. Set REDDIT_* env vars.');
    }

    const campaigns = await this.supabase.getActiveCampaigns();
    let leadsAdded = 0;

    for (const campaign of campaigns) {
      try {
        // Fetch project to access brand & competitor names for mentions / share-of-voice.
        const projectId = (campaign as any).project_id as number | undefined;
        const project = projectId ? await this.supabase.getProjectById(projectId) : null;

        const posts = await this.searchSubreddits(
          campaign.subreddits,
          campaign.keywords,
          10,
        );

        for (const post of posts) {
          const analysis = await this.ai.analyzeIntent(post.title, post.selftext);
          const score = analysis.score;

          // High‑intent notifications (less noisy alerts)
          if (analysis.intentScore >= 80 && !analysis.isNoise) {
            await this.supabase.createNotification({
              user_id: campaign.user_id,
              kind: 'lead_high_intent',
              payload: {
                campaign_id: campaign.id,
                subreddit: post.subreddit,
                title: post.title,
                score,
                intent_score: analysis.intentScore,
              },
            });
          }

          // Brand & competitor mentions (share of voice)
          if (project) {
            const text = `${post.title} ${post.selftext}`.toLowerCase();
            const projectBrands = Array.isArray(project.brand_variations) ? project.brand_variations : [];
            const competitors = Array.isArray(project.competitors) ? project.competitors : [];

            for (const name of projectBrands) {
              if (name && text.includes(String(name).toLowerCase())) {
                await this.supabase.insertMention({
                  user_id: project.user_id,
                  project_id: project.id,
                  kind: 'brand',
                  name: String(name),
                  post_id: post.id,
                  subreddit: post.subreddit,
                  username: post.author,
                  title: post.title,
                  content: post.selftext,
                  score,
                  post_url: post.permalink,
                });
                break;
              }
            }

            for (const name of competitors) {
              if (name && text.includes(String(name).toLowerCase())) {
                await this.supabase.insertMention({
                  user_id: project.user_id,
                  project_id: project.id,
                  kind: 'competitor',
                  name: String(name),
                  post_id: post.id,
                  subreddit: post.subreddit,
                  username: post.author,
                  title: post.title,
                  content: post.selftext,
                  score,
                  post_url: post.permalink,
                });
                break;
              }
            }
          }

          if (score >= campaign.score_threshold) {
            await this.supabase.insertLead({
              campaign_id: campaign.id,
              post_id: post.id,
              subreddit: post.subreddit,
              username: post.author,
              title: post.title,
              content: post.selftext,
              score,
              intent_score: analysis.intentScore,
              fit_score: analysis.fitScore,
              is_noise: analysis.isNoise,
              pain_tags: analysis.painTags,
              post_url: post.permalink,
            });
            leadsAdded++;
          }
          await this.delay(500);
        }
        await this.delay(1000);
      } catch (err) {
        console.error(`Scan error for campaign ${campaign.id}:`, err);
      }
    }

    return { processed: campaigns.length, leadsAdded };
  }

  @Cron('0 * * * *')
  async handleCronScan() {
    if (!this.client) return;
    try {
      const result = await this.scanAllCampaigns();
      console.log(`[Cron] ${result.processed} campaigns, ${result.leadsAdded} leads`);
    } catch (err) {
      console.error('[Cron] Scan failed:', err);
    }
  }

  async getSubredditPosts(
    subreddit: string,
    options: { limit?: number; sort?: string } = {},
  ): Promise<RedditPost[]> {
    if (!this.client) {
      throw new Error('Reddit API not configured.');
    }

    const limit = options.limit ?? 25;
    const sort = (options.sort as 'new' | 'hot' | 'top') ?? 'new';
    const sub = this.client.getSubreddit(subreddit);
    let listing;

    switch (sort) {
      case 'hot':
        listing = await sub.getHot({ limit });
        break;
      case 'top':
        listing = await sub.getTop({ limit, time: 'day' });
        break;
      default:
        listing = await sub.getNew({ limit });
    }

    return listing.map((p: any) => ({
      id: p.id,
      subreddit: p.subreddit.display_name,
      author: p.author?.name ?? '[deleted]',
      title: p.title,
      selftext: p.selftext ?? '',
      url: p.url,
      permalink: `https://reddit.com${p.permalink}`,
      createdUtc: p.created_utc,
    }));
  }

  async searchSubreddits(
    subreddits: string[],
    keywords: string[],
    limitPerSub = 10,
  ): Promise<RedditPost[]> {
    const allPosts: RedditPost[] = [];
    const seen = new Set<string>();

    for (const sub of subreddits) {
      try {
        const posts = await this.getSubredditPosts(sub, {
          limit: limitPerSub,
          sort: 'new',
        });

        for (const post of posts) {
          const text = `${post.title} ${post.selftext}`.toLowerCase();
          const matches = keywords.some((kw) =>
            text.includes(kw.toLowerCase()),
          );
          if (matches && !seen.has(post.id)) {
            seen.add(post.id);
            allPosts.push(post);
          }
        }
        await this.delay(1000);
      } catch (err) {
        console.error(`Reddit fetch error for r/${sub}:`, err);
      }
    }

    return allPosts;
  }

  private delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
