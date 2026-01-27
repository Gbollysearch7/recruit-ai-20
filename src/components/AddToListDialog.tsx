'use client';

import { useState, useEffect } from 'react';
import { useLists } from '@/lib/hooks/useLists';
import { useAuth } from '@/lib/hooks/useAuth';
import { useToast } from './Toast';

interface AddToListDialogProps {
  isOpen: boolean;
  onClose: () => void;
  candidateId?: string;
  candidateIds?: string[];
  candidateName?: string;
  onSuccess?: () => void;
}

export function AddToListDialog({
  isOpen,
  onClose,
  candidateId,
  candidateIds,
  candidateName,
  onSuccess,
}: AddToListDialogProps) {
  const [isCreatingList, setIsCreatingList] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [selectedLists, setSelectedLists] = useState<Set<string>>(new Set());
  const [existingListIds, setExistingListIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  const { lists, createList, addCandidateToList, addCandidatesToList, getListsForCandidate } = useLists();
  const { isAuthenticated, isConfigured } = useAuth();
  const { addToast } = useToast();

  const isBulk = candidateIds && candidateIds.length > 0;
  const targetIds = isBulk ? candidateIds : candidateId ? [candidateId] : [];

  // Load which lists the candidate is already in
  useEffect(() => {
    if (isOpen && candidateId && !isBulk) {
      getListsForCandidate(candidateId).then(ids => {
        setExistingListIds(new Set(ids));
        setSelectedLists(new Set(ids));
      });
    } else {
      setExistingListIds(new Set());
      setSelectedLists(new Set());
    }
  }, [isOpen, candidateId, isBulk, getListsForCandidate]);

  const handleToggleList = (listId: string) => {
    const newSelected = new Set(selectedLists);
    if (newSelected.has(listId)) {
      newSelected.delete(listId);
    } else {
      newSelected.add(listId);
    }
    setSelectedLists(newSelected);
  };

  const handleCreateList = async () => {
    if (!newListName.trim()) return;

    setIsLoading(true);
    try {
      const list = await createList({ name: newListName.trim() });
      if (list) {
        setSelectedLists(prev => new Set([...prev, list.id]));
        setNewListName('');
        setIsCreatingList(false);
        addToast(`List "${list.name}" created`, 'success');
      } else {
        addToast('Failed to create list', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (targetIds.length === 0) return;

    setIsLoading(true);
    try {
      // Get lists to add (newly selected, not already in)
      const listsToAdd = [...selectedLists].filter(id => !existingListIds.has(id));

      let successCount = 0;

      if (isBulk && targetIds.length > 0) {
        // Bulk add to multiple lists
        for (const listId of listsToAdd) {
          const success = await addCandidatesToList(listId, targetIds);
          if (success) successCount++;
        }
      } else if (candidateId) {
        // Single candidate add
        for (const listId of listsToAdd) {
          const success = await addCandidateToList(listId, candidateId);
          if (success) successCount++;
        }
      }

      if (successCount > 0) {
        const message = isBulk
          ? `Added ${targetIds.length} candidates to ${successCount} list${successCount > 1 ? 's' : ''}`
          : `Added${candidateName ? ` ${candidateName}` : ''} to ${successCount} list${successCount > 1 ? 's' : ''}`;
        addToast(message, 'success');
        onSuccess?.();
      }

      onClose();
    } catch {
      addToast('Failed to add to list', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  if (!isConfigured || !isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/50" onClick={onClose} />
        <div className="relative bg-[var(--bg-elevated)] rounded-lg shadow-xl max-w-sm w-full mx-4 p-6">
          <div className="text-center">
            <span className="material-icons-outlined text-4xl text-[var(--text-tertiary)] mb-4">lock</span>
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Sign in required</h3>
            <p className="text-sm text-[var(--text-secondary)] mb-4">
              Please sign in to save candidates to lists.
            </p>
            <button onClick={onClose} className="btn btn-secondary">
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-[var(--bg-elevated)] rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--border-light)]">
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">
            {isBulk ? `Add ${targetIds.length} candidates to list` : 'Add to list'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors"
          >
            <span className="material-icons-outlined text-xl">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {isCreatingList ? (
            <div className="space-y-3">
              <input
                type="text"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                placeholder="List name"
                className="input w-full"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setIsCreatingList(false);
                    setNewListName('');
                  }}
                  className="btn btn-secondary flex-1"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateList}
                  className="btn btn-primary flex-1"
                  disabled={isLoading || !newListName.trim()}
                >
                  {isLoading ? 'Creating...' : 'Create'}
                </button>
              </div>
            </div>
          ) : (
            <>
              <button
                onClick={() => setIsCreatingList(true)}
                className="w-full flex items-center gap-2 p-3 rounded-lg border border-dashed border-[var(--border-light)] text-[var(--text-secondary)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors mb-3"
              >
                <span className="material-icons-outlined text-lg">add</span>
                Create new list
              </button>

              {lists.length === 0 ? (
                <p className="text-sm text-[var(--text-tertiary)] text-center py-4">
                  No lists yet. Create one to get started.
                </p>
              ) : (
                <div className="space-y-2">
                  {lists.map((list) => {
                    const isSelected = selectedLists.has(list.id);
                    const isExisting = existingListIds.has(list.id);
                    return (
                      <button
                        key={list.id}
                        onClick={() => handleToggleList(list.id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                          isSelected
                            ? 'border-[var(--primary)] bg-[var(--primary-light)]'
                            : 'border-[var(--border-light)] hover:border-[var(--border)] hover:bg-[var(--bg-surface)]'
                        }`}
                      >
                        <div
                          className="w-8 h-8 rounded flex items-center justify-center text-white text-xs"
                          style={{ backgroundColor: list.color || '#6366f1' }}
                        >
                          <span className="material-icons-outlined text-base">{list.icon || 'folder'}</span>
                        </div>
                        <div className="flex-1 text-left">
                          <p className="text-sm font-medium text-[var(--text-primary)]">{list.name}</p>
                          <p className="text-xs text-[var(--text-tertiary)]">
                            {list.candidateCount || 0} candidates
                          </p>
                        </div>
                        {isSelected && (
                          <span className="material-icons-outlined text-[var(--primary)]">
                            {isExisting ? 'check_circle' : 'check_circle_outline'}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {!isCreatingList && (
          <div className="p-4 border-t border-[var(--border-light)]">
            <div className="flex gap-2">
              <button onClick={onClose} className="btn btn-secondary flex-1">
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="btn btn-primary flex-1"
                disabled={
                  isLoading ||
                  selectedLists.size === 0 ||
                  [...selectedLists].every(id => existingListIds.has(id))
                }
              >
                {isLoading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
