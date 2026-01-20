'use client';

import { useState, useMemo } from 'react';
import { WebsetItem } from '@/types/exa';

interface WebsetTableProps {
  items: WebsetItem[];
  criteria: string[];
  isLoading?: boolean;
  onSelectionChange?: (selectedIds: Set<string>) => void;
  onRowClick?: (item: WebsetItem) => void;
  selectedRowId?: string | null;
}

type MatchStatus = 'Match' | 'Miss' | 'Unclear';

// Simulate match status for criteria (in real app, this would come from API)
function getMatchStatus(seed: number): MatchStatus {
  if (seed % 7 === 0) return 'Miss';
  if (seed % 5 === 0) return 'Unclear';
  return 'Match';
}

function getMatchBadgeClass(status: MatchStatus) {
  switch (status) {
    case 'Match':
      return 'match-badge match-badge-match';
    case 'Miss':
      return 'match-badge match-badge-miss';
    case 'Unclear':
      return 'match-badge match-badge-unclear';
  }
}

function getReferenceCount(seed: number) {
  return ((seed * 7) % 30) + 1;
}

// Criteria colors matching the design
const criteriaColors = ['bg-purple-500', 'bg-orange-500', 'bg-blue-500', 'bg-slate-300'];

export function WebsetTable({ items, criteria, isLoading, onSelectionChange, onRowClick, selectedRowId }: WebsetTableProps) {
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  const updateSelection = (newSelection: Set<string>) => {
    setSelectedRows(newSelection);
    onSelectionChange?.(newSelection);
  };

  const toggleRow = (id: string) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    updateSelection(newSelected);
  };

  const toggleAll = () => {
    if (selectedRows.size === items.length) {
      updateSelection(new Set());
    } else {
      updateSelection(new Set(items.map(item => item.id)));
    }
  };

  // Memoize criteria columns
  const criteriaColumns = useMemo(() => criteria.slice(0, 3).map((c, i) => ({
    id: `criteria-${i}`,
    label: c.length > 18 ? c.slice(0, 18) + '...' : c,
    fullLabel: c,
    color: criteriaColors[i] || criteriaColors[3],
  })), [criteria]);

  if (isLoading) {
    return (
      <div className="flex-1 bg-white dark:bg-black/20 overflow-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-[var(--bg-surface)] border-b border-[var(--border-light)]" />
          {[...Array(15)].map((_, i) => (
            <div key={i} className="h-7 border-b border-[var(--border-light)] flex items-center px-2 gap-2">
              <div className="w-6 h-3 bg-[var(--bg-surface)] rounded" />
              <div className="w-5 h-5 bg-[var(--bg-surface)] rounded" />
              <div className="w-24 h-3 bg-[var(--bg-surface)] rounded" />
              <div className="w-20 h-3 bg-[var(--bg-surface)] rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex-1 bg-white dark:bg-black/20 flex items-center justify-center">
        <div className="text-center text-[var(--text-tertiary)]">
          <p className="text-sm font-medium">No results yet</p>
          <p className="text-xs mt-1">Start a search to find candidates</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-white dark:bg-black/20 overflow-auto">
      <table className="dense-table">
        <thead>
          <tr>
            <th className="w-10 text-center">
              <input
                type="checkbox"
                checked={selectedRows.size === items.length && items.length > 0}
                onChange={toggleAll}
              />
            </th>
            <th className="w-10 text-center">#</th>
            <th className="w-48">
              <div className="flex items-center gap-2">
                <span className="material-icons-outlined text-sm opacity-50">person</span>
                Name
              </div>
            </th>
            <th className="w-40">
              <div className="flex items-center gap-2">
                <span className="material-icons-outlined text-sm opacity-50">business</span>
                Company
              </div>
            </th>
            <th className="w-48">
              <div className="flex items-center gap-2">
                <span className="material-icons-outlined text-sm opacity-50">work_outline</span>
                Job Title
              </div>
            </th>
            <th className="w-48">
              <div className="flex items-center gap-2">
                <span className="material-icons-outlined text-sm opacity-50">link</span>
                URL
              </div>
            </th>
            {criteriaColumns.map((col) => (
              <th key={col.id} className="min-w-[140px]">
                <div className="flex items-center gap-2" title={col.fullLabel}>
                  <span className={`w-2 h-2 rounded-sm ${col.color}`}></span>
                  {col.label}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => {
            const props = item.properties;
            const person = props.type === 'person' ? props : null;
            const isSelected = selectedRows.has(item.id);

            return (
              <tr
                key={item.id}
                onClick={() => onRowClick?.(item)}
                className={`transition-colors cursor-pointer ${
                  selectedRowId === item.id
                    ? 'bg-blue-50 dark:bg-blue-900/20'
                    : isSelected
                    ? 'bg-[var(--primary-light)]'
                    : 'hover:bg-[var(--bg-surface)]'
                }`}
              >
                <td className="text-center">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleRow(item.id)}
                  />
                </td>
                <td className="text-center text-[var(--text-muted)]">{index + 1}</td>
                <td>
                  <div className="flex items-center gap-2 py-0.5">
                    <div className="avatar">
                      {person?.pictureUrl ? (
                        <img src={person.pictureUrl} alt="" />
                      ) : (
                        <img
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${person?.name || index}`}
                          alt=""
                        />
                      )}
                    </div>
                    <span className="font-medium truncate">{person?.name || '-'}</span>
                  </div>
                </td>
                <td className="text-[var(--text-secondary)]">{person?.company?.name || '-'}</td>
                <td className="text-[var(--text-tertiary)]">{person?.position || '-'}</td>
                <td>
                  {item.url ? (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--primary)] opacity-80 hover:opacity-100 truncate block max-w-[180px]"
                    >
                      {item.url.replace('https://', '').replace('www.', '').slice(0, 20)}...
                    </a>
                  ) : (
                    <span className="text-[var(--text-muted)]">-</span>
                  )}
                </td>
                {criteriaColumns.map((col, colIndex) => {
                  const seed = index + colIndex + 2;
                  const status = getMatchStatus(seed);
                  const refs = getReferenceCount(seed);
                  return (
                    <td key={col.id}>
                      <div className="flex items-center justify-between">
                        <span className={getMatchBadgeClass(status)}>
                          {status}
                        </span>
                        <span className="text-[9px] text-[var(--text-muted)]">{refs} ref.</span>
                      </div>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
