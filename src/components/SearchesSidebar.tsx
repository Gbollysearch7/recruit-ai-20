'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

interface SavedSearch {
  id: string;
  title: string;
  count?: number;
  createdAt: string;
  icon?: 'search' | 'group';
}

interface SearchesSidebarProps {
  onNewSearch: () => void;
}

// Mock data for saved searches
const todaySearches: SavedSearch[] = [
  { id: '1', title: 'Sales Managers, Taiwan...', createdAt: 'Today', icon: 'search' },
  { id: '2', title: '5 Sales Managers, Tai...', createdAt: 'Today', icon: 'search' },
  { id: '3', title: 'Digital Marketers, veri...', createdAt: 'Today', icon: 'group' },
];

const weekSearches: SavedSearch[] = [
  { id: '5', title: 'Sales managers in Tai...', createdAt: '7 days', icon: 'group' },
  { id: '6', title: 'Netsuites, Taiwan, ve...', createdAt: '7 days', icon: 'group' },
];

const monthSearches: SavedSearch[] = [
  { id: '7', title: 'Graphic Designer, Lo...', createdAt: '30 days', icon: 'group' },
  { id: '8', title: 'Project manager, Kua...', createdAt: '30 days', icon: 'group' },
  { id: '9', title: '5 developers, San Fr...', createdAt: '30 days', icon: 'group' },
];

export function SearchesSidebar({ onNewSearch }: SearchesSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [expandedSections, setExpandedSections] = useState({
    today: true,
    week: true,
    month: true,
  });
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [folders, setFolders] = useState<string[]>([]);

  const toggleSection = (section: 'today' | 'week' | 'month') => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      setFolders([...folders, newFolderName.trim()]);
      setNewFolderName('');
      setShowNewFolderInput(false);
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
      <span className="material-icons-outlined text-sm opacity-50">
        {search.icon === 'search' ? 'search' : 'group'}
      </span>
      <span className="truncate flex-1">{search.title}</span>
    </Link>
  );

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
        {/* Today */}
        <div>
          <button
            onClick={() => toggleSection('today')}
            className="flex items-center gap-1 px-2 mb-2 text-[10px] uppercase font-semibold text-[var(--text-muted)] w-full"
          >
            Today
          </button>
          {expandedSections.today && (
            <ul className="space-y-1">
              {todaySearches.map(search => (
                <li key={search.id}>
                  <SearchItem search={search} isActive={pathname === `/searches/${search.id}`} />
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Previous 7 Days */}
        <div>
          <button
            onClick={() => toggleSection('week')}
            className="flex items-center gap-1 px-2 mb-2 text-[10px] uppercase font-semibold text-[var(--text-muted)] w-full"
          >
            Previous 7 Days
          </button>
          {expandedSections.week && (
            <ul className="space-y-1">
              {weekSearches.map(search => (
                <li key={search.id}>
                  <SearchItem search={search} isActive={pathname === `/searches/${search.id}`} />
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Previous 30 Days */}
        <div>
          <button
            onClick={() => toggleSection('month')}
            className="flex items-center gap-1 px-2 mb-2 text-[10px] uppercase font-semibold text-[var(--text-muted)] w-full"
          >
            Previous 30 Days
          </button>
          {expandedSections.month && (
            <ul className="space-y-1">
              {monthSearches.map(search => (
                <li key={search.id}>
                  <SearchItem search={search} isActive={pathname === `/searches/${search.id}`} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-[var(--border-light)]">
        <button className="text-[11px] text-[var(--text-muted)] hover:text-[var(--primary)] underline">
          Load more
        </button>
      </div>
    </aside>
  );
}
