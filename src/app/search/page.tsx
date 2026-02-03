'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AppLayout } from '@/components/AppLayout';
import { SearchForm } from '@/components/SearchForm';
import { ResultsTable } from '@/components/ResultsTable';
import { SearchStatus } from '@/components/SearchStatus';
import { SearchHistory, SearchHistoryInline } from '@/components/SearchHistory';
import { useTalist } from '@/lib/hooks/useTalist';
import { useSearches } from '@/lib/hooks/useSearches';
import { useAuth } from '@/lib/hooks/useAuth';
import { useActivity } from '@/lib/hooks/useActivity';
import { useToast } from '@/components/Toast';
import { useEffect, useRef, useState } from 'react';
import { CreateEnrichmentParameters } from '@/types/exa';

export default function SearchPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { searches, createSearch, updateSearch } = useSearches();
  const { logSearchCreated, logSearchCompleted, logSearchFailed } = useActivity();
  const savedSearchIdRef = useRef<string | null>(null);
  const currentQueryRef = useRef<string>('');
  const currentCriteriaRef = useRef<string[]>([]);
  const [prefillQuery, setPrefillQuery] = useState<string>('');

  const {
    webset,
    items,
    isSearching,
    isLoadingItems,
    error,
    progress,
    startSearch,
    resumeSearch,
  } = useTalist({
    pollingInterval: 2000,
    onComplete: async (completedWebset, finalItems) => {
      // Update search in Supabase when complete, including persisting results
      if (savedSearchIdRef.current) {
        await updateSearch({
          id: savedSearchIdRef.current,
          status: 'completed',
          resultsCount: finalItems.length,
          results: finalItems, // Persist results to Supabase
          completedAt: new Date().toISOString(),
        });
      }

      // Log activity
      if (currentQueryRef.current) {
        logSearchCompleted(currentQueryRef.current, finalItems.length);
      }

      // Note: No redirect here - user is already on the detail page
    },
    onError: async (err) => {
      // Update search status to failed
      if (savedSearchIdRef.current) {
        await updateSearch({
          id: savedSearchIdRef.current,
          status: 'failed',
          errorMessage: err.message,
        });
      }

      // Log activity
      if (currentQueryRef.current) {
        logSearchFailed(currentQueryRef.current, err.message);
      }
    },
  });

  // Redirect to search detail page immediately when webset is created
  useEffect(() => {
    if (webset?.id && isSearching) {
      // Immediately redirect to the search detail page
      router.push(`/searches/${webset.id}`);
    }
  }, [webset?.id, isSearching, router]);

  // Save search to Supabase when webset is created
  useEffect(() => {
    const saveSearchToSupabase = async () => {
      if (webset && isAuthenticated && !savedSearchIdRef.current) {
        const search = webset.searches?.[0];
        const saved = await createSearch({
          name: search?.query || 'Untitled Search',
          query: search?.query || '',
          count: search?.count || 20,
          criteria: search?.criteria?.map(c => c.description) || [],
          enrichments: [],
          exaWebsetId: webset.id,
        });
        if (saved) {
          savedSearchIdRef.current = saved.id;
        }
      }
    };

    saveSearchToSupabase();
  }, [webset, isAuthenticated, createSearch]);

  // Resume any running searches on page load
  const resumeAttemptedRef = useRef(false);
  useEffect(() => {
    if (resumeAttemptedRef.current || !isAuthenticated || isSearching) return;
    const runningSearch = searches.find(s => s.status === 'running' && s.exa_webset_id);
    if (runningSearch?.exa_webset_id) {
      resumeAttemptedRef.current = true;
      savedSearchIdRef.current = runningSearch.id;
      currentQueryRef.current = runningSearch.query || '';
      addToast('Resuming your running search...', 'info');
      resumeSearch(runningSearch.exa_webset_id);
    }
  }, [searches, isAuthenticated, isSearching, resumeSearch, addToast]);

  // Reset saved search ID when search completes or errors
  useEffect(() => {
    if (!isSearching && !webset) {
      savedSearchIdRef.current = null;
    }
  }, [isSearching, webset]);

  const handleSearch = async (
    query: string,
    count: number,
    criteria: string[],
    enrichments: CreateEnrichmentParameters[]
  ) => {
    savedSearchIdRef.current = null; // Reset for new search
    currentQueryRef.current = query; // Track current query for activity logging
    currentCriteriaRef.current = criteria; // Track criteria for results display

    // Log search started activity
    logSearchCreated(query, count);

    await startSearch(query, count, criteria, enrichments);
  };

  // Auth gate: require sign-in to search
  if (!authLoading && !isAuthenticated) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-14 h-14 rounded-full bg-[var(--primary-light)] flex items-center justify-center mb-4">
            <span className="material-icons-outlined text-2xl text-[var(--primary)]">lock</span>
          </div>
          <h1 className="text-lg font-semibold text-[var(--text-primary)] tracking-tight mb-1.5">
            Sign in to start searching
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mb-5 text-center max-w-sm">
            Create an account or sign in to use AI-powered candidate search. Your searches and results will be saved automatically.
          </p>
          <Link
            href="/auth/login?redirect=/search"
            className="btn btn-primary"
          >
            <span className="material-icons-outlined text-sm">login</span>
            Sign In to Search
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center max-w-xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[var(--primary-light)] border border-[var(--primary)]/10 rounded-md">
              <span className="material-icons-outlined text-xs text-[var(--primary)]">auto_awesome</span>
              <span className="text-[10px] font-medium text-[var(--primary)]">AI-Powered Search</span>
            </div>
            <SearchHistory
              onRepeatSearch={(query, count, criteria) => {
                handleSearch(query, count, criteria, []);
              }}
            />
          </div>
          <h1 className="text-lg font-semibold text-[var(--text-primary)] tracking-tight mb-1.5">
            Find your ideal candidates
          </h1>
          <p className="text-xs text-[var(--text-secondary)]">
            Describe who you're looking for in plain English. Our AI searches the entire web to find people who match.
          </p>
        </div>

        {/* Search Form Card */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-[var(--bg-elevated)] rounded-lg border border-[var(--border-light)] p-4 shadow-[var(--shadow-xs)]">
            <SearchForm onSearch={handleSearch} isLoading={isSearching} initialQuery={prefillQuery} showSaveTemplate={true} />
            <SearchHistoryInline onSelect={(query) => setPrefillQuery(query)} />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="max-w-2xl mx-auto animate-slide-up">
            <div className="rounded-md border border-[var(--error)]/20 bg-[var(--error-bg)] px-3 py-2 text-[var(--error-text)] text-xs flex items-start gap-2">
              <span className="material-icons-outlined text-sm mt-0.5">error</span>
              <div>
                <p className="font-medium">Search Error</p>
                <p className="text-[var(--error-text)]/80 mt-0.5">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Search Status */}
        {webset && (
          <div className="max-w-2xl mx-auto animate-slide-up">
            <SearchStatus webset={webset} progress={progress} recentItems={items} />

            {/* Progress hint */}
            {isSearching && progress.completion < 100 && (
              <p className="text-center text-[10px] text-[var(--text-muted)] mt-2">
                You'll be automatically redirected when the search is complete
              </p>
            )}
          </div>
        )}

        {/* Results Preview - Full Width Table Layout */}
        {(items.length > 0 || isLoadingItems) && (
          <div className="animate-slide-up">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[var(--success-bg)] flex items-center justify-center">
                  <span className="material-icons-outlined text-sm text-[var(--success)]">group</span>
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                    Live Results
                  </h2>
                  <p className="text-[10px] text-[var(--text-tertiary)]">
                    {isSearching
                      ? `Finding candidates... ${items.length} found so far`
                      : `Found ${items.length} candidates`
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isSearching && (
                  <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-[var(--primary-light)] text-[var(--primary)] text-[10px] font-medium rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                    Searching...
                  </span>
                )}
                {webset && items.length > 0 && (
                  <button
                    onClick={() => router.push(`/searches/${webset.id}`)}
                    className="btn btn-primary text-xs"
                  >
                    <span className="material-icons-outlined text-sm">open_in_new</span>
                    View All Results
                  </button>
                )}
              </div>
            </div>

            {/* Results Table - Same layout as saved searches */}
            <div className="bg-[var(--bg-elevated)] rounded-lg border border-[var(--border-light)] overflow-hidden">
              <ResultsTable
                items={items}
                criteria={currentCriteriaRef.current}
                isLoading={isLoadingItems && items.length === 0}
                searchId={webset?.id}
              />

              {/* Footer */}
              {items.length > 0 && (
                <div className="px-4 py-2.5 border-t border-[var(--border-light)] bg-[var(--bg-surface)] flex items-center justify-between">
                  <p className="text-xs text-[var(--text-muted)]">
                    {isSearching ? `${items.length} candidates found so far...` : `${items.length} total candidates`}
                  </p>
                  {webset && (
                    <button
                      onClick={() => router.push(`/searches/${webset.id}`)}
                      className="text-xs text-[var(--primary)] hover:underline font-medium"
                    >
                      Open full view →
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Empty state when no search */}
        {!webset && !isSearching && items.length === 0 && (
          <div className="max-w-2xl mx-auto">
            <div className="grid sm:grid-cols-3 gap-3 mt-6">
              {[
                {
                  icon: 'search',
                  title: 'Natural Language',
                  description: 'Describe candidates like you would to a colleague'
                },
                {
                  icon: 'gps_fixed',
                  title: 'Precision Matching',
                  description: 'Every result verified against your criteria'
                },
                {
                  icon: 'bolt',
                  title: 'Instant Results',
                  description: 'Watch candidates appear in real-time'
                }
              ].map((feature, i) => (
                <div key={i} className="p-3 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-light)]">
                  <div className="w-7 h-7 rounded-md bg-[var(--primary-light)] flex items-center justify-center mb-2">
                    <span className="material-icons-outlined text-sm text-[var(--primary)]">{feature.icon}</span>
                  </div>
                  <h3 className="text-xs font-semibold text-[var(--text-primary)] mb-0.5">{feature.title}</h3>
                  <p className="text-[10px] text-[var(--text-tertiary)]">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
