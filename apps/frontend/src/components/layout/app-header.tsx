'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sparkles, Menu } from 'lucide-react';

export function AppHeader({
  onOpenSidebar,
}: {
  onOpenSidebar?: () => void;
}) {
  return (
    <header className="h-16 shrink-0 border-b border-slate-200 bg-white/80 backdrop-blur-sm">
      <div className="flex h-full items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          {onOpenSidebar && (
            <button
              type="button"
              onClick={onOpenSidebar}
              className="flex lg:hidden items-center justify-center rounded-lg p-2 text-slate-600 hover:bg-slate-100"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 shadow-sm" />
            <span className="font-semibold tracking-tight text-slate-900">
              Reddit LeadGen
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            className="rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-sm hover:from-orange-600 hover:to-red-600"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Upgrade
          </Button>
        </div>
      </div>
    </header>
  );
}
