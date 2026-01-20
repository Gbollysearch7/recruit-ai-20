'use client';

import { AppLayout } from '@/components/AppLayout';
import Link from 'next/link';
import {
  Search,
  Clock,
  Users,
  Trash2,
  ExternalLink,
  Plus,
  Filter
} from 'lucide-react';

// Mock data for demonstration
const savedSearches = [
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
  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Saved Searches</h1>
            <p className="text-gray-600 mt-1">View and manage your previous searches</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <Filter className="w-4 h-4" />
              Filter
            </button>
            <Link
              href="/search"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#2563eb] text-white text-sm font-medium rounded-lg hover:bg-[#1d4ed8] transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Search
            </Link>
          </div>
        </div>

        {/* Search List */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                    Search Query
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                    Results
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                    Status
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                    Created
                  </th>
                  <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {savedSearches.map((search) => (
                  <tr key={search.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                          <Search className="w-4 h-4 text-[#2563eb]" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate max-w-md">
                            {search.query}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5 capitalize">
                            {search.entityType}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{search.results}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full ${
                        search.status === 'completed'
                          ? 'bg-green-50 text-green-700'
                          : search.status === 'running'
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-gray-50 text-gray-700'
                      }`}>
                        {search.status === 'running' && (
                          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-1.5 animate-pulse" />
                        )}
                        {search.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        {formatDate(search.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/searches/${search.id}`}
                          className="p-2 text-gray-400 hover:text-[#2563eb] hover:bg-blue-50 rounded-lg transition-colors"
                          title="View results"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                        <button
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete search"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {savedSearches.length === 0 && (
            <div className="py-16 text-center">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No searches yet</h3>
              <p className="text-gray-500 mb-6">Start by creating your first candidate search</p>
              <Link
                href="/search"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#2563eb] text-white text-sm font-medium rounded-lg hover:bg-[#1d4ed8] transition-colors"
              >
                <Plus className="w-4 h-4" />
                New Search
              </Link>
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing {savedSearches.length} of {savedSearches.length} searches
          </p>
          <div className="flex items-center gap-2">
            <button
              disabled
              className="px-3 py-1.5 text-sm text-gray-400 bg-gray-100 rounded-lg cursor-not-allowed"
            >
              Previous
            </button>
            <button
              disabled
              className="px-3 py-1.5 text-sm text-gray-400 bg-gray-100 rounded-lg cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
