'use client';

import { useState } from 'react';

interface BatchActionBarProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onAddToList: () => void;
  onExport: () => void;
  onDelete: () => void;
  onSaveAll?: () => void;
  onCompare?: () => void;
  isExporting?: boolean;
  isSaving?: boolean;
}

export function BatchActionBar({
  selectedCount,
  totalCount,
  onSelectAll,
  onClearSelection,
  onAddToList,
  onExport,
  onDelete,
  onSaveAll,
  onCompare,
  isExporting = false,
  isSaving = false,
}: BatchActionBarProps) {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  if (selectedCount === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
      <div className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-elevated)] border border-[var(--border-light)] rounded-full shadow-[var(--shadow-md)]">
        {/* Selection Count */}
        <div className="flex items-center gap-2 pr-3 border-r border-[var(--border-light)]">
          <div className="w-6 h-6 rounded-full bg-[var(--primary)] text-white flex items-center justify-center text-xs font-semibold">
            {selectedCount}
          </div>
          <span className="text-xs text-[var(--text-secondary)]">
            selected
          </span>
        </div>

        {/* Select All / Clear */}
        <div className="flex items-center gap-1">
          {selectedCount < totalCount && (
            <button
              onClick={onSelectAll}
              className="px-2 py-1 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] rounded transition-colors"
            >
              Select all {totalCount}
            </button>
          )}
          <button
            onClick={onClearSelection}
            className="px-2 py-1 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] rounded transition-colors"
          >
            Clear
          </button>
        </div>

        {/* Divider */}
        <div className="w-px h-5 bg-[var(--border-light)]" />

        {/* Actions */}
        <div className="flex items-center gap-1">
          {onSaveAll && (
            <button
              onClick={onSaveAll}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--success)] hover:bg-[var(--success-bg)] rounded transition-colors disabled:opacity-50"
              title="Save selected candidates"
            >
              <span className={`material-icons-outlined text-sm ${isSaving ? 'animate-spin' : ''}`}>
                {isSaving ? 'refresh' : 'save'}
              </span>
              Save All
            </button>
          )}

          {onCompare && selectedCount >= 2 && selectedCount <= 3 && (
            <button
              onClick={onCompare}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--primary)] hover:bg-[var(--primary-light)] rounded transition-colors"
              title="Compare selected candidates"
            >
              <span className="material-icons-outlined text-sm">compare_arrows</span>
              Compare
            </button>
          )}

          <button
            onClick={onAddToList}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--primary)] hover:bg-[var(--primary-light)] rounded transition-colors"
            title="Add to list"
          >
            <span className="material-icons-outlined text-sm">playlist_add</span>
            Add to List
          </button>

          <button
            onClick={onExport}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--primary)] hover:bg-[var(--primary-light)] rounded transition-colors disabled:opacity-50"
            title="Export selected"
          >
            <span className={`material-icons-outlined text-sm ${isExporting ? 'animate-spin' : ''}`}>
              {isExporting ? 'refresh' : 'download'}
            </span>
            Export
          </button>

          <div className="relative">
            <button
              onClick={() => setShowConfirmDelete(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--error)] hover:bg-[var(--error-bg)] rounded transition-colors"
              title="Delete selected"
            >
              <span className="material-icons-outlined text-sm">delete</span>
              Delete
            </button>

            {/* Delete Confirmation Popover */}
            {showConfirmDelete && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowConfirmDelete(false)}
                />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-[var(--bg-elevated)] border border-[var(--border-light)] rounded-lg shadow-[var(--shadow-md)] p-3 z-50">
                  <p className="text-xs text-[var(--text-secondary)] mb-2">
                    Delete {selectedCount} item{selectedCount > 1 ? 's' : ''}?
                  </p>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => {
                        onDelete();
                        setShowConfirmDelete(false);
                      }}
                      className="flex-1 px-2 py-1 bg-[var(--error)] text-white text-[10px] font-medium rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => setShowConfirmDelete(false)}
                      className="flex-1 px-2 py-1 border border-[var(--border-light)] text-[var(--text-secondary)] text-[10px] font-medium rounded hover:bg-[var(--bg-surface)]"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Close Button */}
        <div className="w-px h-5 bg-[var(--border-light)]" />
        <button
          onClick={onClearSelection}
          className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] rounded transition-colors"
          title="Close"
        >
          <span className="material-icons-outlined text-sm">close</span>
        </button>
      </div>
    </div>
  );
}

// Compact version for smaller screens
export function CompactBatchActionBar({
  selectedCount,
  onClearSelection,
  onAddToList,
  onExport,
  onDelete,
}: Omit<BatchActionBarProps, 'totalCount' | 'onSelectAll' | 'isExporting'>) {
  if (selectedCount === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
      <div className="flex items-center gap-1 p-1 bg-[var(--bg-elevated)] border border-[var(--border-light)] rounded-lg shadow-[var(--shadow-md)]">
        <div className="px-2 py-1 text-xs font-medium text-[var(--primary)]">
          {selectedCount} selected
        </div>
        <button
          onClick={onAddToList}
          className="p-2 text-[var(--text-secondary)] hover:text-[var(--primary)] hover:bg-[var(--primary-light)] rounded"
          title="Add to list"
        >
          <span className="material-icons-outlined text-lg">playlist_add</span>
        </button>
        <button
          onClick={onExport}
          className="p-2 text-[var(--text-secondary)] hover:text-[var(--primary)] hover:bg-[var(--primary-light)] rounded"
          title="Export"
        >
          <span className="material-icons-outlined text-lg">download</span>
        </button>
        <button
          onClick={onDelete}
          className="p-2 text-[var(--text-secondary)] hover:text-[var(--error)] hover:bg-[var(--error-bg)] rounded"
          title="Delete"
        >
          <span className="material-icons-outlined text-lg">delete</span>
        </button>
        <button
          onClick={onClearSelection}
          className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] rounded"
          title="Clear selection"
        >
          <span className="material-icons-outlined text-lg">close</span>
        </button>
      </div>
    </div>
  );
}
