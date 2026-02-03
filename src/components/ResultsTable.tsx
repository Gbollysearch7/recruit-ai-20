'use client';

import { useState, useMemo } from 'react';
import { WebsetItem, getPersonFromItem } from '@/types/exa';
import { useCandidates } from '@/lib/hooks/useCandidates';
import { useAuth } from '@/lib/hooks/useAuth';
import { useToast } from './Toast';
import { AddToListDialog } from './AddToListDialog';

interface ResultsTableProps {
  items: WebsetItem[];
  criteria: string[];
  isLoading?: boolean;
  onSelectionChange?: (selectedIds: Set<string>) => void;
  onRowClick?: (item: WebsetItem) => void;
  selectedRowId?: string | null;
  searchId?: string;
  excludedItemIds?: Set<string>; // Items to hide (from excluded websets)
}

type MatchStatus = 'Match' | 'Miss' | 'Unclear';

// Get match status from evaluations if available, otherwise simulate
function getMatchStatusFromItem(item: WebsetItem, criterionIndex: number): MatchStatus {
  const evaluation = item.evaluations?.[criterionIndex];
  if (evaluation) {
    switch (evaluation.satisfied) {
      case 'yes': return 'Match';
      case 'no': return 'Miss';
      default: return 'Unclear';
    }
  }
  // Fallback to simulated status for mock data
  const seed = parseInt(item.id) + criterionIndex + 2;
  if (seed % 7 === 0) return 'Miss';
  if (seed % 5 === 0) return 'Unclear';
  return 'Match';
}

function getMatchBadgeClass(status: MatchStatus) {
  switch (status) {
    case 'Match':
      return 'match-badge match-badge-match';
    case 'Miss':
      return 'match-badge match-badge-miss';
    case 'Unclear':
      return 'match-badge match-badge-unclear';
  }
}

function getReferenceCount(item: WebsetItem, criterionIndex: number) {
  const evaluation = item.evaluations?.[criterionIndex];
  if (evaluation?.references) {
    return evaluation.references.length;
  }
  // Fallback for mock data
  const seed = parseInt(item.id) + criterionIndex + 2;
  return ((seed * 7) % 30) + 1;
}

// Criteria colors matching the design
const criteriaColors = ['bg-purple-500', 'bg-orange-500', 'bg-blue-500', 'bg-slate-300'];

export function ResultsTable({ items, criteria, isLoading, onSelectionChange, onRowClick, selectedRowId, searchId, excludedItemIds }: ResultsTableProps) {
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set());
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [addToListItem, setAddToListItem] = useState<{ id: string; name: string } | null>(null);
  const [bulkAddToList, setBulkAddToList] = useState(false);

  const { saveCandidate, saveCandidates, savedExaItemIds } = useCandidates();

  // Filter out candidates that were already saved OR excluded from selected websets
  const { filteredItems, savedExcludedCount, websetExcludedCount } = useMemo(() => {
    let filtered = items;
    let savedCount = 0;
    let websetCount = 0;

    // First filter out already saved candidates
    filtered = filtered.filter(item => {
      if (savedExaItemIds.has(item.id)) {
        savedCount++;
        return false;
      }
      return true;
    });

    // Then filter out candidates from excluded websets
    if (excludedItemIds && excludedItemIds.size > 0) {
      filtered = filtered.filter(item => {
        if (excludedItemIds.has(item.id)) {
          websetCount++;
          return false;
        }
        return true;
      });
    }

    return {
      filteredItems: filtered,
      savedExcludedCount: savedCount,
      websetExcludedCount: websetCount,
    };
  }, [items, savedExaItemIds, excludedItemIds]);

  // Total excluded count for display
  const excludedCount = savedExcludedCount + websetExcludedCount;
  const [isBulkSaving, setIsBulkSaving] = useState(false);
  const { isAuthenticated } = useAuth();
  const { addToast } = useToast();

  const updateSelection = (newSelection: Set<string>) => {
    setSelectedRows(newSelection);
    onSelectionChange?.(newSelection);
  };

  const toggleRow = (id: string) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    updateSelection(newSelected);
  };

  const toggleAll = () => {
    if (selectedRows.size === filteredItems.length) {
      updateSelection(new Set());
    } else {
      updateSelection(new Set(filteredItems.map(item => item.id)));
    }
  };

  const handleSaveCandidate = async (item: WebsetItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      addToast('Please sign in to save candidates', 'error');
      return;
    }
    if (savingIds.has(item.id) || savedIds.has(item.id)) return;

    setSavingIds(prev => new Set([...prev, item.id]));
    try {
      const person = getPersonFromItem(item);
      const saved = await saveCandidate({
        name: person?.name || 'Unknown',
        company: person?.company?.name,
        title: person?.position,
        linkedin: item.properties.url,
        avatar: person?.pictureUrl,
        source: `exa_search:${searchId || 'unknown'}`,
        exaItemId: item.id,       // Store the Exa item ID for deduplication
        searchId: searchId,       // Link to the search
      });
      if (saved) {
        setSavedIds(prev => new Set([...prev, item.id]));
        addToast(`Saved ${person?.name || 'candidate'}`, 'success');
      } else {
        addToast('Failed to save candidate', 'error');
      }
    } finally {
      setSavingIds(prev => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
    }
  };

  const handleAddToList = (item: WebsetItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      addToast('Please sign in to add to list', 'error');
      return;
    }
    const person = getPersonFromItem(item);
    setAddToListItem({ id: item.id, name: person?.name || 'Unknown' });
  };

  const handleBulkAddToList = () => {
    if (!isAuthenticated) {
      addToast('Please sign in to add to list', 'error');
      return;
    }
    if (selectedRows.size === 0) {
      addToast('Select candidates first', 'error');
      return;
    }
    setBulkAddToList(true);
  };

  const handleBulkSave = async () => {
    if (!isAuthenticated) {
      addToast('Please sign in to save candidates', 'error');
      return;
    }
    if (selectedRows.size === 0) {
      addToast('Select candidates first', 'error');
      return;
    }

    setIsBulkSaving(true);
    try {
      const selectedItems = filteredItems.filter(item => selectedRows.has(item.id) && !savedIds.has(item.id));
      if (selectedItems.length === 0) {
        addToast('All selected candidates are already saved', 'info');
        return;
      }

      const candidateParams = selectedItems.map(item => {
        const person = getPersonFromItem(item);
        return {
          name: person?.name || 'Unknown',
          company: person?.company?.name,
          title: person?.position,
          linkedin: item.properties.url,
          avatar: person?.pictureUrl,
          source: `exa_search:${searchId || 'unknown'}`,
          exaItemId: item.id,       // Store the Exa item ID for deduplication
          searchId: searchId,       // Link to the search
        };
      });

      const saved = await saveCandidates(candidateParams);
      if (saved.length > 0) {
        const newSavedIds = new Set(savedIds);
        selectedItems.forEach(item => newSavedIds.add(item.id));
        setSavedIds(newSavedIds);
        addToast(`Saved ${saved.length} candidate${saved.length > 1 ? 's' : ''}`, 'success');
      } else {
        addToast('Failed to save candidates', 'error');
      }
    } finally {
      setIsBulkSaving(false);
    }
  };

  // Memoize criteria columns
  const criteriaColumns = useMemo(() => criteria.slice(0, 3).map((c, i) => ({
    id: `criteria-${i}`,
    label: c.length > 18 ? c.slice(0, 18) + '...' : c,
    fullLabel: c,
    color: criteriaColors[i] || criteriaColors[3],
  })), [criteria]);

  if (isLoading) {
    return (
      <div className="flex-1 bg-white dark:bg-black/20 overflow-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-[var(--bg-surface)] border-b border-[var(--border-light)]" />
          {[...Array(15)].map((_, i) => (
            <div key={i} className="h-7 border-b border-[var(--border-light)] flex items-center px-2 gap-2">
              <div className="w-6 h-3 bg-[var(--bg-surface)] rounded" />
              <div className="w-5 h-5 bg-[var(--bg-surface)] rounded" />
              <div className="w-24 h-3 bg-[var(--bg-surface)] rounded" />
              <div className="w-20 h-3 bg-[var(--bg-surface)] rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex-1 bg-white dark:bg-black/20 flex items-center justify-center">
        <div className="text-center text-[var(--text-tertiary)]">
          <p className="text-sm font-medium">No results yet</p>
          <p className="text-xs mt-1">Start a search to find candidates</p>
        </div>
      </div>
    );
  }

  // All results were filtered out
  if (filteredItems.length === 0 && excludedCount > 0) {
    return (
      <div className="flex-1 bg-white dark:bg-black/20 flex items-center justify-center">
        <div className="text-center text-[var(--text-tertiary)]">
          <span className="material-icons-outlined text-3xl text-[var(--primary)] mb-2 block">filter_alt</span>
          <p className="text-sm font-medium text-[var(--text-primary)]">All candidates filtered out</p>
          <p className="text-xs mt-1 max-w-xs">
            {savedExcludedCount > 0 && `${savedExcludedCount} already saved`}
            {savedExcludedCount > 0 && websetExcludedCount > 0 && ', '}
            {websetExcludedCount > 0 && `${websetExcludedCount} from excluded searches`}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-white dark:bg-black/20 overflow-auto">
      {/* Show excluded count banner if any candidates were filtered */}
      {excludedCount > 0 && (
        <div className="px-3 py-1.5 bg-[var(--primary-light)] border-b border-[var(--primary)]/20 flex items-center gap-2">
          <span className="material-icons-outlined text-sm text-[var(--primary)]">filter_alt</span>
          <span className="text-xs text-[var(--primary)]">
            {excludedCount} candidate{excludedCount > 1 ? 's' : ''} excluded
            {savedExcludedCount > 0 && websetExcludedCount > 0
              ? ` (${savedExcludedCount} saved, ${websetExcludedCount} from excluded searches)`
              : savedExcludedCount > 0
                ? ' (already saved)'
                : ' (from excluded searches)'
            }
          </span>
        </div>
      )}
      <table className="dense-table">
        <thead>
          <tr>
            <th className="w-10 text-center">
              <input
                type="checkbox"
                checked={selectedRows.size === filteredItems.length && filteredItems.length > 0}
                onChange={toggleAll}
              />
            </th>
            <th className="w-10 text-center">#</th>
            <th className="w-48">
              <div className="flex items-center gap-2">
                <span className="material-icons-outlined text-sm opacity-50">person</span>
                Name
              </div>
            </th>
            <th className="w-40">
              <div className="flex items-center gap-2">
                <span className="material-icons-outlined text-sm opacity-50">business</span>
                Company
              </div>
            </th>
            <th className="w-48">
              <div className="flex items-center gap-2">
                <span className="material-icons-outlined text-sm opacity-50">work_outline</span>
                Job Title
              </div>
            </th>
            <th className="w-48">
              <div className="flex items-center gap-2">
                <span className="material-icons-outlined text-sm opacity-50">link</span>
                URL
              </div>
            </th>
            {criteriaColumns.map((col) => (
              <th key={col.id} className="min-w-[140px]">
                <div className="flex items-center gap-2" title={col.fullLabel}>
                  <span className={`w-2 h-2 rounded-sm ${col.color}`}></span>
                  {col.label}
                </div>
              </th>
            ))}
            <th className="w-24 text-center">
              <div className="flex items-center justify-center gap-1">
                Actions
                {selectedRows.size > 0 && (
                  <>
                    <button
                      onClick={handleBulkSave}
                      disabled={isBulkSaving}
                      className="ml-1 p-0.5 rounded hover:bg-[var(--success-bg)] text-[var(--success)]"
                      title={`Save ${selectedRows.size} candidate${selectedRows.size > 1 ? 's' : ''}`}
                    >
                      <span className={`material-icons-outlined text-sm ${isBulkSaving ? 'animate-spin' : ''}`}>
                        {isBulkSaving ? 'refresh' : 'save'}
                      </span>
                    </button>
                    <button
                      onClick={handleBulkAddToList}
                      className="p-0.5 rounded hover:bg-[var(--bg-surface)] text-[var(--primary)]"
                      title={`Add ${selectedRows.size} to list`}
                    >
                      <span className="material-icons-outlined text-sm">playlist_add</span>
                    </button>
                  </>
                )}
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredItems.map((item, index) => {
            const person = getPersonFromItem(item);
            const isSelected = selectedRows.has(item.id);
            const profileUrl = item.properties.url;

            return (
              <tr
                key={item.id}
                onClick={() => onRowClick?.(item)}
                className={`transition-colors cursor-pointer ${
                  selectedRowId === item.id
                    ? 'bg-blue-50 dark:bg-blue-900/20'
                    : isSelected
                    ? 'bg-[var(--primary-light)]'
                    : 'hover:bg-[var(--bg-surface)]'
                }`}
              >
                <td className="text-center">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleRow(item.id)}
                  />
                </td>
                <td className="text-center text-[var(--text-muted)]">{index + 1}</td>
                <td>
                  <div className="flex items-center gap-2 py-0.5">
                    <div className="avatar">
                      {person?.pictureUrl ? (
                        <img src={person.pictureUrl} alt="" />
                      ) : (
                        <img
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${person?.name || index}`}
                          alt=""
                        />
                      )}
                    </div>
                    <span className="font-medium truncate">{person?.name || '-'}</span>
                  </div>
                </td>
                <td className="text-[var(--text-secondary)]">{person?.company?.name || '-'}</td>
                <td className="text-[var(--text-tertiary)]">{person?.position || '-'}</td>
                <td>
                  {profileUrl ? (
                    <a
                      href={profileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--primary)] opacity-80 hover:opacity-100 truncate block max-w-[180px]"
                    >
                      {profileUrl.replace('https://', '').replace('www.', '').slice(0, 20)}...
                    </a>
                  ) : (
                    <span className="text-[var(--text-muted)]">-</span>
                  )}
                </td>
                {criteriaColumns.map((col, colIndex) => {
                  const status = getMatchStatusFromItem(item, colIndex);
                  const refs = getReferenceCount(item, colIndex);
                  return (
                    <td key={col.id}>
                      <div className="flex items-center justify-between">
                        <span className={getMatchBadgeClass(status)}>
                          {status}
                        </span>
                        <span className="text-[9px] text-[var(--text-muted)]">{refs} ref.</span>
                      </div>
                    </td>
                  );
                })}
                <td className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={(e) => handleSaveCandidate(item, e)}
                      disabled={savingIds.has(item.id) || savedIds.has(item.id)}
                      className={`p-1 rounded transition-colors ${
                        savedIds.has(item.id)
                          ? 'text-[var(--success)] cursor-default'
                          : 'text-[var(--text-tertiary)] hover:text-[var(--primary)] hover:bg-[var(--bg-surface)]'
                      }`}
                      title={savedIds.has(item.id) ? 'Saved' : 'Save candidate'}
                    >
                      <span className={`material-icons-outlined text-sm ${savingIds.has(item.id) ? 'animate-spin' : ''}`}>
                        {savingIds.has(item.id) ? 'refresh' : savedIds.has(item.id) ? 'check_circle' : 'bookmark_border'}
                      </span>
                    </button>
                    <button
                      onClick={(e) => handleAddToList(item, e)}
                      className="p-1 rounded text-[var(--text-tertiary)] hover:text-[var(--primary)] hover:bg-[var(--bg-surface)] transition-colors"
                      title="Add to list"
                    >
                      <span className="material-icons-outlined text-sm">playlist_add</span>
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Add to List Dialog - Single */}
      {addToListItem && (
        <AddToListDialog
          isOpen={!!addToListItem}
          onClose={() => setAddToListItem(null)}
          candidateId={addToListItem.id}
          candidateName={addToListItem.name}
        />
      )}

      {/* Add to List Dialog - Bulk */}
      {bulkAddToList && (
        <AddToListDialog
          isOpen={bulkAddToList}
          onClose={() => setBulkAddToList(false)}
          candidateIds={Array.from(selectedRows)}
          onSuccess={() => updateSelection(new Set())}
        />
      )}
    </div>
  );
}
