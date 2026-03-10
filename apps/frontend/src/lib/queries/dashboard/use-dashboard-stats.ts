'use client';

import { useQuery } from '@tanstack/react-query';
import { campaignsApi, leadsApi } from '@/lib/api';
import { useAuth } from '@/contexts/auth-context';

export function useDashboardStats(projectId?: number | null) {
  const { accessToken } = useAuth();

  return useQuery({
    queryKey: ['dashboard-stats', projectId ?? 'all'],
    queryFn: async () => {
      const campaigns = await campaignsApi.listCampaigns(projectId);
      const campaignIds = campaigns.map((c) => c.id);
      const leads =
        campaignIds.length > 0
          ? await leadsApi.listLeads({ campaignIds, limit: 500 })
          : [];
      return {
        campaignCount: campaigns.length,
        leadCount: leads.length,
      };
    },
    enabled: !!accessToken,
  });
}

