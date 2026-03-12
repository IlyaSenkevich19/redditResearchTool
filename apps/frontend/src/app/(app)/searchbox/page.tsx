'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, MessageSquare, BarChart3, ChevronDown } from 'lucide-react';
import { useProject } from '@/contexts/project-context';
import { useCampaigns, useLeads } from '@/lib/queries';
import { KeywordInput } from '@/components/searchbox/keyword-input';
import { SearchboxResultCard } from '@/components/searchbox/searchbox-result-card';
import { ReplyModal } from '@/components/table/reply-modal';
import { useGenerateReplyLead } from '@/lib/queries';
import { cn } from '@/lib/utils';
import type { Lead } from '@/lib/types/lead';

const SUGGESTED_KEYWORDS = [
  'best CRM',
  'CRM',
  'CRM for small business',
  'responsive designs',
  'clickup alternative',
  'value positioning',
  'value prop',
  'value proposition',
  'customer care service',
  'customer care services',
];

const SORT_OPTIONS = [
  { id: 'relevance', label: 'Relevance', fn: (a: Lead, b: Lead) => (b.intent_score ?? b.score) - (a.intent_score ?? a.score) },
  { id: 'date', label: 'Date', fn: (a: Lead, b: Lead) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime() },
  { id: 'score', label: 'Score', fn: (a: Lead, b: Lead) => b.score - a.score },
] as const;

function SectionIcon({ className }: { className?: string }) {
  return (
    <span
      className={cn('inline-block h-2 w-2 rounded-full bg-[#FF4500] shrink-0', className)}
      aria-hidden
    />
  );
}

export default function SearchboxPage() {
  const { projectId } = useProject();
  const { data: campaigns = [] } = useCampaigns(projectId);
  const campaignIds = campaigns.map((c) => c.id);
  const { data: leads = [], isLoading } = useLeads(
    campaignIds.length > 0 ? { campaignIds, limit: 100 } : undefined,
  );
  const leadsList = (leads ?? []) as Lead[];

  const [keywords, setKeywords] = useState<string[]>([]);
  const [sortId, setSortId] = useState<'relevance' | 'date' | 'score'>('relevance');
  const [sortOpen, setSortOpen] = useState(false);
  const [replyLead, setReplyLead] = useState<Lead | null>(null);
  const [replyText, setReplyText] = useState<string | null>(null);
  const sortRef = useRef<HTMLDivElement>(null);
  const { mutateAsync: generateReply } = useGenerateReplyLead();

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
  const trafficPlaceholder = totalCount > 0 ? (totalCount * 2000).toLocaleString() : '—';
  const currentSortLabel = SORT_OPTIONS.find((s) => s.id === sortId)?.label ?? 'Relevance';

  function addSuggestedKeyword(word: string) {
    const w = word.trim().toLowerCase();
    if (w && !keywords.includes(w) && keywords.length < 500) setKeywords([...keywords, w]);
  }

  async function handleAddComment(lead: Lead) {
    try {
      const result = await generateReply(lead.id);
      setReplyLead(lead);
      setReplyText(result?.reply ?? '');
    } catch {
      setReplyLead(lead);
      setReplyText('');
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <SectionIcon className="h-3 w-3" />
          <h1 className="text-2xl font-semibold tracking-tight">Searchbox</h1>
        </div>
        <p className="mt-2 text-sm text-slate-600 max-w-2xl">
          Search Reddit for high-intent threads in your niche, discover new conversations in real time.
        </p>
      </div>

      {/* Find Threads by Keyword */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <SectionIcon />
          <h2 className="text-base font-semibold text-slate-900">Find Threads by Keyword</h2>
        </div>
        <p className="text-sm text-slate-500 mb-4">
          Enter a topic or keyword to discover live Reddit threads.
        </p>
        <KeywordInput
          keywords={keywords}
          onChange={setKeywords}
          placeholder="Add another keyword... (Press Enter)"
        />
        {/* Suggested Keywords */}
        <div className="mt-4">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
            Suggested Keywords
          </p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_KEYWORDS.map((word) => (
              <button
                key={word}
                type="button"
                onClick={() => addSuggestedKeyword(word)}
                className={cn(
                  'rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
                  keywords.includes(word.toLowerCase())
                    ? 'bg-orange-100 text-orange-800'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-700',
                )}
              >
                {word}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Overview */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <SectionIcon />
          <h2 className="text-base font-semibold text-slate-900">Overview</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white border border-slate-200">
              <MessageSquare className="h-5 w-5 text-slate-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Threads Found</p>
              <p className="text-2xl font-semibold text-slate-900">{totalCount}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white border border-slate-200">
              <BarChart3 className="h-5 w-5 text-slate-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Traffic Discovered</p>
              <p className="text-2xl font-semibold text-slate-900">{trafficPlaceholder}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 className="text-base font-semibold text-slate-900">
            {totalCount} Results Found
          </h2>
          <div className="relative flex items-center gap-2" ref={sortRef}>
            <span className="text-sm text-slate-500">Sort by:</span>
            <button
              type="button"
              onClick={() => setSortOpen((o) => !o)}
              className={cn(
                'flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm',
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
                <div className="h-6 w-20 bg-slate-100 rounded mb-2" />
                <div className="h-5 w-full bg-slate-200 rounded mb-4" />
                <div className="h-4 w-3/4 bg-slate-100 rounded" />
              </div>
            ))}
          </div>
        ) : totalCount === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 mx-auto">
              <Search className="h-7 w-7 text-slate-400" />
            </div>
            <p className="mt-4 font-medium text-slate-700">No threads yet</p>
            <p className="mt-1 text-sm text-slate-500 max-w-sm mx-auto">
              Add keywords above and run a scan from Leads, or ensure your campaigns have keywords and subreddits.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
            {sortedLeads.map((lead) => (
              <SearchboxResultCard
                key={lead.id}
                lead={lead}
                onAddComment={handleAddComment}
              />
            ))}
          </div>
        )}
      </div>

      {replyText !== null && (
        <ReplyModal
          reply={replyText}
          onClose={() => {
            setReplyLead(null);
            setReplyText(null);
          }}
        />
      )}
    </div>
  );
}
