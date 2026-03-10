'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { LeadsTable } from '@/components/table/leads-table';
import { Button } from '@/components/ui/button';
import { Play, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreateCampaignModal } from '@/components/campaigns/create-campaign-modal';
import { useCampaigns, useLeads, useScanNow } from '@/lib/queries';
import { useProject } from '@/contexts/project-context';

function DashboardContent() {
  const searchParams = useSearchParams();
  const { projectId } = useProject();
  const campaignId = searchParams.get('campaignId')
    ? parseInt(searchParams.get('campaignId')!, 10)
    : undefined;
  const [showCreate, setShowCreate] = React.useState(false);

  const {
    data: campaigns = [],
    isLoading: loadingCampaigns,
  } = useCampaigns(projectId);
  const campaignIds = campaigns.map((c) => c.id);
  const leadsParams = campaignId
    ? { campaignId, limit: 50 as const }
    : { campaignIds, limit: 50 as const };
  const {
    data: leads = [],
    isLoading: loadingLeads,
    refetch: refetchLeads,
  } = useLeads(leadsParams);
  const { mutateAsync: scanNow, isPending: scanning } = useScanNow();

  const loading = loadingCampaigns || loadingLeads;

  async function handleScanNow() {
    await scanNow();
    refetchLeads();
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT: campaign cards */}
        <section className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight">Campaigns</h2>
            <Button
              size="sm"
              className="bg-accent text-white hover:opacity-90 rounded-xl shadow-soft"
              onClick={() => setShowCreate(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              New
            </Button>
          </div>

          <div className="flex lg:flex-col gap-4 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
            {campaigns.map((c) => (
              <Card
                key={c.id}
                className="glass rounded-2xl border-0 shadow-soft hover:shadow-premium transition-colors min-w-[280px] lg:min-w-0"
              >
                <CardHeader className="p-5 pb-3">
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="glass">r/{(c.subreddits ?? [])[0] ?? 'all'}</Badge>
                    <Badge
                      variant="gradient"
                      className="bg-accent"
                    >
                      {leads.filter((l) => l.campaign_id === c.id).length} leads
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-5 pt-0 space-y-3">
                  <CardTitle className="text-base">{c.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {(c.keywords ?? []).length} keywords · {(c.subreddits ?? []).length} subs · threshold {c.score_threshold}
                  </p>
                  <div className="flex gap-2">
                    <a href={`/dashboard?campaignId=${c.id}`} className="flex-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full rounded-xl glass border-border hover:bg-white/10"
                      >
                        View Leads
                      </Button>
                    </a>
                    <Button
                      size="sm"
                      className="rounded-xl bg-accent text-white hover:opacity-90"
                      onClick={handleScanNow}
                      disabled={scanning}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      {scanning ? 'Scanning...' : 'Scan'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {campaigns.length === 0 && !loading && (
              <Card className="glass rounded-2xl border-0 shadow-soft min-w-[280px] lg:min-w-0">
                <CardContent className="p-6">
                  <p className="text-sm text-muted-foreground">
                    Create your first campaign to start monitoring Reddit.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </section>

        {/* RIGHT: leads table */}
        <section className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">Leads</h2>
              <p className="text-sm text-muted-foreground">
                High-intent posts scored by AI. Hover rows for quick actions.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleScanNow}
              disabled={scanning}
              className="rounded-xl glass border-border hover:bg-white/10"
            >
              <Play className="h-4 w-4 mr-2" />
              {scanning ? 'Scanning...' : 'Scan now'}
            </Button>
          </div>

          {loading ? (
            <div className="glass rounded-2xl border-0 shadow-soft p-4 space-y-3 animate-pulse">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-4 border-b border-border/40 pb-3 last:border-0 last:pb-0"
                >
                  <div className="h-6 w-10 bg-white/10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-40 bg-white/10 rounded-full" />
                    <div className="h-3 w-64 bg-white/5 rounded-full" />
                  </div>
                  <div className="h-3 w-20 bg-white/5 rounded-full" />
                </div>
              ))}
            </div>
          ) : (
            <LeadsTable data={leads} />
          )}
        </section>
      </div>

      {showCreate && (
        <CreateCampaignModal
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
          }}
          projectId={projectId}
        />
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<p className="text-muted-foreground">Loading...</p>}>
      <DashboardContent />
    </Suspense>
  );
}
