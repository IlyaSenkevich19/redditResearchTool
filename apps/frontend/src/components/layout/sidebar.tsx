'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useProject } from '@/contexts/project-context';
import { useProjects } from '@/lib/queries';
import { useAuth } from '@/contexts/auth-context';
import { useDashboardStats } from '@/lib/queries';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Megaphone,
  Settings,
  ChevronUpDown,
  Plus,
  Zap,
  MessageSquare,
  LogOut,
  MoreVertical,
  Leaf,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { authApi } from '@/lib/api';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/campaigns', label: 'Campaigns', icon: Megaphone },
  { href: '/settings', label: 'Settings', icon: Settings },
];

function SidebarProjectSelector() {
  const { projectId, setProjectId } = useProject();
  const { data: projects = [], isLoading } = useProjects();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const onOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, []);

  useEffect(() => {
    if (projectId === null && projects.length > 0) setProjectId(projects[0].id);
  }, [projects, projectId, setProjectId]);

  const current = projects.find((p) => p.id === projectId);

  if (isLoading || projects.length === 0) {
    return (
      <Link
        href="/new-project/website"
        className="flex items-center gap-2 rounded-xl border border-orange-200 bg-orange-50/80 px-3 py-2.5 text-sm font-medium text-orange-700 hover:bg-orange-100 transition-colors"
      >
        <Plus className="h-4 w-4 shrink-0" />
        New project
      </Link>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-left text-sm font-medium text-slate-800 shadow-sm hover:border-slate-300 transition-colors"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-100 text-emerald-600">
          <Leaf className="h-3.5 w-3.5" />
        </span>
        <span className="min-w-0 flex-1 truncate">{current?.name ?? 'Select project'}</span>
        <ChevronUpDown className="h-4 w-4 shrink-0 text-slate-400" />
      </button>
      {open && (
        <div
          className="absolute left-0 right-0 top-full z-50 mt-1 rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
          role="listbox"
        >
          {projects.map((p) => (
            <button
              key={p.id}
              type="button"
              role="option"
              aria-selected={p.id === projectId}
              onClick={() => {
                setProjectId(p.id);
                setOpen(false);
              }}
              className={cn(
                'flex w-full items-center gap-2 px-3 py-2 text-left text-sm',
                p.id === projectId ? 'bg-orange-50 font-medium text-orange-800' : 'hover:bg-slate-50',
              )}
            >
              <span className="truncate">{p.name}</span>
            </button>
          ))}
          <div className="my-1 border-t border-slate-100" />
          <Link
            href="/new-project/website"
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-orange-600 hover:bg-orange-50"
            onClick={() => setOpen(false)}
          >
            <Plus className="h-4 w-4" />
            New project
          </Link>
        </div>
      )}
    </div>
  );
}

function SidebarUserBlock() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!ref.current) return;
    const onOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, []);

  async function handleSignOut() {
    await authApi.signOut();
    toast.success('Logged out');
    router.push('/auth/login');
    router.refresh();
    setOpen(false);
  }

  if (!user) return null;

  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
  const email = user.email ?? '';

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left hover:bg-slate-100 transition-colors"
        aria-expanded={open}
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-red-500 text-white text-sm font-medium">
          {displayName.charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-slate-800">{displayName}</p>
          <p className="truncate text-xs text-slate-500">{email}</p>
        </div>
        <MoreVertical className="h-4 w-4 shrink-0 text-slate-400" />
      </button>
      {open && (
        <div className="absolute left-0 right-0 bottom-full z-50 mb-1 rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

export function Sidebar({ onNewCampaign, inDrawer }: { onNewCampaign?: () => void; inDrawer?: boolean }) {
  const pathname = usePathname();
  const { projectId } = useProject();
  const { data: stats } = useDashboardStats(projectId);
  const campaignCount = stats?.campaignCount ?? 0;
  const leadCount = stats?.leadCount ?? 0;

  return (
    <aside
      className={cn(
        'flex h-full w-72 shrink-0 flex-col border-r border-slate-200 bg-white/95 shadow-sm',
        inDrawer ? 'border-0' : 'hidden lg:flex',
      )}
    >
      {/* Top: logo */}
      <div className="p-4 pb-3">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 shadow-sm" />
          <span className="text-base font-semibold tracking-tight text-slate-900">
            Reddit LeadGen
          </span>
        </Link>
      </div>

      {/* Project selector */}
      <div className="px-4 pb-4">
        <SidebarProjectSelector />
      </div>

      {/* Main menu */}
      <div className="flex-1 overflow-y-auto px-3 pb-4">
        <p className="mb-2 px-3 text-[11px] font-medium uppercase tracking-wider text-slate-400">
          Main menu
        </p>
        <nav className="space-y-0.5">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                pathname.startsWith(href)
                  ? 'bg-slate-100 text-slate-900'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
              )}
            >
              <Icon className="h-4 w-4 shrink-0 text-slate-500" />
              {label}
            </Link>
          ))}
        </nav>

        {/* Widgets */}
        <div className="mt-6 space-y-3">
          <div className="rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-3">
            <div className="flex items-center gap-2 text-slate-700">
              <Zap className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium">Leads</span>
            </div>
            <p className="mt-1 text-lg font-semibold text-slate-900">{leadCount}</p>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-orange-400 transition-all"
                style={{ width: leadCount > 0 ? `${Math.min(100, leadCount)}%` : '0%' }}
              />
            </div>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-3">
            <div className="flex items-center gap-2 text-slate-700">
              <MessageSquare className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium">Campaigns</span>
            </div>
            <p className="mt-1 text-lg font-semibold text-slate-900">{campaignCount}</p>
            <div className="mt-2 flex gap-1">
              <div
                className="h-1.5 flex-1 rounded-full bg-emerald-400"
                style={{ width: campaignCount > 0 ? '33%' : '0%' }}
              />
              <div className="h-1.5 flex-1 rounded-full bg-slate-200" />
              <div className="h-1.5 flex-1 rounded-full bg-slate-200" />
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-6">
          <Button
            onClick={onNewCampaign}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white h-11 rounded-xl shadow-sm font-medium"
          >
            <Zap className="h-4 w-4 mr-2" />
            Get leads now
          </Button>
        </div>
      </div>

      {/* User block */}
      <div className="border-t border-slate-100 p-3">
        <SidebarUserBlock />
      </div>
    </aside>
  );
}
