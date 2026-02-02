'use client';

import { Modal } from './Modal';

interface ShortcutItem {
  keys: string;
  description: string;
}

interface KeyboardShortcutsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  shortcuts?: ShortcutItem[];
}

const defaultShortcuts: ShortcutItem[] = [
  { keys: '⌘ + K', description: 'Focus search' },
  { keys: '/', description: 'Focus search' },
  { keys: '⌘ + N', description: 'New search' },
  { keys: '⌘ + E', description: 'Export results' },
  { keys: '⌘ + A', description: 'Select all' },
  { keys: '⌘ + S', description: 'Save selected candidates' },
  { keys: 'Escape', description: 'Deselect all / Close panel' },
  { keys: '↑ / ↓', description: 'Navigate through results' },
  { keys: 'Enter', description: 'Open selected item' },
  { keys: '?', description: 'Show this help' },
];

export function KeyboardShortcutsDialog({ isOpen, onClose, shortcuts = defaultShortcuts }: KeyboardShortcutsDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Keyboard Shortcuts" size="sm">
      <div className="space-y-1">
        {shortcuts.map((shortcut, index) => (
          <div
            key={index}
            className="flex items-center justify-between py-2 px-2 rounded hover:bg-[var(--bg-surface)] transition-colors"
          >
            <span className="text-xs text-[var(--text-secondary)]">{shortcut.description}</span>
            <kbd className="inline-flex items-center gap-1 px-2 py-1 bg-[var(--bg-surface)] border border-[var(--border-light)] rounded text-[10px] font-mono text-[var(--text-primary)]">
              {shortcut.keys}
            </kbd>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-[var(--border-light)]">
        <p className="text-[10px] text-[var(--text-muted)] text-center">
          Press <kbd className="px-1 py-0.5 bg-[var(--bg-surface)] border border-[var(--border-light)] rounded text-[10px]">?</kbd> anywhere to open this dialog
        </p>
      </div>
    </Modal>
  );
}
