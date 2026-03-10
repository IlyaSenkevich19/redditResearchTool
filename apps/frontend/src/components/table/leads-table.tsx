'use client';

import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from '@tanstack/react-table';
import { useState } from 'react';
import { useScoreLead, useGenerateReplyLead } from '@/lib/queries';
import { Button } from '@/components/ui/button';
import { MessageSquare, RefreshCw, Download, Archive } from 'lucide-react';
import { ReplyModal } from './reply-modal';
import { Badge } from '@/components/ui/badge';
import type { Lead } from '@/lib/types/lead';

const columnHelper = createColumnHelper<Lead>();

const columns = [
  columnHelper.accessor('score', {
    header: 'Score',
    cell: (info) => (
      <Badge
        variant={Number(info.getValue()) >= 80 ? 'success' : 'glass'}
        className="font-mono"
      >
        {Number(info.getValue()).toFixed(0)}
      </Badge>
    ),
  }),
  columnHelper.accessor('title', {
    header: 'Preview',
    cell: (info) => (
      <div className="max-w-[520px]">
        <a
          href={info.row.original.post_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-foreground hover:opacity-90 hover:underline decoration-white/20 underline-offset-4 font-medium line-clamp-1"
        >
          {info.getValue()}
        </a>
        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
          {(info.row.original.content ?? '').slice(0, 120)}
          {(info.row.original.content ?? '').length > 120 ? '…' : ''}
        </p>
      </div>
    ),
  }),
  columnHelper.accessor('subreddit', {
    header: 'Subreddit',
    cell: (info) => (
      <Badge variant="glass" className="text-xs">
        r/{info.getValue()}
      </Badge>
    ),
  }),
  columnHelper.accessor('created_at', {
    header: 'Time',
    cell: (info) => {
      const v = info.getValue();
      if (!v) return <span className="text-muted-foreground">—</span>;
      const d = new Date(v);
      return (
        <span className="text-xs text-muted-foreground">
          {d.toLocaleString(undefined, {
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      );
    },
  }),
  columnHelper.display({
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => <RowActions lead={row.original} />,
  }),
];

function RowActions({ lead }: { lead: LeadRow }) {
  const [reply, setReply] = useState<string | null>(null);
  const { mutateAsync: scoreLead, isPending: scoring } = useScoreLead();
  const { mutateAsync: generateReply, isPending: generating } = useGenerateReplyLead();
  const [archived, setArchived] = useState(false);

  const loading = scoring || generating;

  async function handleRescore() {
    await scoreLead(lead.id);
  }

  async function handleGenerateReply() {
    const { reply } = await generateReply(lead.id);
    setReply(reply);
  }

  return (
    <>
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={handleGenerateReply}
          disabled={loading}
          title="Generate reply"
          className="rounded-xl glass border-border hover:bg-white/10"
        >
          <MessageSquare className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleRescore}
          disabled={loading}
          title="Rescore"
          className="rounded-xl hover:bg-white/5"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setArchived(true)}
          disabled={archived}
          title="Archive (UI only)"
          className="rounded-xl hover:bg-white/5"
        >
          <Archive className="h-4 w-4" />
        </Button>
      </div>
      {reply && (
        <ReplyModal reply={reply} onClose={() => setReply(null)} />
      )}
    </>
  );
}

function toCsv(rows: LeadRow[]): string {
  const headers = ['Post ID', 'Subreddit', 'Username', 'Title', 'Score', 'URL', 'Created'];
  const escape = (v: unknown) =>
    `"${String(v ?? '').replace(/"/g, '""')}"`;
  const r = rows.map((l) => [
    l.post_id,
    l.subreddit,
    l.username,
    escape(l.title),
    l.score,
    l.post_url,
    (l as { created_at?: string }).created_at ?? '',
  ]);
  return [headers.join(','), ...r.map((row) => row.join(','))].join('\n');
}

export function LeadsTable({ data }: { data: Lead[] }) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'score', desc: true },
  ]);
  const rows = data;

  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  function handleExport() {
    const csv = toCsv(rows);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'leads.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          className="rounded-xl glass border-border hover:bg-white/10"
        >
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>
      <div className="glass rounded-2xl border-0 shadow-premium overflow-hidden">
        <table className="w-full">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="border-b border-border/60 bg-white/5">
                {hg.headers.map((h) => (
                  <th
                    key={h.id}
                    className="px-4 py-4 text-left text-xs font-semibold tracking-wide text-muted-foreground uppercase"
                  >
                    {flexRender(h.column.columnDef.header, h.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-border/60 hover:bg-white/5 transition-colors"
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-4 text-sm align-top">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length === 0 && (
        <p className="text-center text-muted-foreground py-12">
          No leads yet. Create a campaign and start monitoring.
        </p>
      )}
    </div>
  );
}
