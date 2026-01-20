'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import Link from 'next/link';

// Mock data for demonstration
const initialSearches = [
  {
    id: '1',
    query: 'Full-stack engineers in SF with AI startup experience',
    entityType: 'person',
    results: 45,
    status: 'completed',
    createdAt: '2024-01-15T10:30:00Z',
  },
  {
    id: '2',
    query: 'Senior product managers with fintech background',
    entityType: 'person',
    results: 32,
    status: 'completed',
    createdAt: '2024-01-15T08:00:00Z',
  },
  {
    id: '3',
    query: 'ML engineers who graduated from Stanford',
    entityType: 'person',
    results: 28,
    status: 'running',
    createdAt: '2024-01-14T16:45:00Z',
  },
  {
    id: '4',
    query: 'DevOps engineers with Kubernetes expertise',
    entityType: 'person',
    results: 56,
    status: 'completed',
    createdAt: '2024-01-13T14:20:00Z',
  },
  {
    id: '5',
    query: 'Frontend developers with React and TypeScript',
    entityType: 'person',
    results: 78,
    status: 'completed',
    createdAt: '2024-01-12T09:15:00Z',
  },
];

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
  const [savedSearches, setSavedSearches] = useState(initialSearches);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'running'>('all');

  const handleDelete = (id: string) => {
    setSavedSearches(savedSearches.filter(s => s.id !== id));
    setShowDeleteConfirm(null);
  };

  const filteredSearches = filterStatus === 'all'
    ? savedSearches
    : savedSearches.filter(s => s.status === filterStatus);

  return (
    <AppLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-[var(--text-primary)] tracking-tight">Saved Searches</h1>
            <p className="text-sm text-[var(--text-secondary)] mt-0.5">View and manage your previous searches</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as 'all' | 'completed' | 'running')}
                className="btn btn-secondary appearance-none pr-7 text-xs"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="running">Running</option>
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
                {filteredSearches.map((search) => (
                  <tr key={search.id}>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-[var(--primary-light)] flex items-center justify-center flex-shrink-0">
                          <span className="material-icons-outlined text-xs text-[var(--primary)]">search</span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-[var(--text-primary)] truncate max-w-[300px]">
                            {search.query}
                          </p>
                          <p className="text-[10px] text-[var(--text-muted)] capitalize">
                            {search.entityType}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <span className="material-icons-outlined text-xs text-[var(--text-muted)]">group</span>
                        <span className="text-[var(--text-primary)]">{search.results}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`match-badge ${
                        search.status === 'completed'
                          ? 'match-badge-match'
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
                        {formatDate(search.createdAt)}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-1 relative">
                        <Link
                          href={`/searches/${search.id}`}
                          className="btn btn-ghost p-1"
                          title="View results"
                        >
                          <span className="material-icons-outlined text-sm">open_in_new</span>
                        </Link>
                        <button
                          onClick={() => setShowDeleteConfirm(search.id)}
                          className="btn btn-ghost p-1 hover:text-[var(--error)]"
                          title="Delete search"
                        >
                          <span className="material-icons-outlined text-sm">delete</span>
                        </button>

                        {/* Delete confirmation popover */}
                        {showDeleteConfirm === search.id && (
                          <div className="absolute right-0 top-full mt-1 bg-[var(--bg-elevated)] border border-[var(--border-light)] rounded-md shadow-[var(--shadow-md)] p-3 z-10 w-40">
                            <p className="text-xs text-[var(--text-secondary)] mb-2">Delete this search?</p>
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => handleDelete(search.id)}
                                className="flex-1 px-2 py-1 bg-[var(--error)] text-white text-[10px] font-medium rounded hover:bg-red-600"
                              >
                                Delete
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
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {filteredSearches.length === 0 && (
            <div className="py-12 text-center">
              <span className="material-icons-outlined text-4xl text-[var(--text-muted)] mb-3 block">search_off</span>
              <h3 className="text-sm font-medium text-[var(--text-primary)] mb-1">No searches yet</h3>
              <p className="text-xs text-[var(--text-muted)] mb-4">Start by creating your first candidate search</p>
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

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-[var(--text-muted)]">
            Showing {filteredSearches.length} of {savedSearches.length} searches
          </p>
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
        </div>
      </div>
    </AppLayout>
  );
}
