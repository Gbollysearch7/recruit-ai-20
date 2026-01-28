'use client';

import { useState } from 'react';
import {
  Filter,
  SortAsc,
  Code2,
  Download,
  Trash2,
  Trash,
  Eye,
  Zap,
  Users,
  ChevronDown,
  Loader2,
  Bookmark
} from 'lucide-react';

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
  onSaveSearch?: () => void;
  isExporting?: boolean;
  isSaved?: boolean;
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
  onSaveSearch,
  isExporting = false,
  isSaved = false,
}: SearchesToolbarProps) {
  return (
    <div className="h-10 border-b border-[var(--border-light)] flex items-center justify-between px-4 shrink-0 bg-[var(--bg-primary)]">
      <div className="flex items-center gap-4 text-xs">
        <button
          onClick={onFilter}
          className="flex items-center gap-1.5 text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors font-medium px-2 py-1 rounded hover:bg-[var(--bg-surface)]"
        >
          <Filter className="w-3.5 h-3.5" />
          Filter
        </button>
        <button
          onClick={onSort}
          className="flex items-center gap-1.5 text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors font-medium px-2 py-1 rounded hover:bg-[var(--bg-surface)]"
        >
          <SortAsc className="w-3.5 h-3.5" />
          Sort
        </button>
        <button
          onClick={onGetCode}
          className="flex items-center gap-1.5 text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors font-medium px-2 py-1 rounded hover:bg-[var(--bg-surface)]"
        >
          <Code2 className="w-3.5 h-3.5" />
          Get Code
        </button>
        <button
          onClick={onExport}
          disabled={isExporting}
          className={`flex items-center gap-1.5 transition-colors font-medium px-2 py-1 rounded hover:bg-[var(--bg-surface)] ${isExporting
              ? 'text-[var(--text-muted)] cursor-not-allowed'
              : 'text-[var(--text-secondary)] hover:text-[var(--primary)]'
            }`}
        >
          {isExporting ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Download className="w-3.5 h-3.5" />
          )}
          {isExporting ? 'Exporting...' : 'Export'}
        </button>

        {selectedCount > 0 && (
          <>
            <div className="w-px h-4 bg-[var(--border-light)]" />
            <span className="text-[var(--text-muted)] font-medium">{selectedCount} selected</span>
            <button
              onClick={onDelete}
              className="flex items-center gap-1.5 text-[var(--error)] hover:text-[var(--error-text)] transition-colors font-medium px-2 py-1 rounded hover:bg-[var(--error-bg)]"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </button>
          </>
        )}

        <div className="w-px h-4 bg-[var(--border-light)]" />
        <button
          onClick={onDeleteSearch}
          className="flex items-center gap-1.5 text-[var(--text-muted)] hover:text-[var(--error)] transition-colors font-medium px-2 py-1 rounded hover:bg-[var(--error-bg)]"
          title="Delete entire search"
        >
          <Trash className="w-3.5 h-3.5" />
          Delete Search
        </button>
      </div>

      <div className="flex items-center gap-2">
        {onSaveSearch && (
          <button
            onClick={onSaveSearch}
            className={`btn text-xs h-7 px-2.5 ${isSaved ? 'btn-secondary text-[var(--success)]' : 'btn-secondary'}`}
            title={isSaved ? 'Search saved' : 'Save to Saved Searches'}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
            {isSaved ? 'Saved' : 'Save'}
          </button>
        )}
        <button
          onClick={onMonitor}
          className="btn btn-secondary text-xs h-7 px-2.5"
        >
          <Eye className="w-3.5 h-3.5" />
          Monitor
        </button>
        <button
          onClick={onAddEnrichment}
          className="btn btn-primary text-xs h-7 px-2.5"
        >
          <Zap className="w-3.5 h-3.5" />
          Add Enrichment
        </button>
      </div>
    </div>
  );
}

// Footer component for the main area
export function SearchesFooter({ matchCount = 0, totalCount = 0 }: { matchCount?: number; totalCount?: number }) {
  return (
    <footer className="h-9 border-t border-[var(--border-light)] flex items-center justify-between px-4 text-xs text-[var(--text-muted)] shrink-0 bg-[var(--bg-surface)] bg-opacity-30 backdrop-blur-sm">
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1.5 font-medium">
          <Users className="w-3.5 h-3.5" />
          {matchCount} matched candidates
        </span>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 bg-[var(--bg-annotated)] px-1 rounded">
          <span className="font-semibold text-[var(--text-primary)] px-1.5 py-0.5 rounded-sm bg-white shadow-sm">25</span>
          <span className="px-1.5 py-0.5 cursor-pointer hover:text-[var(--text-primary)]">50</span>
          <span className="px-1.5 py-0.5 cursor-pointer hover:text-[var(--text-primary)]">100</span>
        </div>
        <span className="border-l border-[var(--border-light)] h-3 mx-1"></span>
        <button className="flex items-center gap-1 hover:text-[var(--primary)] transition-colors font-medium">
          Page 1 of 5
          <ChevronDown className="w-3 h-3" />
        </button>
      </div>
    </footer>
  );
}
