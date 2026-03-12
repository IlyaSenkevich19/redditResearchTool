'use client';

import { Zap, Link2, MessageCircle, ExternalLink } from 'lucide-react';
import type { Lead } from '@/lib/types/lead';

function formatDate(iso?: string) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function buildContextInsight(lead: Lead): string {
  if (lead.pain_tags && lead.pain_tags.length > 0) {
    return lead.pain_tags.join(', ') + '.';
  }
  const score = lead.intent_score ?? lead.score;
  if (score >= 80) return 'High buying intent — direct request or problem that fits product solutions.';
  if (score >= 50) return 'Moderate intent — discussion or question that may lead to consideration.';
  return 'Lower intent — general discussion or tangential mention.';
}

export function OpportunityCard({ lead }: { lead: Lead }) {
  const relevance = lead.intent_score ?? lead.score;
  const insight = buildContextInsight(lead);

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      {/* Subreddit + date */}
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
        <span className="flex h-5 w-5 items-center justify-center rounded bg-[#FF4500] text-white text-[10px] font-bold">
          r
        </span>
        <span className="font-medium text-slate-700">r/{lead.subreddit || 'reddit'}</span>
        <span className="text-slate-400">•</span>
        <time dateTime={lead.created_at ?? ''}>{formatDate(lead.created_at)}</time>
      </div>

      {/* Title */}
      <h3 className="text-base font-semibold text-slate-900 mb-2 leading-snug">
        {lead.title}
      </h3>

      {/* Link */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-4">
        <Link2 className="h-3.5 w-3.5 shrink-0 text-slate-400" />
        <a
          href={lead.post_url}
          target="_blank"
          rel="noopener noreferrer"
          className="truncate hover:text-orange-600 transition-colors"
        >
          {lead.post_url}
        </a>
      </div>

      {/* Engagement + View on Reddit */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-4 text-sm text-slate-500">
          <span className="flex items-center gap-1">
            <span className="text-slate-400">↑</span>
            <span>—</span>
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle className="h-3.5 w-3.5" />
            <span>—</span>
          </span>
        </div>
        <a
          href={lead.post_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-orange-600 hover:text-orange-700"
        >
          <ExternalLink className="h-4 w-4" />
          View on Reddit
        </a>
      </div>

      {/* AI analysis block */}
      <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-4">
        <div className="flex items-center gap-2 mb-1.5">
          <Zap className="h-4 w-4 text-emerald-600" />
          <span className="text-sm font-semibold text-emerald-800">
            Relevance: {relevance}/100
          </span>
        </div>
        <p className="text-sm text-emerald-800/90 leading-relaxed">
          {insight}
        </p>
      </div>
    </article>
  );
}
