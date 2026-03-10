/**
 * Syncs NEXT_PUBLIC_* vars from root .env to apps/frontend/.env.local
 * so frontend uses the same source of truth. Run from repo root.
 */
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const envPath = path.join(rootDir, '.env');
const outPath = path.join(rootDir, 'apps', 'frontend', '.env.local');

if (!fs.existsSync(envPath)) {
  console.warn('[sync-frontend-env] Root .env not found, skipping sync.');
  process.exit(0);
}

const raw = fs.readFileSync(envPath, 'utf8');
const lines = raw.split(/\r?\n/);
const nextPublic = lines.filter((line) => {
  const trimmed = line.trim();
  return trimmed.startsWith('NEXT_PUBLIC_') && !trimmed.startsWith('#');
});

const outContent =
  '# Auto-generated from root .env — do not edit manually\n' +
  nextPublic.join('\n') +
  (nextPublic.length ? '\n' : '');

fs.writeFileSync(outPath, outContent, 'utf8');
console.log('[sync-frontend-env] Synced', nextPublic.length, 'NEXT_PUBLIC_* vars to apps/frontend/.env.local');
