'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { redditApi } from '@/lib/api';

export function useScanNow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => redditApi.scanNow(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });
}

