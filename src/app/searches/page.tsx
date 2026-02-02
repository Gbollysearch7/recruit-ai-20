'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import Link from 'next/link';
import { useSearches } from '@/lib/hooks/useSearches';
import { useAuth } from '@/lib/hooks/useAuth';
import { useToast } from '@/components/Toast';
import { SearchRowSkeleton } from '@/components/Skeleton';

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function SavedSearchesPage() {
  const { searches, isLoading, deleteSearch } = useSearches();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { addToast } = useToast();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'running' | 'failed'>('all');

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const success = await deleteSearch(id);
      if (success) {
        addToast('Search deleted successfully', 'success');
      } else {
        addToast('Failed to delete search', 'error');
      }
    } catch {
      addToast('Failed to delete search', 'error');
    } finally {
      setDeletingId(null);
      setShowDeleteConfirm(null);
    }
  };

  const filteredSearches = filterStatus === 'all'
    ? searches
    : searches.filter(s => s.status === filterStatus);

  const pageLoading = isLoading || authLoading;

  return (
    <AppLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-[var(--text-primary)] tracking-tight">Saved Searches</h1>
            <p className="text-sm text-[var(--text-secondary)] mt-0.5">
              {isAuthenticated ? 'View and manage your previous searches' : 'Sign in to save your searches'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
                className="btn btn-secondary appearance-none pr-7 text-xs"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="running">Running</option>
                <option value="failed">Failed</option>
              </select>
              <span className="material-icons-outlined text-xs absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-muted)]">filter_list</span>
            </div>
            <Link
              href="/search"
              className="btn btn-primary"
            >
              <span className="material-icons-outlined text-sm">add</span>
              New Search
            </Link>
          </div>
        </div>

        {/* Search List */}
        <div className="bg-[var(--bg-elevated)] rounded-lg border border-[var(--border-light)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="dense-table">
              <thead>
                <tr>
                  <th style={{ width: '40%' }}>Search Query</th>
                  <th style={{ width: '10%' }}>Results</th>
                  <th style={{ width: '12%' }}>Status</th>
                  <th style={{ width: '20%' }}>Created</th>
                  <th style={{ width: '18%', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pageLoading ? (
                  // Loading skeleton rows
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 skeleton rounded" />
                          <div className="min-w-0 flex-1">
                            <div className="w-48 h-4 skeleton rounded mb-1" />
                            <div className="w-16 h-3 skeleton rounded" />
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="w-12 h-4 skeleton rounded" />
                      </td>
                      <td>
                        <div className="w-16 h-5 skeleton rounded" />
                      </td>
                      <td>
                        <div className="w-32 h-4 skeleton rounded" />
                      </td>
                      <td>
                        <div className="flex items-center justify-end gap-1">
                          <div className="w-7 h-7 skeleton rounded" />
                          <div className="w-7 h-7 skeleton rounded" />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : filteredSearches.length > 0 ? (
                  filteredSearches.map((search) => (
                    <tr key={search.id}>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded bg-[var(--primary-light)] flex items-center justify-center flex-shrink-0">
                            <span className="material-icons-outlined text-xs text-[var(--primary)]">search</span>
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-[var(--text-primary)] truncate max-w-[300px]">
                              {search.query || search.name}
                            </p>
                            <p className="text-[10px] text-[var(--text-muted)]">
                              {search.count || 20} candidates requested
                            </p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-1">
                          <span className="material-icons-outlined text-xs text-[var(--text-muted)]">group</span>
                          <span className="text-[var(--text-primary)]">{search.results_count || 0}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`match-badge ${
                          search.status === 'completed'
                            ? 'match-badge-match'
                            : search.status === 'failed'
                            ? 'match-badge-miss'
                            : 'bg-[var(--primary-light)] text-[var(--primary)]'
                        }`}>
                          {search.status === 'running' && (
                            <span className="inline-block w-1 h-1 rounded-full bg-current mr-1 animate-pulse" />
                          )}
                          {search.status}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-1 text-[var(--text-muted)]">
                          <span className="material-icons-outlined text-xs">schedule</span>
                          {search.created_at ? formatDate(search.created_at) : 'Unknown'}
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center justify-end gap-1 relative">
                          <Link
                            href={`/searches/${search.exa_webset_id || search.id}`}
                            className="btn btn-ghost p-1"
                            title="View results"
                          >
                            <span className="material-icons-outlined text-sm">open_in_new</span>
                          </Link>
                          <button
                            onClick={() => setShowDeleteConfirm(search.id)}
                            disabled={deletingId === search.id}
                            className="btn btn-ghost p-1 hover:text-[var(--error)] disabled:opacity-50"
                            title="Delete search"
                          >
                            <span className={`material-icons-outlined text-sm ${deletingId === search.id ? 'animate-spin' : ''}`}>
                              {deletingId === search.id ? 'refresh' : 'delete'}
                            </span>
                          </button>

                          {/* Delete confirmation popover */}
                          {showDeleteConfirm === search.id && (
                            <div className="absolute right-0 top-full mt-1 bg-[var(--bg-elevated)] border border-[var(--border-light)] rounded-md shadow-[var(--shadow-md)] p-3 z-10 w-44">
                              <p className="text-xs text-[var(--text-secondary)] mb-2">Delete this search?</p>
                              <div className="flex gap-1.5">
                                <button
                                  onClick={() => handleDelete(search.id)}
                                  disabled={deletingId === search.id}
                                  className="flex-1 px-2 py-1 bg-[var(--error)] text-white text-[10px] font-medium rounded hover:bg-red-600 disabled:opacity-50"
                                >
                                  {deletingId === search.id ? 'Deleting...' : 'Delete'}
                                </button>
                                <button
                                  onClick={() => setShowDeleteConfirm(null)}
                                  className="flex-1 px-2 py-1 border border-[var(--border-light)] text-[var(--text-secondary)] text-[10px] font-medium rounded hover:bg-[var(--bg-surface)]"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : null}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {!pageLoading && filteredSearches.length === 0 && (
            <div className="py-12 text-center">
              <span className="material-icons-outlined text-4xl text-[var(--text-muted)] mb-3 block">search_off</span>
              <h3 className="text-sm font-medium text-[var(--text-primary)] mb-1">
                {filterStatus === 'all' ? 'No searches yet' : `No ${filterStatus} searches`}
              </h3>
              <p className="text-xs text-[var(--text-muted)] mb-4">
                {filterStatus === 'all'
                  ? 'Start by creating your first candidate search'
                  : 'Try changing your filter or run a new search'}
              </p>
              <Link
                href="/search"
                className="btn btn-primary"
              >
                <span className="material-icons-outlined text-sm">add</span>
                New Search
              </Link>
            </div>
          )}
        </div>

        {/* Pagination / Count */}
        {!pageLoading && filteredSearches.length > 0 && (
          <div className="flex items-center justify-between">
            <p className="text-xs text-[var(--text-muted)]">
              Showing {filteredSearches.length} of {searches.length} searches
            </p>
            {searches.length > 10 && (
              <div className="flex items-center gap-1">
                <button
                  disabled
                  className="btn btn-secondary opacity-50 cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  disabled
                  className="btn btn-secondary opacity-50 cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
