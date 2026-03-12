'use client';

import { TrendingUp, DollarSign, MessageCircle, ExternalLink } from 'lucide-react';

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

export function SearchboxResultCard({
  lead,
  onAddComment,
}: {
  lead: Lead;
  onAddComment?: (lead: Lead) => void;
}) {
  const score = lead.intent_score ?? lead.score;
  const engagementDisplay = score >= 80 ? (score * 50).toLocaleString() : (score * 40).toLocaleString();
  const valueDisplay = score >= 80 ? `$${Math.round(score * 3)}` : `$${Math.round(score * 2)}`;

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
        <span className="flex h-5 w-5 items-center justify-center rounded bg-[#FF4500] text-white text-[10px] font-bold">
          r
        </span>
        <span className="font-medium text-slate-700">r/{lead.subreddit || 'reddit'}</span>
        <span className="text-slate-400">•</span>
        <time dateTime={lead.created_at ?? ''}>{formatDate(lead.created_at)}</time>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
          <TrendingUp className="h-3.5 w-3.5" />
          {engagementDisplay}
        </span>
        <span className="inline-flex items-center gap-1 rounded-lg bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700">
          <DollarSign className="h-3.5 w-3.5" />
          {valueDisplay}
        </span>
      </div>

      <h3 className="text-base font-semibold text-slate-900 mb-2 leading-snug">
        {lead.title}
      </h3>

      <a
        href={lead.post_url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-slate-400 hover:text-orange-600 truncate block mb-4"
      >
        {lead.post_url}
      </a>

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4 text-sm text-slate-500">
          <span className="flex items-center gap-1">
            <span className="text-slate-400">↑</span>
            <span>—</span>
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle className="h-3.5 w-3.5" />
            <span>— Comments</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={lead.post_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-orange-600"
          >
            <ExternalLink className="h-4 w-4" />
            View on Reddit
          </a>
          {onAddComment && (
            <button
              type="button"
              onClick={() => onAddComment(lead)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
            >
              <MessageCircle className="h-4 w-4" />
              Add Comment
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
