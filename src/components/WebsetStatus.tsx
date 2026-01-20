'use client';

import { Webset } from '@/types/exa';
import { Clock, CheckCircle2, XCircle, Loader2, Search } from 'lucide-react';

interface WebsetStatusProps {
  webset: Webset | null;
}

export function WebsetStatus({ webset }: WebsetStatusProps) {
  if (!webset) return null;

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'completed':
        return {
          icon: CheckCircle2,
          iconClass: 'text-[var(--success)]',
          bgClass: 'bg-[var(--success-light)]',
          borderClass: 'border-[var(--success)]/20',
          textClass: 'text-[var(--success)]',
          label: 'Search Complete'
        };
      case 'failed':
        return {
          icon: XCircle,
          iconClass: 'text-[var(--error)]',
          bgClass: 'bg-[var(--error-light)]',
          borderClass: 'border-[var(--error)]/20',
          textClass: 'text-[var(--error)]',
          label: 'Search Failed'
        };
      case 'running':
        return {
          icon: Loader2,
          iconClass: 'text-[var(--accent)] animate-spin',
          bgClass: 'bg-[var(--accent-light)]',
          borderClass: 'border-[var(--accent)]/20',
          textClass: 'text-[var(--accent)]',
          label: 'Searching...'
        };
      default:
        return {
          icon: Clock,
          iconClass: 'text-[var(--text-muted)]',
          bgClass: 'bg-[var(--bg-tertiary)]',
          borderClass: 'border-[var(--border-light)]',
          textClass: 'text-[var(--text-secondary)]',
          label: 'Pending'
        };
    }
  };

  const config = getStatusConfig(webset.status);
  const StatusIcon = config.icon;

  return (
    <div className={`rounded-xl border ${config.borderClass} ${config.bgClass} p-4 animate-fade-in`}>
      <div className="flex items-start gap-4">
        <div className={`w-10 h-10 rounded-lg bg-white/60 flex items-center justify-center flex-shrink-0 shadow-sm`}>
          <StatusIcon className={`h-5 w-5 ${config.iconClass}`} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`font-semibold ${config.textClass}`}>{config.label}</span>
            {webset.status === 'running' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/60 text-xs font-medium text-[var(--accent)]">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse-slow" />
                Live
              </span>
            )}
          </div>

          {webset.searches?.[0] && (
            <p className="text-sm text-[var(--text-secondary)] truncate">
              <span className="text-[var(--text-muted)]">Query:</span> {webset.searches[0].query}
            </p>
          )}

          {webset.title && (
            <p className="text-sm text-[var(--text-tertiary)] mt-1">{webset.title}</p>
          )}
        </div>

        <div className="flex flex-col items-end gap-1">
          <span className="font-mono text-[10px] text-[var(--text-muted)] uppercase tracking-wider">
            ID
          </span>
          <code className="text-xs text-[var(--text-tertiary)] bg-white/40 px-2 py-0.5 rounded">
            {webset.id.slice(0, 8)}
          </code>
        </div>
      </div>

      {/* Progress indicator for running state */}
      {webset.status === 'running' && (
        <div className="mt-4 pt-3 border-t border-[var(--accent)]/10">
          <div className="flex items-center justify-between text-xs text-[var(--accent)] mb-2">
            <span>Searching the web for matching profiles...</span>
          </div>
          <div className="h-1.5 bg-white/60 rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--accent)] rounded-full animate-pulse-slow"
              style={{ width: '60%' }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
