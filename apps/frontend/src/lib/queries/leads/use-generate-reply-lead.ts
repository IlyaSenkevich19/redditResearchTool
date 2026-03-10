'use client';

import { useMutation } from '@tanstack/react-query';
import { aiApi } from '@/lib/api';
import { useAuth } from '@/contexts/auth-context';

export function useGenerateReplyLead() {
  const { accessToken } = useAuth();

  return useMutation({
    mutationFn: async (leadId: number) => {
      if (!accessToken) throw new Error('Not authenticated');
      return aiApi.generateReplyLead(accessToken, leadId);
    },
  });
}

