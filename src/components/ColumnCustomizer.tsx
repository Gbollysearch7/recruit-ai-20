'use client';

import { useState, useRef, useEffect } from 'react';

export interface ColumnConfig {
  id: string;
  label: string;
  visible: boolean;
  width?: number;
  locked?: boolean; // Can't be hidden
  order: number;
}

interface ColumnCustomizerProps {
  columns: ColumnConfig[];
  onColumnsChange: (columns: ColumnConfig[]) => void;
  trigger?: React.ReactNode;
}

export function ColumnCustomizer({ columns, onColumnsChange, trigger }: ColumnCustomizerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localColumns, setLocalColumns] = useState(columns);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync local state when columns prop changes
  useEffect(() => {
    setLocalColumns(columns);
  }, [columns]);

  const toggleColumn = (id: string) => {
    const col = localColumns.find(c => c.id === id);
    if (col?.locked) return;

    const updated = localColumns.map(c =>
      c.id === id ? { ...c, visible: !c.visible } : c
    );
    setLocalColumns(updated);
    onColumnsChange(updated);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newColumns = [...localColumns];
    const draggedColumn = newColumns[draggedIndex];
    newColumns.splice(draggedIndex, 1);
    newColumns.splice(index, 0, draggedColumn);

    // Update order
    const reordered = newColumns.map((col, i) => ({ ...col, order: i }));
    setLocalColumns(reordered);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    onColumnsChange(localColumns);
  };

  const showAll = () => {
    const updated = localColumns.map(c => ({ ...c, visible: true }));
    setLocalColumns(updated);
    onColumnsChange(updated);
  };

  const hideOptional = () => {
    const updated = localColumns.map(c => ({ ...c, visible: c.locked || false }));
    setLocalColumns(updated);
    onColumnsChange(updated);
  };

  const resetToDefault = () => {
    const defaultColumns = getDefaultColumns();
    setLocalColumns(defaultColumns);
    onColumnsChange(defaultColumns);
  };

  const visibleCount = localColumns.filter(c => c.visible).length;
  const totalCount = localColumns.length;

  return (
    <div className="relative" ref={dropdownRef}>
      {trigger ? (
        <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>
      ) : (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="btn btn-secondary text-xs flex items-center gap-1"
          title="Customize columns"
        >
          <span className="material-icons-outlined text-sm">view_column</span>
          Columns
          <span className="text-[var(--text-muted)]">({visibleCount})</span>
        </button>
      )}

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-64 bg-[var(--bg-elevated)] border border-[var(--border-light)] rounded-lg shadow-lg z-50 animate-scale-in">
          <div className="p-3 border-b border-[var(--border-light)]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[var(--text-primary)]">Customize Columns</span>
              <span className="text-[10px] text-[var(--text-muted)]">{visibleCount}/{totalCount} visible</span>
            </div>
            <div className="flex gap-1">
              <button
                onClick={showAll}
                className="text-[10px] px-2 py-1 rounded bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors"
              >
                Show All
              </button>
              <button
                onClick={hideOptional}
                className="text-[10px] px-2 py-1 rounded bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors"
              >
                Minimal
              </button>
              <button
                onClick={resetToDefault}
                className="text-[10px] px-2 py-1 rounded bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors"
              >
                Reset
              </button>
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto p-2">
            {localColumns
              .sort((a, b) => a.order - b.order)
              .map((column, index) => (
                <div
                  key={column.id}
                  draggable={!column.locked}
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`flex items-center gap-2 px-2 py-1.5 rounded hover:bg-[var(--bg-surface)] transition-colors cursor-pointer group ${
                    draggedIndex === index ? 'opacity-50 bg-[var(--primary-light)]' : ''
                  }`}
                  onClick={() => toggleColumn(column.id)}
                >
                  {!column.locked && (
                    <span className="material-icons-outlined text-xs text-[var(--text-muted)] opacity-0 group-hover:opacity-100 cursor-grab">
                      drag_indicator
                    </span>
                  )}
                  <input
                    type="checkbox"
                    checked={column.visible}
                    onChange={() => toggleColumn(column.id)}
                    disabled={column.locked}
                    className="cursor-pointer disabled:cursor-not-allowed"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span className={`text-xs flex-1 ${
                    column.visible ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'
                  }`}>
                    {column.label}
                  </span>
                  {column.locked && (
                    <span className="material-icons-outlined text-[10px] text-[var(--text-muted)]">lock</span>
                  )}
                </div>
              ))}
          </div>

          <div className="p-2 border-t border-[var(--border-light)]">
            <p className="text-[10px] text-[var(--text-muted)] text-center">
              Drag to reorder • Click to toggle
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// Default column configuration
export function getDefaultColumns(): ColumnConfig[] {
  return [
    { id: 'checkbox', label: 'Select', visible: true, locked: true, order: 0 },
    { id: 'index', label: '#', visible: true, locked: true, order: 1 },
    { id: 'name', label: 'Name', visible: true, locked: true, order: 2 },
    { id: 'company', label: 'Company', visible: true, order: 3 },
    { id: 'position', label: 'Job Title', visible: true, order: 4 },
    { id: 'location', label: 'Location', visible: false, order: 5 },
    { id: 'url', label: 'URL', visible: true, order: 6 },
    { id: 'email', label: 'Email', visible: false, order: 7 },
    { id: 'linkedin', label: 'LinkedIn', visible: false, order: 8 },
    { id: 'criteria1', label: 'Criteria 1', visible: true, order: 9 },
    { id: 'criteria2', label: 'Criteria 2', visible: true, order: 10 },
    { id: 'criteria3', label: 'Criteria 3', visible: true, order: 11 },
    { id: 'actions', label: 'Actions', visible: true, locked: true, order: 12 },
  ];
}

// Hook to persist column settings in localStorage
export function useColumnSettings(storageKey: string = 'talist-column-settings') {
  const [columns, setColumns] = useState<ColumnConfig[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          return getDefaultColumns();
        }
      }
    }
    return getDefaultColumns();
  });

  const updateColumns = (newColumns: ColumnConfig[]) => {
    setColumns(newColumns);
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, JSON.stringify(newColumns));
    }
  };

  return { columns, setColumns: updateColumns };
}
