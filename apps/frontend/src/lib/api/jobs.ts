import { fetchJson } from '@/lib/utils';

export async function getStatus() {
  return fetchJson('/api/jobs/status');
}

