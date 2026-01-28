'use client';

import { useState, useRef, useEffect } from 'react';
import { useSearches } from '@/lib/hooks/useSearches';
import { useRouter } from 'next/navigation';

interface SearchHistoryProps {
  onRepeatSearch?: (query: string, count: number, criteria: string[]) => void;
  currentQuery?: string;
}

export function SearchHistory({ onRepeatSearch, currentQuery }: SearchHistoryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { searches, isLoading } = useSearches();
  const router = useRouter();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get unique searches by query (deduplicate)
  const uniqueSearches = searches
    .filter(s => s.query && s.query.trim())
    .reduce((acc, search) => {
      const key = search.query.toLowerCase().trim();
      if (!acc.has(key)) {
        acc.set(key, search);
      }
      return acc;
    }, new Map())
    .values();

  const recentSearches = Array.from(uniqueSearches).slice(0, 10);

  const handleRepeat = (search: typeof searches[0]) => {
    if (onRepeatSearch) {
      // Extract criteria as string array, with proper type checking
      let criteriaArray: string[] = [];
      if (Array.isArray(search.criteria)) {
        criteriaArray = search.criteria.filter((c): c is string => typeof c === 'string');
      }
      onRepeatSearch(
        search.query,
        search.count || 20,
        criteriaArray
      );
    }
    setIsOpen(false);
  };

  const handleView = (search: typeof searches[0]) => {
    router.push(`/searches/${search.exa_webset_id || search.id}`);
    setIsOpen(false);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 rounded hover:bg-[var(--bg-surface)] transition-colors text-[var(--text-muted)] hover:text-[var(--text-primary)]"
        title="Search history"
      >
        <span className="material-icons-outlined text-sm">history</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-80 bg-[var(--bg-elevated)] border border-[var(--border-light)] rounded-lg shadow-lg z-50 animate-scale-in">
          <div className="p-3 border-b border-[var(--border-light)]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[var(--text-primary)]">Recent Searches</span>
              {recentSearches.length > 0 && (
                <button
                  onClick={() => router.push('/searches')}
                  className="text-[10px] text-[var(--primary)] hover:underline"
                >
                  View all
                </button>
              )}
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center">
                <span className="material-icons-outlined text-sm animate-spin text-[var(--text-muted)]">refresh</span>
              </div>
            ) : recentSearches.length === 0 ? (
              <div className="p-6 text-center">
                <span className="material-icons-outlined text-3xl text-[var(--text-muted)] mb-2 block">search_off</span>
                <p className="text-xs text-[var(--text-muted)]">No search history yet</p>
              </div>
            ) : (
              recentSearches.map((search) => (
                <div
                  key={search.id}
                  className={`p-3 border-b border-[var(--border-light)] hover:bg-[var(--bg-surface)] transition-colors group ${
                    currentQuery?.toLowerCase() === search.query.toLowerCase() ? 'bg-[var(--primary-light)]' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-[var(--text-primary)] truncate">
                        {search.query}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                          search.status === 'completed'
                            ? 'bg-[var(--success-bg)] text-[var(--success)]'
                            : search.status === 'failed'
                            ? 'bg-[var(--error-bg)] text-[var(--error)]'
                            : 'bg-[var(--primary-light)] text-[var(--primary)]'
                        }`}>
                          {search.status}
                        </span>
                        <span className="text-[10px] text-[var(--text-muted)]">
                          {search.results_count || 0} results
                        </span>
                        <span className="text-[10px] text-[var(--text-muted)]">
                          {formatDate(search.created_at)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {onRepeatSearch && (
                        <button
                          onClick={() => handleRepeat(search)}
                          className="p-1 rounded hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--primary)]"
                          title="Repeat this search"
                        >
                          <span className="material-icons-outlined text-sm">replay</span>
                        </button>
                      )}
                      <button
                        onClick={() => handleView(search)}
                        className="p-1 rounded hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--primary)]"
                        title="View results"
                      >
                        <span className="material-icons-outlined text-sm">open_in_new</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {recentSearches.length > 0 && (
            <div className="p-2 border-t border-[var(--border-light)]">
              <p className="text-[10px] text-[var(--text-muted)] text-center">
                Click <span className="material-icons-outlined text-[10px] align-middle">replay</span> to repeat a search
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Compact inline version for search input
export function SearchHistoryInline({ onSelect }: { onSelect: (query: string) => void }) {
  const { searches } = useSearches();

  const recentQueries = searches
    .filter(s => s.query && s.query.trim())
    .slice(0, 5)
    .map(s => s.query);

  // Deduplicate
  const uniqueQueries = [...new Set(recentQueries)].slice(0, 5);

  if (uniqueQueries.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-1 mt-2">
      <span className="text-[10px] text-[var(--text-muted)]">Recent:</span>
      {uniqueQueries.map((query, i) => (
        <button
          key={i}
          onClick={() => onSelect(query)}
          className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:bg-[var(--primary-light)] hover:text-[var(--primary)] transition-colors truncate max-w-[120px]"
          title={query}
        >
          {query.length > 20 ? query.slice(0, 20) + '...' : query}
        </button>
      ))}
    </div>
  );
}
