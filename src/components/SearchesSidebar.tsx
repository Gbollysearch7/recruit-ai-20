'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSearches } from '@/lib/hooks/useSearches';
import { useAuth } from '@/lib/hooks/useAuth';
import { ExaSearch } from '@/lib/supabase/types';
import {
  ChevronRight,
  ChevronDown,
  Search,
  Hourglass,
  CheckCircle,
  AlertCircle,
  PlusCircle,
  History,
  Monitor,
  RefreshCw,
  SearchX
} from 'lucide-react';

interface SectionState {
  today: boolean;
  week: boolean;
  month: boolean;
  older: boolean;
}

// Helper to format date into time buckets
function getTimeBucket(dateString?: string | null): keyof SectionState {
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

const getStatusIcon = (status?: string | null) => {
  switch (status) {
    case 'running':
    case 'pending':
      return <Hourglass className="w-3.5 h-3.5 animate-spin text-blue-500" />;
    case 'completed':
      return <CheckCircle className="w-3.5 h-3.5 text-green-500" />;
    case 'failed':
      return <AlertCircle className="w-3.5 h-3.5 text-red-500" />;
    default:
      return <Search className="w-3.5 h-3.5 opacity-50" />;
  }
};

const SearchItem = ({ search, isActive = false }: { search: ExaSearch; isActive?: boolean }) => (
  <Link
    href={`/searches/${search.exa_webset_id || search.id}`}
    className={`flex items-center gap-2 px-2 py-1.5 text-xs rounded transition-colors ${isActive
      ? 'bg-white dark:bg-slate-800 text-[var(--text-primary)] font-medium shadow-sm'
      : 'text-[var(--text-secondary)] hover:bg-white dark:hover:bg-slate-800 hover:text-[var(--text-primary)]'
      }`}
  >
    <span className="flex-shrink-0">
      {getStatusIcon(search.status)}
    </span>
    <span className="truncate flex-1">{search.name || search.query}</span>
  </Link>
);

const SearchSection = ({
  title,
  searches: sectionSearches,
  isExpanded,
  onToggle,
  pathname
}: {
  title: string;
  searches: ExaSearch[];
  isExpanded: boolean;
  onToggle: () => void;
  pathname: string;
}) => {
  if (sectionSearches.length === 0) return null;

  return (
    <div>
      <button
        onClick={onToggle}
        className="flex items-center gap-1.5 px-2 mb-1 text-[10px] uppercase font-semibold text-[var(--text-muted)] w-full hover:text-[var(--text-secondary)] transition-colors group"
      >
        {isExpanded ? (
          <ChevronDown className="w-3 h-3 opacity-70 group-hover:opacity-100 transition-opacity" />
        ) : (
          <ChevronRight className="w-3 h-3 opacity-70 group-hover:opacity-100 transition-opacity" />
        )}
        {title}
        <span className="ml-auto text-[9px] opacity-60 bg-[var(--bg-elevated)] px-1.5 rounded-full">{sectionSearches.length}</span>
      </button>
      {isExpanded && (
        <ul className="space-y-0.5 ml-1 pl-2 border-l border-[var(--border-light)]/50">
          {sectionSearches.map(search => (
            <li key={search.id}>
              <SearchItem
                search={search}
                isActive={pathname === `/searches/${search.exa_webset_id || search.id}`}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export function SearchesSidebar({ onNewSearch }: { onNewSearch: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { searches, isLoading, fetchSearches } = useSearches();
  const { isAuthenticated } = useAuth();

  const [expandedSections, setExpandedSections] = useState<SectionState>({
    today: true,
    week: true,
    month: true,
    older: false,
  });

  // Group searches by time bucket
  const groupedSearches = {
    today: searches.filter(s => getTimeBucket(s.created_at) === 'today'),
    week: searches.filter(s => getTimeBucket(s.created_at) === 'week'),
    month: searches.filter(s => getTimeBucket(s.created_at) === 'month'),
    older: searches.filter(s => getTimeBucket(s.created_at) === 'older'),
  };

  const toggleSection = (section: keyof SectionState) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  if (!isAuthenticated && !isLoading) {
    return (
      <aside className="w-60 border-r border-[var(--border-light)] flex flex-col bg-[var(--bg-surface)] bg-opacity-50">
        <div className="p-4 text-center mt-10">
          <p className="text-xs text-[var(--text-muted)] mb-3">Sign in to view your search history</p>
          <Link href="/" className="btn btn-primary w-full justify-center text-xs">
            Sign In
          </Link>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-60 border-r border-[var(--border-light)] flex flex-col bg-[var(--bg-surface)] bg-opacity-50 h-full">
      {/* Actions */}
      <div className="p-3 space-y-1 flex-shrink-0">
        <button
          onClick={onNewSearch}
          className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-[var(--text-secondary)] hover:bg-white dark:hover:bg-slate-800 rounded transition-colors group"
        >
          <PlusCircle className="w-4 h-4 text-[var(--primary)] group-hover:scale-110 transition-transform" />
          <span className="font-medium">New search</span>
        </button>
        <button
          onClick={() => router.push('/searches')}
          className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-[var(--text-secondary)] hover:bg-white dark:hover:bg-slate-800 rounded transition-colors"
        >
          <History className="w-4 h-4" />
          All searches
        </button>
        <button
          onClick={() => router.push('/dashboard')}
          className="w-full flex items-center justify-between px-2 py-1.5 text-xs text-[var(--text-secondary)] hover:bg-white dark:hover:bg-slate-800 rounded transition-colors"
        >
          <div className="flex items-center gap-2">
            <Monitor className="w-4 h-4" />
            Monitors
          </div>
        </button>
      </div>

      <div className="h-px bg-[var(--border-light)] mx-3 mb-2 opacity-50 flex-shrink-0" />

      {/* Saved Searches List */}
      <div className="flex-1 overflow-y-auto sidebar-scroll px-2 space-y-4 pb-4">
        {isLoading ? (
          <div className="space-y-4 px-1 mt-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-3 bg-[var(--bg-elevated)] rounded w-20 mb-2"></div>
                <div className="space-y-1 pl-3 border-l-2 border-[var(--border-light)]">
                  <div className="h-5 bg-[var(--bg-elevated)] rounded opacity-60"></div>
                  <div className="h-5 bg-[var(--bg-elevated)] rounded opacity-40"></div>
                </div>
              </div>
            ))}
          </div>
        ) : searches.length === 0 ? (
          <div className="text-center py-8 opacity-60">
            <SearchX className="w-8 h-8 text-[var(--text-muted)] mb-2 mx-auto" />
            <p className="text-xs text-[var(--text-muted)]">No searches yet</p>
          </div>
        ) : (
          <>
            <SearchSection
              title="Today"
              searches={groupedSearches.today}
              isExpanded={expandedSections.today}
              onToggle={() => toggleSection('today')}
              pathname={pathname}
            />
            <SearchSection
              title="Previous 7 Days"
              searches={groupedSearches.week}
              isExpanded={expandedSections.week}
              onToggle={() => toggleSection('week')}
              pathname={pathname}
            />
            <SearchSection
              title="Previous 30 Days"
              searches={groupedSearches.month}
              isExpanded={expandedSections.month}
              onToggle={() => toggleSection('month')}
              pathname={pathname}
            />
            <SearchSection
              title="Older"
              searches={groupedSearches.older}
              isExpanded={expandedSections.older}
              onToggle={() => toggleSection('older')}
              pathname={pathname}
            />
          </>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-[var(--border-light)] flex-shrink-0">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-[var(--text-muted)]">
            {searches.length} saved
          </span>
          <button
            onClick={() => fetchSearches()}
            className="text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors p-1 rounded hover:bg-[var(--bg-elevated)]"
            title="Refresh searches"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
        </div>
      </div>
    </aside>
  );
}
