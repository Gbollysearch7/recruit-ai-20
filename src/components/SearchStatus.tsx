'use client';

import { Webset } from '@/types/exa';
import { Clock, CheckCircle2, XCircle, Loader2, Search, Users } from 'lucide-react';

interface SearchStatusProps {
  webset: Webset | null;
  progress?: {
    found: number;
    completion: number;
    searchStatus: string;
  };
}

export function SearchStatus({ webset, progress }: SearchStatusProps) {
  if (!webset) return null;

  // Get the search status from the webset's first search
  const search = webset.searches?.[0];
  const searchStatus = progress?.searchStatus || search?.status || 'unknown';
  const searchProgress = progress || search?.progress;

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'completed':
        return {
          icon: CheckCircle2,
          iconClass: 'text-[var(--success)]',
          bgClass: 'bg-[var(--success-bg)]',
          borderClass: 'border-[var(--success)]/20',
          textClass: 'text-[var(--success)]',
          label: 'Search Complete'
        };
      case 'failed':
        return {
          icon: XCircle,
          iconClass: 'text-[var(--error)]',
          bgClass: 'bg-[var(--error-bg)]',
          borderClass: 'border-[var(--error)]/20',
          textClass: 'text-[var(--error)]',
          label: 'Search Failed'
        };
      case 'canceled':
        return {
          icon: XCircle,
          iconClass: 'text-[var(--warning-text)]',
          bgClass: 'bg-[var(--warning-bg)]',
          borderClass: 'border-[var(--warning-text)]/20',
          textClass: 'text-[var(--warning-text)]',
          label: 'Search Canceled'
        };
      case 'running':
        return {
          icon: Loader2,
          iconClass: 'text-[var(--primary)] animate-spin',
          bgClass: 'bg-[var(--primary-light)]',
          borderClass: 'border-[var(--primary)]/20',
          textClass: 'text-[var(--primary)]',
          label: 'Searching...'
        };
      case 'created':
        return {
          icon: Search,
          iconClass: 'text-[var(--primary)]',
          bgClass: 'bg-[var(--primary-light)]',
          borderClass: 'border-[var(--primary)]/20',
          textClass: 'text-[var(--primary)]',
          label: 'Starting Search...'
        };
      default:
        return {
          icon: Clock,
          iconClass: 'text-[var(--text-muted)]',
          bgClass: 'bg-[var(--bg-surface)]',
          borderClass: 'border-[var(--border-light)]',
          textClass: 'text-[var(--text-secondary)]',
          label: 'Pending'
        };
    }
  };

  const config = getStatusConfig(searchStatus);
  const StatusIcon = config.icon;

  // Calculate completion percentage
  const completionPercent = searchProgress?.completion || 0;
  const foundCount = searchProgress?.found || 0;

  return (
    <div className={`rounded-xl border ${config.borderClass} ${config.bgClass} p-4 animate-fade-in`}>
      <div className="flex items-start gap-4">
        <div className={`w-10 h-10 rounded-lg bg-white/60 flex items-center justify-center flex-shrink-0 shadow-sm`}>
          <StatusIcon className={`h-5 w-5 ${config.iconClass}`} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`font-semibold ${config.textClass}`}>{config.label}</span>
            {(searchStatus === 'running' || searchStatus === 'created') && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/60 text-xs font-medium text-[var(--primary)]">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-pulse-slow" />
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
                  className="inline-flex items-center px-2 py-0.5 rounded-md bg-white/40 text-xs text-[var(--text-tertiary)]"
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
                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-white/40 text-xs text-[var(--text-muted)]">
                  +{search.criteria.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col items-end gap-1">
          {foundCount > 0 && (
            <div className="flex items-center gap-1.5 text-sm font-medium text-[var(--text-primary)]">
              <Users className="h-4 w-4 text-[var(--text-tertiary)]" />
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
          <div className="h-1.5 bg-white/60 rounded-full overflow-hidden">
            <div
              className={`h-full bg-[var(--primary)] rounded-full transition-all duration-500 ${
                completionPercent === 0 ? 'animate-pulse-slow' : ''
              }`}
              style={{ width: completionPercent > 0 ? `${completionPercent}%` : '30%' }}
            />
          </div>
        </div>
      )}

      {/* Success summary */}
      {searchStatus === 'completed' && foundCount > 0 && (
        <div className="mt-4 pt-3 border-t border-[var(--success)]/10">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[var(--success)]">
              Successfully found {foundCount} candidates matching your criteria
            </span>
            <CheckCircle2 className="h-4 w-4 text-[var(--success)]" />
          </div>
        </div>
      )}
    </div>
  );
}
