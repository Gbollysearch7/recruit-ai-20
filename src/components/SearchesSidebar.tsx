'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Webset } from '@/types/exa';

interface SavedSearch {
  id: string;
  title: string;
  count?: number;
  createdAt: string;
  status?: string;
}

interface SearchesSidebarProps {
  onNewSearch: () => void;
}

// Helper to format date into time buckets
function getTimeBucket(dateString?: string): 'today' | 'week' | 'month' | 'older' {
  if (!dateString) return 'older';

  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  if (diffDays < 1) return 'today';
  if (diffDays < 7) return 'week';
  if (diffDays < 30) return 'month';
  return 'older';
}

// Convert Webset to SavedSearch
function websetToSavedSearch(webset: Webset): SavedSearch {
  const query = webset.searches?.[0]?.query || webset.title || 'Untitled Search';
  return {
    id: webset.id,
    title: query.length > 25 ? query.slice(0, 25) + '...' : query,
    createdAt: webset.createdAt || '',
    status: webset.status,
  };
}

export function SearchesSidebar({ onNewSearch }: SearchesSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [expandedSections, setExpandedSections] = useState({
    today: true,
    week: true,
    month: true,
    older: false,
  });
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [folders, setFolders] = useState<string[]>([]);

  // Real searches state
  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch searches function
  const fetchSearches = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/websets?limit=50');
      if (!res.ok) {
        throw new Error('Failed to fetch searches');
      }

      const data = await res.json();
      if (data.data && Array.isArray(data.data)) {
        const savedSearches = data.data.map(websetToSavedSearch);
        setSearches(savedSearches);
      }
    } catch (err) {
      console.error('Error fetching searches:', err);
      setError(err instanceof Error ? err.message : 'Failed to load searches');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch searches on mount
  useEffect(() => {
    fetchSearches();
  }, []);

  // Listen for new search events to refresh the list
  useEffect(() => {
    const handleNewSearch = () => {
      // Delay slightly to allow the API to reflect the new search
      setTimeout(() => {
        fetchSearches();
      }, 500);
    };

    window.addEventListener('talist:search-created', handleNewSearch);
    return () => {
      window.removeEventListener('talist:search-created', handleNewSearch);
    };
  }, []);

  // Group searches by time bucket
  const groupedSearches = {
    today: searches.filter(s => getTimeBucket(s.createdAt) === 'today'),
    week: searches.filter(s => getTimeBucket(s.createdAt) === 'week'),
    month: searches.filter(s => getTimeBucket(s.createdAt) === 'month'),
    older: searches.filter(s => getTimeBucket(s.createdAt) === 'older'),
  };

  const toggleSection = (section: 'today' | 'week' | 'month' | 'older') => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      setFolders([...folders, newFolderName.trim()]);
      setNewFolderName('');
      setShowNewFolderInput(false);
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'running':
      case 'pending':
        return 'hourglass_empty';
      case 'idle':
        return 'check_circle';
      default:
        return 'group';
    }
  };

  const SearchItem = ({ search, isActive = false }: { search: SavedSearch; isActive?: boolean }) => (
    <Link
      href={`/searches/${search.id}`}
      className={`flex items-center gap-2 px-2 py-1 text-xs rounded transition-colors ${
        isActive
          ? 'bg-white dark:bg-slate-800 text-[var(--text-primary)]'
          : 'text-[var(--text-secondary)] hover:bg-white dark:hover:bg-slate-800'
      }`}
    >
      <span className={`material-icons-outlined text-sm ${
        search.status === 'running' ? 'animate-spin text-blue-500' : 'opacity-50'
      }`}>
        {getStatusIcon(search.status)}
      </span>
      <span className="truncate flex-1">{search.title}</span>
    </Link>
  );

  const SearchSection = ({
    title,
    searches,
    sectionKey
  }: {
    title: string;
    searches: SavedSearch[];
    sectionKey: 'today' | 'week' | 'month' | 'older';
  }) => {
    if (searches.length === 0) return null;

    return (
      <div>
        <button
          onClick={() => toggleSection(sectionKey)}
          className="flex items-center gap-1 px-2 mb-2 text-[10px] uppercase font-semibold text-[var(--text-muted)] w-full"
        >
          <span className="material-icons-outlined text-xs">
            {expandedSections[sectionKey] ? 'expand_more' : 'chevron_right'}
          </span>
          {title}
          <span className="ml-auto text-[9px] opacity-60">{searches.length}</span>
        </button>
        {expandedSections[sectionKey] && (
          <ul className="space-y-1">
            {searches.map(search => (
              <li key={search.id}>
                <SearchItem search={search} isActive={pathname === `/searches/${search.id}`} />
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  return (
    <aside className="w-60 border-r border-[var(--border-light)] flex flex-col bg-[var(--bg-surface)] bg-opacity-50">
      {/* Actions */}
      <div className="p-3 space-y-1">
        <button
          onClick={onNewSearch}
          className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-[var(--text-secondary)] hover:bg-white dark:hover:bg-slate-800 rounded transition-colors"
        >
          <span className="material-icons-outlined text-sm">add</span>
          New search
        </button>
        <button
          onClick={() => router.push('/searches')}
          className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-[var(--text-secondary)] hover:bg-white dark:hover:bg-slate-800 rounded transition-colors"
        >
          <span className="material-icons-outlined text-sm">history</span>
          Past searches
        </button>
        <button
          onClick={() => router.push('/dashboard')}
          className="w-full flex items-center justify-between px-2 py-1.5 text-xs text-[var(--text-secondary)] hover:bg-white dark:hover:bg-slate-800 rounded transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="material-icons-outlined text-sm">monitor</span>
            Monitors
          </div>
          <span className="bg-blue-100 text-blue-600 px-1 rounded-sm text-[9px] font-bold">NEW</span>
        </button>
        <button
          onClick={() => setShowNewFolderInput(true)}
          className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-[var(--text-secondary)] hover:bg-white dark:hover:bg-slate-800 rounded transition-colors"
        >
          <span className="material-icons-outlined text-sm">create_new_folder</span>
          New folder
        </button>

        {/* New folder input */}
        {showNewFolderInput && (
          <div className="px-2 py-1 space-y-1">
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateFolder();
                if (e.key === 'Escape') setShowNewFolderInput(false);
              }}
              placeholder="Folder name"
              className="w-full px-2 py-1 text-xs border border-[var(--border-light)] rounded bg-white dark:bg-slate-800"
              autoFocus
            />
            <div className="flex gap-1">
              <button
                onClick={handleCreateFolder}
                className="flex-1 px-2 py-1 text-[10px] bg-[var(--primary)] text-white rounded"
              >
                Create
              </button>
              <button
                onClick={() => setShowNewFolderInput(false)}
                className="flex-1 px-2 py-1 text-[10px] border border-[var(--border-light)] rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Created folders */}
        {folders.map((folder, index) => (
          <button
            key={index}
            className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-[var(--text-secondary)] hover:bg-white dark:hover:bg-slate-800 rounded transition-colors"
          >
            <span className="material-icons-outlined text-sm">folder</span>
            {folder}
          </button>
        ))}
      </div>

      {/* Saved Searches List */}
      <div className="flex-1 overflow-y-auto sidebar-scroll px-3 space-y-6">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-3 bg-[var(--bg-surface)] rounded w-20 mb-2"></div>
                <div className="space-y-1">
                  <div className="h-6 bg-[var(--bg-surface)] rounded"></div>
                  <div className="h-6 bg-[var(--bg-surface)] rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-4">
            <span className="material-icons-outlined text-2xl text-red-400 mb-2">error_outline</span>
            <p className="text-xs text-[var(--text-muted)]">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 text-xs text-[var(--primary)] hover:underline"
            >
              Retry
            </button>
          </div>
        ) : searches.length === 0 ? (
          <div className="text-center py-8">
            <span className="material-icons-outlined text-3xl text-[var(--text-muted)] mb-2">search_off</span>
            <p className="text-xs text-[var(--text-muted)]">No searches yet</p>
            <button
              onClick={onNewSearch}
              className="mt-2 text-xs text-[var(--primary)] hover:underline"
            >
              Start your first search
            </button>
          </div>
        ) : (
          <>
            <SearchSection title="Today" searches={groupedSearches.today} sectionKey="today" />
            <SearchSection title="Previous 7 Days" searches={groupedSearches.week} sectionKey="week" />
            <SearchSection title="Previous 30 Days" searches={groupedSearches.month} sectionKey="month" />
            <SearchSection title="Older" searches={groupedSearches.older} sectionKey="older" />
          </>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-[var(--border-light)]">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-[var(--text-muted)]">
            {searches.length} searches
          </span>
          {searches.length > 0 && (
            <button
              onClick={fetchSearches}
              className="text-[11px] text-[var(--text-muted)] hover:text-[var(--primary)]"
              title="Refresh searches"
            >
              <span className="material-icons-outlined text-xs">refresh</span>
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
