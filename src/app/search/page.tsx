'use client';

import { useState, useCallback } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { SearchForm } from '@/components/SearchForm';
import { CandidateTable } from '@/components/CandidateTable';
import { WebsetStatus } from '@/components/WebsetStatus';
import { Webset, WebsetItem, CreateEnrichmentParameters } from '@/types/exa';

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
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center max-w-xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[var(--primary-light)] border border-[var(--primary)]/10 rounded-md mb-3">
            <span className="material-icons-outlined text-xs text-[var(--primary)]">auto_awesome</span>
            <span className="text-[10px] font-medium text-[var(--primary)]">AI-Powered Search</span>
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
            <SearchForm onSearch={handleSearch} isLoading={isSearching} />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="max-w-2xl mx-auto">
            <div className="rounded-md border border-[var(--error)]/20 bg-[var(--error-bg)] px-3 py-2 text-[var(--error-text)] text-xs flex items-start gap-2">
              <span className="material-icons-outlined text-sm mt-0.5">error</span>
              <div>
                <p className="font-medium">Search Error</p>
                <p className="text-[var(--error-text)]/80 mt-0.5">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Webset Status */}
        {webset && (
          <div className="max-w-2xl mx-auto">
            <WebsetStatus webset={webset} />
          </div>
        )}

        {/* Results */}
        {(items.length > 0 || isLoadingItems) && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                  Search Results
                </h2>
                {items.length > 0 && (
                  <p className="text-[10px] text-[var(--text-tertiary)] mt-0.5">
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
