'use client';

import { useState, useCallback } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { SearchForm } from '@/components/SearchForm';
import { CandidateTable } from '@/components/CandidateTable';
import { WebsetStatus } from '@/components/WebsetStatus';
import { Webset, WebsetItem, CreateEnrichmentParameters } from '@/types/exa';
import { Sparkles, Search, Target, Zap } from 'lucide-react';

export default function SearchPage() {
  const [webset, setWebset] = useState<Webset | null>(null);
  const [items, setItems] = useState<WebsetItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingItems, setIsLoadingItems] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pollWebset = useCallback(async (websetId: string) => {
    try {
      const response = await fetch(`/api/websets/${websetId}`);
      if (!response.ok) throw new Error('Failed to fetch webset');
      const data: Webset = await response.json();
      setWebset(data);

      if (data.status === 'running' || data.status === 'idle') {
        await fetchItems(websetId);
        setTimeout(() => pollWebset(websetId), 3000);
      } else if (data.status === 'completed') {
        await fetchItems(websetId);
        setIsSearching(false);
      } else if (data.status === 'failed') {
        setError('Search failed. Please try again.');
        setIsSearching(false);
      }
    } catch (err) {
      console.error('Error polling webset:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      setIsSearching(false);
    }
  }, []);

  const fetchItems = async (websetId: string) => {
    setIsLoadingItems(true);
    try {
      const response = await fetch(`/api/websets/${websetId}/items?limit=100`);
      if (!response.ok) throw new Error('Failed to fetch items');
      const data = await response.json();
      setItems(data.data || []);
    } catch (err) {
      console.error('Error fetching items:', err);
    } finally {
      setIsLoadingItems(false);
    }
  };

  const handleSearch = async (
    query: string,
    count: number,
    criteria: string[],
    enrichments: CreateEnrichmentParameters[]
  ) => {
    setIsSearching(true);
    setError(null);
    setItems([]);
    setWebset(null);

    try {
      const response = await fetch('/api/websets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          count,
          criteria,
          enrichments,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create search');
      }

      const data: Webset = await response.json();
      setWebset(data);
      pollWebset(data.id);
    } catch (err) {
      console.error('Error creating search:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      setIsSearching(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[var(--accent-light)] border border-[var(--accent)]/10 rounded-full mb-4">
            <Sparkles className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span className="text-xs font-medium text-[var(--accent)]">AI-Powered Search</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-semibold text-[var(--text-primary)] tracking-tight mb-3">
            Find your ideal candidates
          </h1>
          <p className="text-[var(--text-secondary)]">
            Describe who you're looking for in plain English. Our AI searches the entire web to find people who match.
          </p>
        </div>

        {/* Search Form Card */}
        <div className="max-w-3xl mx-auto">
          <div className="bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-light)] p-6 shadow-[var(--shadow-sm)]">
            <SearchForm onSearch={handleSearch} isLoading={isSearching} />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="max-w-3xl mx-auto">
            <div className="rounded-lg border border-[var(--error)]/20 bg-[var(--error-light)] px-4 py-3 text-[var(--error)] text-sm flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-[var(--error)]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold">!</span>
              </div>
              <div>
                <p className="font-medium">Search Error</p>
                <p className="text-[var(--error)]/80 mt-0.5">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Webset Status */}
        {webset && (
          <div className="max-w-3xl mx-auto">
            <WebsetStatus webset={webset} />
          </div>
        )}

        {/* Results */}
        {(items.length > 0 || isLoadingItems) && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                  Search Results
                </h2>
                {items.length > 0 && (
                  <p className="text-sm text-[var(--text-tertiary)] mt-0.5">
                    Found {items.length} candidates matching your criteria
                  </p>
                )}
              </div>
            </div>
            <CandidateTable items={items} isLoading={isLoadingItems && items.length === 0} />
          </div>
        )}

        {/* Empty state when no search */}
        {!webset && !isSearching && items.length === 0 && (
          <div className="max-w-3xl mx-auto">
            <div className="grid sm:grid-cols-3 gap-4 mt-8">
              {[
                {
                  icon: Search,
                  title: 'Natural Language',
                  description: 'Describe candidates like you would to a colleague'
                },
                {
                  icon: Target,
                  title: 'Precision Matching',
                  description: 'Every result verified against your criteria'
                },
                {
                  icon: Zap,
                  title: 'Instant Results',
                  description: 'Watch candidates appear in real-time'
                }
              ].map((feature, i) => (
                <div key={i} className="p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-light)]">
                  <div className="w-9 h-9 rounded-lg bg-[var(--accent-light)] flex items-center justify-center mb-3">
                    <feature.icon className="w-4 h-4 text-[var(--accent)]" />
                  </div>
                  <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">{feature.title}</h3>
                  <p className="text-xs text-[var(--text-tertiary)]">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
