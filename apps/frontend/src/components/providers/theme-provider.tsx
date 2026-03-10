'use client';

import type { ReactNode } from 'react';

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Single light theme – no context or toggling needed.
  return <>{children}</>;
}

