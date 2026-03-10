'use client';

import { useQuery } from '@tanstack/react-query';
import { leadsApi } from '@/lib/api';
import { useAuth } from '@/contexts/auth-context';

export interface UseLeadsParams {
  campaignId?: number;
  campaignIds?: number[];
  limit?: number;
}

export function useLeads(params?: UseLeadsParams | number, limit = 50) {
  const { accessToken } = useAuth();
  const opts: UseLeadsParams =
    params === undefined
      ? { limit }
      : typeof params === 'number'
        ? { campaignId: params, limit }
        : { ...params, limit: params.limit ?? limit };

  return useQuery({
    queryKey: ['leads', opts],
    queryFn: () =>
      leadsApi.listLeads({
        campaignId: opts.campaignId,
        campaignIds: opts.campaignIds,
        limit: opts.limit,
      }),
    enabled: !!accessToken,
  });
}

