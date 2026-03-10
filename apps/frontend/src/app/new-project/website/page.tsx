'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function NewProjectWebsitePage() {
  const [website, setWebsite] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!website.trim()) {
      setError('Website is required');
      return;
    }
    setLoading(true);
    try {
      const encoded = encodeURIComponent(website.trim());
      router.push(`/new-project/description?website=${encoded}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-stretch bg-[#fff6f2]">
      <div className="w-full lg:w-1/2 flex flex-col px-6 sm:px-10 lg:px-16 py-8">
        <header className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-orange-500 to-red-500" />
            <span className="font-semibold tracking-tight text-slate-900">Reddit LeadGen</span>
          </div>
        </header>

        <main className="flex-1 flex items-center">
          <div className="w-full max-w-md space-y-8">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="inline-flex h-1.5 w-16 rounded-full bg-orange-500" />
                <span className="inline-flex h-1.5 w-16 rounded-full bg-orange-200" />
                <span className="inline-flex h-1.5 w-16 rounded-full bg-orange-100" />
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
                Tell us about <span className="text-orange-500">your company</span>
              </h1>
              <p className="text-sm text-muted-foreground">
                We&apos;ll use it to learn about your product and suggest the most relevant Reddit
                posts to target.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-2xl shadow-lg p-6">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-800">
                  Your website <span className="text-orange-500">*</span>
                </label>
                <Input
                  type="url"
                  placeholder="https://yourcompany.com"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  required
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button
                type="submit"
                className="h-11 bg-orange-500 hover:bg-orange-600 px-8 self-end"
                disabled={loading}
              >
                {loading ? 'Saving…' : 'Continue →'}
              </Button>
            </form>
          </div>
        </main>
      </div>

      <div className="hidden lg:flex w-1/2 items-center justify-center bg-gradient-to-br from-orange-500 to-red-500 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top,_#fff,_transparent_60%),_radial-gradient(circle_at_bottom,_#ffe5d0,_transparent_60%)]" />
        <div className="relative max-w-xl space-y-6 px-10">
          <h2 className="text-3xl font-semibold leading-tight">
            We&apos;ll scan Reddit
            <br />
            for companies like yours.
          </h2>
          <p className="text-sm text-orange-50/90">
            Share your website and we&apos;ll surface the most relevant subreddits and posts where
            your ideal customers are already asking for help.
          </p>
        </div>
      </div>
    </div>
  );
}

