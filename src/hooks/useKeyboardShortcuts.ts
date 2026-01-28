'use client';

import { useEffect, useCallback } from 'react';

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean; // Command key on Mac
  shiftKey?: boolean;
  altKey?: boolean;
  action: () => void;
  description: string;
  global?: boolean; // If true, works even when input is focused
}

interface UseKeyboardShortcutsOptions {
  enabled?: boolean;
  shortcuts: KeyboardShortcut[];
}

export function useKeyboardShortcuts({ enabled = true, shortcuts }: UseKeyboardShortcutsOptions) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Check if user is typing in an input field
      const isInputField =
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement ||
        (event.target instanceof HTMLElement && event.target.isContentEditable);

      for (const shortcut of shortcuts) {
        // Skip non-global shortcuts when in input field
        if (isInputField && !shortcut.global) continue;

        const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatches = shortcut.ctrlKey ? event.ctrlKey : !event.ctrlKey;
        const metaMatches = shortcut.metaKey ? event.metaKey : !event.metaKey;
        const shiftMatches = shortcut.shiftKey ? event.shiftKey : !event.shiftKey;
        const altMatches = shortcut.altKey ? event.altKey : !event.altKey;

        // Check for Ctrl/Cmd (works on both Windows and Mac)
        const modifierMatches =
          (shortcut.ctrlKey || shortcut.metaKey)
            ? (event.ctrlKey || event.metaKey)
            : (!event.ctrlKey && !event.metaKey);

        if (
          keyMatches &&
          (shortcut.ctrlKey || shortcut.metaKey ? modifierMatches : ctrlMatches && metaMatches) &&
          shiftMatches &&
          altMatches
        ) {
          event.preventDefault();
          shortcut.action();
          return;
        }
      }
    },
    [enabled, shortcuts]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

// Keyboard shortcuts help dialog content
export function getKeyboardShortcutsList(shortcuts: KeyboardShortcut[]): Array<{
  keys: string;
  description: string;
}> {
  return shortcuts.map(shortcut => {
    const keys: string[] = [];
    if (shortcut.ctrlKey || shortcut.metaKey) keys.push('⌘');
    if (shortcut.shiftKey) keys.push('⇧');
    if (shortcut.altKey) keys.push('⌥');
    keys.push(shortcut.key.toUpperCase());
    return {
      keys: keys.join(' + '),
      description: shortcut.description,
    };
  });
}

// Common shortcut definitions
export function createCommonShortcuts(actions: {
  onSearch?: () => void;
  onExport?: () => void;
  onSelectAll?: () => void;
  onDeselectAll?: () => void;
  onDelete?: () => void;
  onNewSearch?: () => void;
  onClosePanel?: () => void;
  onNavigateUp?: () => void;
  onNavigateDown?: () => void;
  onOpenSelected?: () => void;
  onSaveSelected?: () => void;
  onShowHelp?: () => void;
}): KeyboardShortcut[] {
  const shortcuts: KeyboardShortcut[] = [];

  if (actions.onSearch) {
    shortcuts.push({
      key: 'k',
      ctrlKey: true,
      action: actions.onSearch,
      description: 'Focus search',
      global: true,
    });
    shortcuts.push({
      key: '/',
      action: actions.onSearch,
      description: 'Focus search',
    });
  }

  if (actions.onExport) {
    shortcuts.push({
      key: 'e',
      ctrlKey: true,
      action: actions.onExport,
      description: 'Export results',
    });
  }

  if (actions.onSelectAll) {
    shortcuts.push({
      key: 'a',
      ctrlKey: true,
      action: actions.onSelectAll,
      description: 'Select all',
    });
  }

  if (actions.onDeselectAll) {
    shortcuts.push({
      key: 'Escape',
      action: actions.onDeselectAll,
      description: 'Deselect all / Close panel',
      global: true,
    });
  }

  if (actions.onDelete) {
    shortcuts.push({
      key: 'Backspace',
      ctrlKey: true,
      action: actions.onDelete,
      description: 'Delete selected',
    });
  }

  if (actions.onNewSearch) {
    shortcuts.push({
      key: 'n',
      ctrlKey: true,
      action: actions.onNewSearch,
      description: 'New search',
      global: true,
    });
  }

  if (actions.onClosePanel) {
    shortcuts.push({
      key: 'Escape',
      action: actions.onClosePanel,
      description: 'Close panel',
    });
  }

  if (actions.onNavigateUp) {
    shortcuts.push({
      key: 'ArrowUp',
      action: actions.onNavigateUp,
      description: 'Navigate up',
    });
  }

  if (actions.onNavigateDown) {
    shortcuts.push({
      key: 'ArrowDown',
      action: actions.onNavigateDown,
      description: 'Navigate down',
    });
  }

  if (actions.onOpenSelected) {
    shortcuts.push({
      key: 'Enter',
      action: actions.onOpenSelected,
      description: 'Open selected',
    });
  }

  if (actions.onSaveSelected) {
    shortcuts.push({
      key: 's',
      ctrlKey: true,
      action: actions.onSaveSelected,
      description: 'Save selected',
    });
  }

  if (actions.onShowHelp) {
    shortcuts.push({
      key: '?',
      action: actions.onShowHelp,
      description: 'Show keyboard shortcuts',
    });
  }

  return shortcuts;
}
