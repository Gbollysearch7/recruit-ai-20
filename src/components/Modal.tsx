'use client';

import { useEffect, useRef } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-2xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className={`relative w-full ${sizeClasses[size]} mx-4 bg-[var(--bg-elevated)] rounded-lg shadow-xl border border-[var(--border-light)] animate-fade-in`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-light)]">
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] rounded transition-colors"
          >
            <span className="material-icons-outlined text-lg">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

// Code Modal for displaying API code
interface CodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  code: string;
  language?: string;
}

export function CodeModal({ isOpen, onClose, code, language = 'javascript' }: CodeModalProps) {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="API Code" size="lg">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-[var(--text-muted)] uppercase">{language}</span>
          <button
            onClick={copyToClipboard}
            className="btn btn-ghost text-xs"
          >
            <span className="material-icons-outlined text-sm">content_copy</span>
            Copy
          </button>
        </div>
        <pre className="p-4 bg-[var(--bg-surface)] rounded-lg overflow-x-auto text-xs font-mono text-[var(--text-secondary)]">
          <code>{code}</code>
        </pre>
      </div>
    </Modal>
  );
}

// Confirmation Modal
interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'default';
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
}: ConfirmModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="space-y-4">
        <p className="text-sm text-[var(--text-secondary)]">{message}</p>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="btn btn-secondary">
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={variant === 'danger' ? 'btn bg-[var(--error)] text-white hover:bg-red-600' : 'btn btn-primary'}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// Filter Modal
interface FilterOption {
  id: string;
  label: string;
  checked: boolean;
}

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterOption[];
  onApply: (filters: FilterOption[]) => void;
}

export function FilterModal({ isOpen, onClose, filters, onApply }: FilterModalProps) {
  const handleToggle = (id: string) => {
    const updated = filters.map(f =>
      f.id === id ? { ...f, checked: !f.checked } : f
    );
    onApply(updated);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Filter Results" size="sm">
      <div className="space-y-3">
        {filters.map((filter) => (
          <label key={filter.id} className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={filter.checked}
              onChange={() => handleToggle(filter.id)}
              className="rounded"
            />
            <span className="text-sm text-[var(--text-secondary)]">{filter.label}</span>
          </label>
        ))}
        <div className="flex justify-end pt-2">
          <button onClick={onClose} className="btn btn-primary text-xs">
            Done
          </button>
        </div>
      </div>
    </Modal>
  );
}

// Sort Modal
interface SortOption {
  id: string;
  label: string;
}

interface SortModalProps {
  isOpen: boolean;
  onClose: () => void;
  options: SortOption[];
  currentSort: string;
  onSort: (sortId: string) => void;
}

export function SortModal({ isOpen, onClose, options, currentSort, onSort }: SortModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Sort By" size="sm">
      <div className="space-y-1">
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => {
              onSort(option.id);
              onClose();
            }}
            className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
              currentSort === option.id
                ? 'bg-[var(--primary-light)] text-[var(--primary)]'
                : 'hover:bg-[var(--bg-surface)] text-[var(--text-secondary)]'
            }`}
          >
            {option.label}
            {currentSort === option.id && (
              <span className="material-icons-outlined text-sm float-right">check</span>
            )}
          </button>
        ))}
      </div>
    </Modal>
  );
}

// Add Enrichment Modal
interface EnrichmentOption {
  id: string;
  label: string;
  description: string;
}

interface AddEnrichmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableEnrichments: EnrichmentOption[];
  selectedEnrichments: string[];
  onAdd: (enrichmentId: string) => void;
}

export function AddEnrichmentModal({
  isOpen,
  onClose,
  availableEnrichments,
  selectedEnrichments,
  onAdd,
}: AddEnrichmentModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Enrichment" size="md">
      <div className="space-y-2">
        {availableEnrichments.map((enrichment) => {
          const isSelected = selectedEnrichments.includes(enrichment.id);
          return (
            <button
              key={enrichment.id}
              onClick={() => {
                if (!isSelected) {
                  onAdd(enrichment.id);
                }
              }}
              disabled={isSelected}
              className={`w-full text-left p-3 rounded border transition-colors ${
                isSelected
                  ? 'bg-[var(--bg-surface)] border-[var(--border-light)] opacity-50 cursor-not-allowed'
                  : 'border-[var(--border-light)] hover:border-[var(--primary)] hover:bg-[var(--primary-light)]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">{enrichment.label}</p>
                  <p className="text-xs text-[var(--text-muted)]">{enrichment.description}</p>
                </div>
                {isSelected && (
                  <span className="material-icons-outlined text-[var(--primary)]">check_circle</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </Modal>
  );
}
