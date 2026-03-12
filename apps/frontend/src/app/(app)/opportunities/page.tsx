'use client';

import { useState, useRef, useEffect } from 'react';
import { Zap, Info, ChevronDown, Filter } from 'lucide-react';
import { useProject } from '@/contexts/project-context';
import { useCampaigns, useLeads } from '@/lib/queries';
import { OpportunityCard } from '@/components/searchbox/opportunity-card';
import { cn } from '@/lib/utils';
import type { Lead } from '@/lib/types/lead';

const SORT_OPTIONS = [
  { id: 'relevance', label: 'Relevance', fn: (a: Lead, b: Lead) => (b.intent_score ?? b.score) - (a.intent_score ?? a.score) },
  { id: 'date', label: 'Date', fn: (a: Lead, b: Lead) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime() },
  { id: 'score', label: 'Score', fn: (a: Lead, b: Lead) => b.score - a.score },
] as const;

export default function OpportunitiesPage() {
  const { projectId } = useProject();
  const { data: campaigns = [] } = useCampaigns(projectId);
  const campaignIds = campaigns.map((c) => c.id);
  const { data: leads = [], isLoading } = useLeads(
    campaignIds.length > 0 ? { campaignIds, limit: 100 } : undefined,
  );
  const leadsList = (leads ?? []) as Lead[];
  const [sortId, setSortId] = useState<'relevance' | 'date' | 'score'>('relevance');
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sortRef.current) return;
    const onOutside = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setSortOpen(false);
    };
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, []);

  const sortedLeads = [...leadsList].sort(
    SORT_OPTIONS.find((s) => s.id === sortId)?.fn ?? SORT_OPTIONS[0].fn,
  );
  const totalCount = sortedLeads.length;
  const currentSortLabel = SORT_OPTIONS.find((s) => s.id === sortId)?.label ?? 'Relevance';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-100">
            <Zap className="h-5 w-5 text-orange-600" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">New Opportunities</h1>
          <button
            type="button"
            aria-label="About New Opportunities"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
          >
            <Info className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-medium text-slate-700">
          {totalCount} {totalCount === 1 ? 'Post' : 'Posts'} Found
        </p>
        <div className="relative flex items-center gap-2" ref={sortRef}>
          <Filter className="h-4 w-4 text-slate-400" />
          <span className="text-sm text-slate-500">Sort by:</span>
          <button
            type="button"
            onClick={() => setSortOpen((o) => !o)}
            className={cn(
              'flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors',
              'hover:border-slate-300 hover:bg-slate-50',
              sortOpen && 'border-orange-300 ring-2 ring-orange-500/20',
            )}
            aria-expanded={sortOpen}
            aria-haspopup="listbox"
          >
            {currentSortLabel}
            <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
          </button>
          {sortOpen && (
            <div
              className="absolute right-0 top-full z-50 mt-1 min-w-[140px] overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
              role="listbox"
            >
              {SORT_OPTIONS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  role="option"
                  aria-selected={s.id === sortId}
                  onClick={() => {
                    setSortId(s.id);
                    setSortOpen(false);
                  }}
                  className={cn(
                    'flex w-full items-center px-3 py-2.5 text-left text-sm',
                    s.id === sortId
                      ? 'bg-orange-50 font-medium text-orange-800'
                      : 'text-slate-700 hover:bg-slate-50',
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm animate-pulse"
            >
              <div className="h-4 w-24 bg-slate-200 rounded mb-3" />
              <div className="h-5 w-full bg-slate-200 rounded mb-2" />
              <div className="h-4 w-3/4 bg-slate-100 rounded mb-4" />
              <div className="h-12 bg-emerald-100 rounded-xl" />
            </div>
          ))}
        </div>
      ) : totalCount === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 mx-auto">
            <Zap className="h-7 w-7 text-slate-400" />
          </div>
          <p className="mt-4 font-medium text-slate-700">No opportunities yet</p>
          <p className="mt-1 text-sm text-slate-500 max-w-sm mx-auto">
            Run a scan from Leads or add campaigns with keywords and subreddits. New opportunities will show up here with relevance and AI context.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
          {sortedLeads.map((lead) => (
            <OpportunityCard key={lead.id} lead={lead} />
          ))}
        </div>
      )}
    </div>
  );
}
