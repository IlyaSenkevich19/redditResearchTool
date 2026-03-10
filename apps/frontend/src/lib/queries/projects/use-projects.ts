'use client';

import { useQuery } from '@tanstack/react-query';
import { projectsApi } from '@/lib/api';
import { useAuth } from '@/contexts/auth-context';

export function useProjects() {
  const { accessToken } = useAuth();

  return useQuery({
    queryKey: ['projects'],
    queryFn: () => projectsApi.listProjects(),
    enabled: !!accessToken,
  });
}
