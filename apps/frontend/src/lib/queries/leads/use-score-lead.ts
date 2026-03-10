'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { aiApi } from '@/lib/api';
import { useAuth } from '@/contexts/auth-context';

export function useScoreLead() {
  const queryClient = useQueryClient();
  const { accessToken } = useAuth();

  return useMutation({
    mutationFn: async (leadId: number) => {
      if (!accessToken) throw new Error('Not authenticated');
      return aiApi.scoreLead(accessToken, leadId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });
}

