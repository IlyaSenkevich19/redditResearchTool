'use client';

import { useQuery } from '@tanstack/react-query';
import { campaignsApi } from '@/lib/api';
import { useAuth } from '@/contexts/auth-context';

export function useCampaigns(projectId?: number | null) {
  const { accessToken } = useAuth();

  return useQuery({
    queryKey: ['campaigns', projectId ?? 'all'],
    queryFn: () => campaignsApi.listCampaigns(projectId),
    enabled: !!accessToken,
  });
}

