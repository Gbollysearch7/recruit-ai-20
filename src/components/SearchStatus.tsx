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

  const search = webset.searches?.[0];
  const searchStatus = progress?.searchStatus || search?.status || 'unknown';
  const searchProgress = progress || search?.progress;
  const completionPercent = searchProgress?.completion || 0;
  const foundCount = searchProgress?.found || 0;
  const displayNames = visibleNames.slice(currentIndex, currentIndex + 3);
  const isActive = searchStatus === 'running' || searchStatus === 'created';

  if (searchStatus === 'completed') {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-[var(--success-bg)] border border-[var(--success)]/20 animate-fade-in">
        <span className="material-icons-outlined text-sm text-[var(--success)]">check_circle</span>
        <span className="text-xs text-[var(--success-text)]">
          Found {foundCount} candidates matching your criteria
        </span>
      </div>
    );
  }

  if (searchStatus === 'failed') {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-[var(--error-bg)] border border-[var(--error)]/20 animate-fade-in">
        <span className="material-icons-outlined text-sm text-[var(--error)]">error</span>
        <span className="text-xs text-[var(--error-text)]">Search failed. Please try again.</span>
      </div>
    );
  }

  if (searchStatus === 'canceled') {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-[var(--warning-bg)] border border-[var(--warning-text)]/20 animate-fade-in">
        <span className="material-icons-outlined text-sm text-[var(--warning-text)]">cancel</span>
        <span className="text-xs text-[var(--warning-text)]">Search was canceled.</span>
      </div>
    );
  }

  // Running / Created state — compact progress bar
  return (
    <div className="rounded-lg border border-[var(--primary)]/15 bg-[var(--primary-light)] p-3 animate-fade-in">
      {/* Top row: status + count */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="material-icons-outlined text-sm text-[var(--primary)] animate-spin">refresh</span>
          <span className="text-xs font-medium text-[var(--primary)]">
            {foundCount > 0
              ? `Found ${foundCount} candidates so far...`
              : 'Searching the web for matching profiles...'}
          </span>
        </div>
        {isActive && (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-white/60 dark:bg-black/20 text-[10px] font-medium text-[var(--primary)]">
            <span className="w-1 h-1 rounded-full bg-[var(--primary)] animate-pulse" />
            Live
          </span>
        )}
      </div>

      {/* Progress bar */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1 bg-white/60 dark:bg-black/20 rounded-full overflow-hidden">
          <div
            className={`h-full bg-[var(--primary)] rounded-full progress-bar-fill ${
              completionPercent === 0 ? 'animate-progress-pulse' : ''
            }`}
            style={{ width: completionPercent > 0 ? `${completionPercent}%` : '30%' }}
          />
        </div>
        {completionPercent > 0 && (
          <span className="text-[10px] font-medium text-[var(--primary)] tabular-nums">{Math.round(completionPercent)}%</span>
        )}
      </div>

      {/* Live candidate names */}
      {displayNames.length > 0 && (
        <div className="mt-2 flex items-center gap-1.5 overflow-hidden">
          <span className="text-[10px] text-[var(--text-muted)] flex-shrink-0">Finding:</span>
          {displayNames.map((name, idx) => (
            <span
              key={`${name}-${idx}`}
              className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-white/60 dark:bg-black/20 text-[10px] text-[var(--text-secondary)] animate-fade-in whitespace-nowrap"
            >
              <span className="material-icons-outlined text-[10px] text-[var(--primary)]">person</span>
              {name.length > 15 ? name.slice(0, 15) + '...' : name}
            </span>
          ))}
          {visibleNames.length > 3 && (
            <span className="text-[10px] text-[var(--text-muted)]">
              +{visibleNames.length - 3}
            </span>
          )}
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
