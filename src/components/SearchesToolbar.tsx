'use client';

import { useState } from 'react';

interface SearchesToolbarProps {
  selectedCount: number;
  totalCount: number;
  onFilter?: () => void;
  onSort?: () => void;
  onGetCode?: () => void;
  onMonitor?: () => void;
  onAddEnrichment?: () => void;
  onDelete?: () => void;
  onDeleteSearch?: () => void;
  onExport?: () => void;
  isExporting?: boolean;
}

export function SearchesToolbar({
  selectedCount,
  totalCount,
  onFilter,
  onSort,
  onGetCode,
  onMonitor,
  onAddEnrichment,
  onDelete,
  onDeleteSearch,
  onExport,
  isExporting = false,
}: SearchesToolbarProps) {
  return (
    <div className="h-10 border-b border-[var(--border-light)] flex items-center justify-between px-4 shrink-0 bg-[var(--bg-primary)]">
      <div className="flex items-center gap-4 text-xs">
        <button
          onClick={onFilter}
          className="flex items-center gap-1 text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors"
        >
          <span className="material-icons-outlined text-sm">filter_list</span>
          Filter
        </button>
        <button
          onClick={onSort}
          className="flex items-center gap-1 text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors"
        >
          <span className="material-icons-outlined text-sm">sort</span>
          Sort
        </button>
        <button
          onClick={onGetCode}
          className="flex items-center gap-1 text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors font-mono text-[10px]"
        >
          Get Code &lt;&gt;
        </button>
        <button
          onClick={onExport}
          disabled={isExporting}
          className={`flex items-center gap-1 transition-colors ${
            isExporting
              ? 'text-[var(--text-muted)] cursor-not-allowed'
              : 'text-[var(--text-secondary)] hover:text-[var(--primary)]'
          }`}
        >
          <span className={`material-icons-outlined text-sm ${isExporting ? 'animate-spin' : ''}`}>
            {isExporting ? 'hourglass_empty' : 'download'}
          </span>
          {isExporting ? 'Exporting...' : 'Export'}
        </button>

        {selectedCount > 0 && (
          <>
            <div className="w-px h-4 bg-[var(--border-light)]" />
            <span className="text-[var(--text-muted)]">{selectedCount} selected</span>
            <button
              onClick={onDelete}
              className="flex items-center gap-1 text-[var(--error)] hover:text-[var(--error-text)] transition-colors"
            >
              <span className="material-icons-outlined text-sm">delete</span>
              Delete
            </button>
          </>
        )}

        <div className="w-px h-4 bg-[var(--border-light)]" />
        <button
          onClick={onDeleteSearch}
          className="flex items-center gap-1 text-[var(--text-muted)] hover:text-[var(--error)] transition-colors"
          title="Delete entire search"
        >
          <span className="material-icons-outlined text-sm">delete_forever</span>
          Delete Search
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onMonitor}
          className="btn btn-secondary"
        >
          <span className="material-icons-outlined text-sm">visibility</span>
          Monitor for New People
        </button>
        <button
          onClick={onAddEnrichment}
          className="btn btn-primary"
        >
          <span className="material-icons-outlined text-sm">bolt</span>
          Add Enrichment
        </button>
      </div>
    </div>
  );
}

// Footer component for the main area
export function SearchesFooter({ matchCount = 0, totalCount = 0 }: { matchCount?: number; totalCount?: number }) {
  return (
    <footer className="h-10 border-t border-[var(--border-light)] flex items-center justify-between px-4 text-xs text-[var(--text-muted)] shrink-0 bg-[var(--bg-surface)] bg-opacity-30">
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1">
          <span className="material-icons-outlined text-sm">groups</span>
          {matchCount} / match
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span className="font-medium text-[var(--text-primary)]">25</span>
        <span>100</span>
        <span>Custom</span>
        <span className="border-l border-[var(--border-light)] h-3 mx-1"></span>
        <button className="hover:text-[var(--primary)] transition-colors">
          Everything
          <span className="material-icons-outlined text-xs ml-1">expand_more</span>
        </button>
      </div>
    </footer>
  );
}
