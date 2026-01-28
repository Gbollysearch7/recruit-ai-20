'use client';

import { useState, useEffect } from 'react';
import { Webset, WebsetItem, getPersonFromItem } from '@/types/exa';

interface SearchStatusProps {
  webset: Webset | null;
  progress?: {
    found: number;
    completion: number;
    searchStatus: string;
  };
  recentItems?: WebsetItem[];
}

export function SearchStatus({ webset, progress, recentItems = [] }: SearchStatusProps) {
  const [visibleNames, setVisibleNames] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Extract names from recent items
  useEffect(() => {
    if (recentItems.length > 0) {
      const names = recentItems
        .map(item => getPersonFromItem(item)?.name)
        .filter((name): name is string => !!name)
        .slice(0, 10);
      setVisibleNames(names);
    }
  }, [recentItems]);

  // Cycle through names for display
  useEffect(() => {
    if (visibleNames.length > 3) {
      const interval = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % Math.max(1, visibleNames.length - 2));
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [visibleNames.length]);

  if (!webset) return null;

  // Get the search status from the webset's first search
  const search = webset.searches?.[0];
  const searchStatus = progress?.searchStatus || search?.status || 'unknown';
  const searchProgress = progress || search?.progress;

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'completed':
        return {
          icon: 'check_circle',
          iconClass: 'text-[var(--success)]',
          bgClass: 'bg-[var(--success-bg)]',
          borderClass: 'border-[var(--success)]/20',
          textClass: 'text-[var(--success)]',
          label: 'Search Complete'
        };
      case 'failed':
        return {
          icon: 'error',
          iconClass: 'text-[var(--error)]',
          bgClass: 'bg-[var(--error-bg)]',
          borderClass: 'border-[var(--error)]/20',
          textClass: 'text-[var(--error)]',
          label: 'Search Failed'
        };
      case 'canceled':
        return {
          icon: 'cancel',
          iconClass: 'text-[var(--warning-text)]',
          bgClass: 'bg-[var(--warning-bg)]',
          borderClass: 'border-[var(--warning-text)]/20',
          textClass: 'text-[var(--warning-text)]',
          label: 'Search Canceled'
        };
      case 'running':
        return {
          icon: 'refresh',
          iconClass: 'text-[var(--primary)] animate-spin',
          bgClass: 'bg-[var(--primary-light)]',
          borderClass: 'border-[var(--primary)]/20',
          textClass: 'text-[var(--primary)]',
          label: 'Searching...'
        };
      case 'created':
        return {
          icon: 'search',
          iconClass: 'text-[var(--primary)]',
          bgClass: 'bg-[var(--primary-light)]',
          borderClass: 'border-[var(--primary)]/20',
          textClass: 'text-[var(--primary)]',
          label: 'Starting Search...'
        };
      default:
        return {
          icon: 'schedule',
          iconClass: 'text-[var(--text-muted)]',
          bgClass: 'bg-[var(--bg-surface)]',
          borderClass: 'border-[var(--border-light)]',
          textClass: 'text-[var(--text-secondary)]',
          label: 'Pending'
        };
    }
  };

  const config = getStatusConfig(searchStatus);

  // Calculate completion percentage
  const completionPercent = searchProgress?.completion || 0;
  const foundCount = searchProgress?.found || 0;

  // Get display names (show 3 at a time)
  const displayNames = visibleNames.slice(currentIndex, currentIndex + 3);

  return (
    <div className={`rounded-xl border ${config.borderClass} ${config.bgClass} p-4 animate-fade-in`}>
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-lg bg-white/60 dark:bg-black/20 flex items-center justify-center flex-shrink-0 shadow-sm">
          <span className={`material-icons-outlined text-xl ${config.iconClass}`}>
            {config.icon}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`font-semibold ${config.textClass}`}>{config.label}</span>
            {(searchStatus === 'running' || searchStatus === 'created') && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/60 dark:bg-black/20 text-xs font-medium text-[var(--primary)]">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-pulse" />
                Live
              </span>
            )}
          </div>

          {search && (
            <p className="text-sm text-[var(--text-secondary)] truncate">
              <span className="text-[var(--text-muted)]">Query:</span> {search.query}
            </p>
          )}

          {/* Show criteria if available */}
          {search?.criteria && search.criteria.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {search.criteria.slice(0, 3).map((criterion, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center px-2 py-0.5 rounded-md bg-white/40 dark:bg-black/20 text-xs text-[var(--text-tertiary)]"
                >
                  {criterion.description.length > 30
                    ? criterion.description.slice(0, 30) + '...'
                    : criterion.description}
                  {criterion.successRate !== undefined && (
                    <span className="ml-1 text-[var(--success)]">
                      {Math.round(criterion.successRate * 100)}%
                    </span>
                  )}
                </span>
              ))}
              {search.criteria.length > 3 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-white/40 dark:bg-black/20 text-xs text-[var(--text-muted)]">
                  +{search.criteria.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col items-end gap-1">
          {foundCount > 0 && (
            <div className="flex items-center gap-1.5 text-sm font-medium text-[var(--text-primary)]">
              <span className="material-icons-outlined text-base text-[var(--text-tertiary)]">group</span>
              {foundCount}
            </div>
          )}
          <span className="font-mono text-[10px] text-[var(--text-muted)] uppercase tracking-wider">
            ID: {webset.id.slice(0, 8)}
          </span>
        </div>
      </div>

      {/* Progress indicator for running state */}
      {(searchStatus === 'running' || searchStatus === 'created') && (
        <div className="mt-4 pt-3 border-t border-[var(--primary)]/10">
          <div className="flex items-center justify-between text-xs text-[var(--primary)] mb-2">
            <span>
              {foundCount > 0
                ? `Found ${foundCount} candidates so far...`
                : 'Searching the web for matching profiles...'}
            </span>
            {completionPercent > 0 && (
              <span className="font-medium">{Math.round(completionPercent)}%</span>
            )}
          </div>
          <div className="h-1.5 bg-white/60 dark:bg-black/20 rounded-full overflow-hidden">
            <div
              className={`h-full bg-[var(--primary)] rounded-full progress-bar-fill ${
                completionPercent === 0 ? 'animate-progress-pulse' : ''
              }`}
              style={{ width: completionPercent > 0 ? `${completionPercent}%` : '30%' }}
            />
          </div>

          {/* Live candidate names */}
          {displayNames.length > 0 && (
            <div className="mt-3 flex items-center gap-2 overflow-hidden">
              <span className="text-[10px] text-[var(--text-muted)] flex-shrink-0">Finding:</span>
              <div className="flex items-center gap-2 overflow-hidden">
                {displayNames.map((name, idx) => (
                  <span
                    key={`${name}-${idx}`}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/60 dark:bg-black/20 text-xs text-[var(--text-secondary)] animate-fade-in whitespace-nowrap"
                  >
                    <span className="material-icons-outlined text-xs text-[var(--primary)]">person</span>
                    {name.length > 15 ? name.slice(0, 15) + '...' : name}
                  </span>
                ))}
                {visibleNames.length > 3 && (
                  <span className="text-[10px] text-[var(--text-muted)]">
                    +{visibleNames.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Success summary */}
      {searchStatus === 'completed' && foundCount > 0 && (
        <div className="mt-4 pt-3 border-t border-[var(--success)]/10">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[var(--success)]">
              Successfully found {foundCount} candidates matching your criteria
            </span>
            <span className="material-icons-outlined text-base text-[var(--success)]">check_circle</span>
          </div>
        </div>
      )}
    </div>
  );
}

// Compact version for inline display
export function CompactSearchStatus({
  status,
  found,
  completion,
}: {
  status: string;
  found: number;
  completion: number;
}) {
  const isRunning = status === 'running' || status === 'created';

  return (
    <div className="flex items-center gap-3 text-xs">
      {isRunning ? (
        <>
          <span className="material-icons-outlined text-sm text-[var(--primary)] animate-spin">refresh</span>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[var(--text-secondary)]">
                {found > 0 ? `Found ${found} candidates` : 'Searching...'}
              </span>
              <span className="text-[var(--text-muted)]">{Math.round(completion)}%</span>
            </div>
            <div className="h-1 bg-[var(--bg-surface)] rounded-full overflow-hidden">
              <div
                className="h-full bg-[var(--primary)] rounded-full progress-bar-fill"
                style={{ width: `${completion}%` }}
              />
            </div>
          </div>
        </>
      ) : status === 'completed' ? (
        <>
          <span className="material-icons-outlined text-sm text-[var(--success)]">check_circle</span>
          <span className="text-[var(--success)]">{found} candidates found</span>
        </>
      ) : (
        <>
          <span className="material-icons-outlined text-sm text-[var(--error)]">error</span>
          <span className="text-[var(--error)]">Search {status}</span>
        </>
      )}
    </div>
  );
}
