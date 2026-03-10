import { fetchJson } from '@/lib/utils';

export async function scanNow() {
  return fetchJson('/api/reddit/scan-now', { method: 'POST' });
}

