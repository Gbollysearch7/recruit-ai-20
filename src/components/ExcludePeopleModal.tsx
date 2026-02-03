'use client';

import { useState, useEffect, useMemo } from 'react';
import { Modal } from './Modal';
import { useSearches } from '@/lib/hooks/useSearches';
import { WebsetItem, getPersonFromItem } from '@/types/exa';
import type { Search } from '@/lib/supabase/types';

interface ExcludePeopleModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSearchId: string;
  onApply: (excludedSearchIds: Set<string>, excludedItemIds: Set<string>) => void;
  initialExcludedSearchIds?: Set<string>;
}

// Helper to format relative time
function formatTimeAgo(dateString: string | null): string {
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
  return date.toLocaleDateString();
}

export function ExcludePeopleModal({
  isOpen,
  onClose,
  currentSearchId,
  onApply,
  initialExcludedSearchIds = new Set(),
}: ExcludePeopleModalProps) {
  const { searches } = useSearches();
  const [selectedSearchIds, setSelectedSearchIds] = useState<Set<string>>(new Set(initialExcludedSearchIds));
  const [searchFilter, setSearchFilter] = useState('');

  // Reset selection when modal opens with initial values
  useEffect(() => {
    if (isOpen) {
      setSelectedSearchIds(new Set(initialExcludedSearchIds));
      setSearchFilter('');
    }
  }, [isOpen, initialExcludedSearchIds]);

  // Filter out current search and get other searches with results
  const availableSearches = useMemo(() => {
    return searches.filter(search => {
      // Exclude current search
      if (search.exa_webset_id === currentSearchId || search.id === currentSearchId) {
        return false;
      }
      // Only show completed searches with results
      if (search.status !== 'completed') return false;
      if (!search.results || !Array.isArray(search.results) || search.results.length === 0) {
        return false;
      }
      // Apply search filter
      if (searchFilter) {
        const filterLower = searchFilter.toLowerCase();
        return search.query.toLowerCase().includes(filterLower);
      }
      return true;
    });
  }, [searches, currentSearchId, searchFilter]);

  // Calculate excluded candidates from selected searches
  const excludedCandidates = useMemo(() => {
    const candidates: Array<{ id: string; name: string; company?: string; searchQuery: string }> = [];
    const seenIds = new Set<string>();

    selectedSearchIds.forEach(searchId => {
      const search = searches.find(s => s.id === searchId || s.exa_webset_id === searchId);
      if (search?.results && Array.isArray(search.results)) {
        const items = search.results as unknown as WebsetItem[];
        items.forEach(item => {
          if (!seenIds.has(item.id)) {
            seenIds.add(item.id);
            const person = getPersonFromItem(item);
            candidates.push({
              id: item.id,
              name: person?.name || 'Unknown',
              company: person?.company?.name,
              searchQuery: search.query,
            });
          }
        });
      }
    });

    return candidates;
  }, [selectedSearchIds, searches]);

  // Get all item IDs to exclude
  const excludedItemIds = useMemo(() => {
    const ids = new Set<string>();
    excludedCandidates.forEach(c => ids.add(c.id));
    return ids;
  }, [excludedCandidates]);

  const handleToggleSearch = (searchId: string) => {
    const newSelected = new Set(selectedSearchIds);
    if (newSelected.has(searchId)) {
      newSelected.delete(searchId);
    } else {
      newSelected.add(searchId);
    }
    setSelectedSearchIds(newSelected);
  };

  const handleRemoveSearch = (searchId: string) => {
    const newSelected = new Set(selectedSearchIds);
    newSelected.delete(searchId);
    setSelectedSearchIds(newSelected);
  };

  const handleApply = () => {
    onApply(selectedSearchIds, excludedItemIds);
    onClose();
  };

  const handleClear = () => {
    setSelectedSearchIds(new Set());
  };

  // Get search info for selected search chips
  const selectedSearches = useMemo(() => {
    return Array.from(selectedSearchIds)
      .map(id => searches.find(s => s.id === id || s.exa_webset_id === id))
      .filter((s): s is Search => s !== undefined);
  }, [selectedSearchIds, searches]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Exclude People" size="lg">
      <div className="space-y-4">
        {/* Subtitle */}
        <p className="text-xs text-[var(--text-secondary)] -mt-2">
          Exclude results you already have from your search
        </p>

        {/* Search input */}
        <div className="relative">
          <span className="material-icons-outlined absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--text-muted)]">
            search
          </span>
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search Websets"
            className="w-full pl-9 pr-3 py-2 text-sm border border-[var(--border-light)] rounded-lg focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] outline-none transition-colors bg-[var(--bg-elevated)]"
          />
        </div>

        {/* Searches list */}
        <div className="max-h-[280px] overflow-y-auto space-y-1 border border-[var(--border-light)] rounded-lg p-2">
          {availableSearches.length === 0 ? (
            <div className="text-center py-8 text-[var(--text-muted)]">
              <span className="material-icons-outlined text-2xl mb-2 block">search_off</span>
              <p className="text-xs">No other searches with results found</p>
            </div>
          ) : (
            availableSearches.map((search) => {
              const isSelected = selectedSearchIds.has(search.id);
              const resultCount = Array.isArray(search.results) ? search.results.length : (search.results_count || 0);

              return (
                <button
                  key={search.id}
                  onClick={() => handleToggleSearch(search.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    isSelected
                      ? 'border-[var(--primary)] bg-[var(--primary-light)]'
                      : 'border-transparent hover:bg-[var(--bg-surface)]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                        {search.query}
                      </p>
                      <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
                        {formatTimeAgo(search.created_at)} - {resultCount} result{resultCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'border-[var(--primary)] bg-[var(--primary)]'
                        : 'border-[var(--border)]'
                    }`}>
                      {isSelected && (
                        <span className="material-icons-outlined text-white text-sm">check</span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Selected searches preview */}
        {selectedSearches.length > 0 && (
          <div className="p-3 bg-[var(--bg-surface)] rounded-lg border border-[var(--border-light)]">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-[var(--text-primary)]">
                {excludedCandidates.length} people will be excluded
              </p>
              <button
                onClick={handleClear}
                className="text-[10px] text-[var(--text-muted)] hover:text-[var(--error)] transition-colors"
              >
                Clear all
              </button>
            </div>

            {/* Selected search chips */}
            <div className="flex flex-wrap gap-1.5 mb-2">
              {selectedSearches.map((search) => (
                <div
                  key={search.id}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-[var(--bg-elevated)] border border-[var(--border-light)] rounded text-xs"
                >
                  <span className="truncate max-w-[150px] text-[var(--text-secondary)]">
                    {search.query.length > 30 ? search.query.slice(0, 30) + '...' : search.query}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveSearch(search.id);
                    }}
                    className="text-[var(--text-muted)] hover:text-[var(--error)] transition-colors"
                  >
                    <span className="material-icons-outlined text-xs">close</span>
                  </button>
                </div>
              ))}
            </div>

            {/* Preview of excluded people */}
            {excludedCandidates.length > 0 && (
              <div className="max-h-20 overflow-y-auto">
                <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
                  {excludedCandidates.slice(0, 10).map((candidate) => (
                    <p key={candidate.id} className="text-[10px] text-[var(--text-muted)] truncate">
                      {candidate.name}
                      {candidate.company && <span className="text-[var(--text-muted)]/60"> - {candidate.company}</span>}
                    </p>
                  ))}
                </div>
                {excludedCandidates.length > 10 && (
                  <p className="text-[10px] text-[var(--text-muted)] mt-1">
                    and {excludedCandidates.length - 10} more...
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-2 border-t border-[var(--border-light)]">
          <button
            onClick={onClose}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            disabled={selectedSearchIds.size === 0}
            className={`btn ${selectedSearchIds.size > 0 ? 'btn-primary' : 'btn-secondary opacity-50 cursor-not-allowed'}`}
          >
            <span className="material-icons-outlined text-sm">filter_alt</span>
            Exclude {excludedCandidates.length > 0 ? `(${excludedCandidates.length})` : ''}
          </button>
        </div>
      </div>
    </Modal>
  );
}
