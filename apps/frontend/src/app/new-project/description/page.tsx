'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/auth-context';
import { aiApi, projectsApi } from '@/lib/api';
import { ChevronLeft, ChevronRight, X, Check, MessageSquare } from 'lucide-react';

const DESCRIPTION_MAX = 1600;
const BRAND_MAX = 3;

export default function NewProjectDescriptionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const website = searchParams.get('website') ?? '';
  const { accessToken } = useAuth();

  const [loading, setLoading] = useState(!!website);
  const [error, setError] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [brandVariations, setBrandVariations] = useState<string[]>([]);
  const [companyDescription, setCompanyDescription] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchAnalysis = useCallback(async () => {
    if (!website.trim() || !accessToken) {
      if (!website.trim()) router.replace('/new-project/website');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await aiApi.analyzeWebsite(accessToken, website.trim());
      setCompanyName(data.companyName);
      setBrandVariations(
        Array.isArray(data.brandVariations) ? data.brandVariations.slice(0, BRAND_MAX) : [],
      );
      setCompanyDescription(
        typeof data.companyDescription === 'string' ? data.companyDescription.slice(0, DESCRIPTION_MAX) : '',
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to analyze website');
    } finally {
      setLoading(false);
    }
  }, [website, accessToken, router]);

  useEffect(() => {
    if (website && accessToken) fetchAnalysis();
    else if (website && !accessToken) setLoading(true);
  }, [website, accessToken, fetchAnalysis]);

  useEffect(() => {
    if (!website && !loading) router.replace('/new-project/website');
  }, [website, loading, router]);

  function handleRemoveBrand(index: number) {
    setBrandVariations((prev) => prev.filter((_, i) => i !== index));
  }

  function handleAddBrand() {
    if (brandVariations.length >= BRAND_MAX) return;
    setBrandVariations((prev) => [...prev, '']);
  }

  function handleBrandChange(index: number, value: string) {
    setBrandVariations((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }

  async function handleContinue(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitLoading(true);
    try {
      const project = await projectsApi.createProject({
        name: companyName || website.replace(/^https?:\/\//, '').split('/')[0] || 'My project',
        website: website.trim(),
        company_description: companyDescription || undefined,
        brand_variations: brandVariations.filter(Boolean),
      });
      router.push(`/dashboard?project=${project.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save project');
    } finally {
      setSubmitLoading(false);
    }
  }

  if (!website) return null;

  return (
    <div className="min-h-screen flex items-stretch bg-[#fff6f2]">
      <div className="w-full lg:w-1/2 flex flex-col px-6 sm:px-10 lg:px-16 py-8">
        <header className="flex items-center justify-between mb-10">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-orange-500 to-red-500" />
            <span className="font-semibold tracking-tight text-slate-900">Reddit LeadGen</span>
          </Link>
        </header>

        <main className="flex-1 flex items-center">
          <div className="w-full max-w-md space-y-8">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="inline-flex h-1.5 w-16 rounded-full bg-orange-200" />
                <span className="inline-flex h-1.5 w-16 rounded-full bg-orange-500" />
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

            {loading ? (
              <div className="bg-white rounded-2xl shadow-lg p-8 space-y-4">
                <div className="flex items-center gap-3 text-slate-600">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
                  <span>Analyzing your website…</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Fetching content and generating company name, brand variations, and description.
                </p>
              </div>
            ) : (
              <form onSubmit={handleContinue} className="space-y-6 bg-white rounded-2xl shadow-lg p-6">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-800">Company Name</label>
                  <div className="relative">
                    <Input
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. ynote.io"
                      className="pr-10"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600" aria-hidden>
                      <Check className="h-4 w-4" />
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-800">Brand name variations</label>
                  <p className="text-xs text-muted-foreground">
                    We use your website to generate up to 3 variations for brand mentions. You can
                    edit them here or later in Settings → Brand name variations.
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {brandVariations.map((brand, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 rounded-full bg-orange-50 border border-orange-200 px-3 py-1 text-sm"
                      >
                        <Input
                          value={brand}
                          onChange={(e) => handleBrandChange(i, e.target.value)}
                          className="h-7 w-24 border-0 bg-transparent p-0 text-sm focus-visible:ring-0"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveBrand(i)}
                          className="text-slate-500 hover:text-slate-700"
                          aria-label="Remove"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </span>
                    ))}
                    {brandVariations.length < BRAND_MAX && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 rounded-full"
                        onClick={handleAddBrand}
                      >
                        + Add
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {BRAND_MAX - brandVariations.length} keywords left
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-800">Company Description</label>
                  <Textarea
                    value={companyDescription}
                    onChange={(e) => setCompanyDescription(e.target.value.slice(0, DESCRIPTION_MAX))}
                    placeholder="What your product does, who it's for, key differentiators…"
                    rows={8}
                    className="resize-y min-h-[140px]"
                  />
                  <p className="text-xs text-muted-foreground">
                    {companyDescription.length}/{DESCRIPTION_MAX} characters
                  </p>
                </div>

                {error && <p className="text-sm text-destructive">{error}</p>}

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
                    onClick={() => router.push('/new-project/website')}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Go Back
                  </Button>
                  <Button
                    type="submit"
                    className="bg-orange-500 hover:bg-orange-600"
                    disabled={submitLoading}
                  >
                    {submitLoading ? 'Saving…' : 'Continue'}
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </form>
            )}
          </div>
        </main>
      </div>

      <div className="hidden lg:flex w-1/2 items-center justify-center bg-gradient-to-br from-orange-500 to-red-500 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top,_#fff,_transparent_60%),_radial-gradient(circle_at_bottom,_#ffe5d0,_transparent_60%)]" />
        <div className="relative max-w-md space-y-8 px-10">
          <div className="flex items-center gap-4 text-white/90">
            <div className="rounded-lg bg-white/20 p-2">
              <MessageSquare className="h-6 w-6" />
            </div>
            <div className="rounded-lg bg-white/20 p-2">
              <div className="h-6 w-6 rounded-full border-2 border-white" />
            </div>
            <div className="rounded-lg bg-white/20 p-2 flex items-center justify-center text-lg font-bold">
              r/
            </div>
          </div>
          <h2 className="text-2xl font-semibold leading-tight">
            We analyze your site and Reddit so you get the best leads.
          </h2>
          <ul className="space-y-4">
            <li className="flex gap-3">
              <Check className="h-5 w-5 shrink-0 text-orange-100" />
              <div>
                <span className="font-medium">Analyzing your website</span>
                <p className="text-sm text-orange-50/90">
                  Scanning your site to understand products, services, and core messaging.
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <Check className="h-5 w-5 shrink-0 text-orange-100" />
              <div>
                <span className="font-medium">Discovering high‑intent keywords</span>
                <p className="text-sm text-orange-50/90">
                  Finding the topics and phrases your audience actively searches for.
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <Check className="h-5 w-5 shrink-0 text-orange-100" />
              <div>
                <span className="font-medium">Generating company description</span>
                <p className="text-sm text-orange-50/90">
                  Creating a clear, AI‑powered summary of your business for engagement.
                </p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
