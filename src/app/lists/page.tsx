'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { useLists } from '@/lib/hooks/useLists';
import { useAuth } from '@/lib/hooks/useAuth';
import { useToast } from '@/components/Toast';
import { ImportDialog } from '@/components/ImportDialog';
import Link from 'next/link';

function formatDate(dateString: string | null | undefined) {
  if (!dateString) return 'Just now';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function ListsPage() {
  const { lists, isLoading, createList, deleteList, fetchLists } = useLists();
  const { isAuthenticated, isConfigured } = useAuth();
  const { addToast } = useToast();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [newListName, setNewListName] = useState('');
  const [newListColor, setNewListColor] = useState('#6366f1');
  const [isCreating, setIsCreating] = useState(false);

  const colors = [
    '#6366f1', // indigo
    '#8b5cf6', // violet
    '#ec4899', // pink
    '#f43f5e', // rose
    '#f97316', // orange
    '#eab308', // yellow
    '#22c55e', // green
    '#14b8a6', // teal
    '#0ea5e9', // sky
    '#6b7280', // gray
  ];

  const handleCreateList = async () => {
    if (!newListName.trim()) return;

    setIsCreating(true);
    try {
      const list = await createList({
        name: newListName.trim(),
        color: newListColor,
      });
      if (list) {
        addToast(`List "${list.name}" created`, 'success');
        setShowCreateModal(false);
        setNewListName('');
        setNewListColor('#6366f1');
      } else {
        addToast('Failed to create list', 'error');
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteList = async (id: string) => {
    const list = lists.find(l => l.id === id);
    const success = await deleteList(id);
    if (success) {
      addToast(`List "${list?.name}" deleted`, 'success');
    } else {
      addToast('Failed to delete list', 'error');
    }
    setShowDeleteConfirm(null);
  };

  if (!isConfigured) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <span className="material-icons-outlined text-5xl text-[var(--text-muted)] mb-4 block">settings</span>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Supabase not configured</h2>
            <p className="text-sm text-[var(--text-secondary)] max-w-sm">
              Please configure your Supabase credentials to use the lists feature.
            </p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!isAuthenticated) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <span className="material-icons-outlined text-5xl text-[var(--text-muted)] mb-4 block">lock</span>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Sign in required</h2>
            <p className="text-sm text-[var(--text-secondary)] max-w-sm mb-4">
              Please sign in to view and manage your candidate lists.
            </p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-[var(--text-primary)] tracking-tight">My Lists</h1>
            <p className="text-sm text-[var(--text-secondary)] mt-0.5">Organize and manage your saved candidates</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchLists()}
              className="btn btn-secondary"
              title="Refresh"
            >
              <span className="material-icons-outlined text-sm">refresh</span>
            </button>
            <button
              onClick={() => setShowImportDialog(true)}
              className="btn btn-secondary"
            >
              <span className="material-icons-outlined text-sm">upload_file</span>
              Import
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary"
            >
              <span className="material-icons-outlined text-sm">add</span>
              New List
            </button>
          </div>
        </div>

        {/* Lists Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse bg-[var(--bg-elevated)] rounded-lg border border-[var(--border-light)] p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-[var(--bg-surface)]" />
                  <div className="flex-1">
                    <div className="h-4 bg-[var(--bg-surface)] rounded w-24 mb-2" />
                    <div className="h-3 bg-[var(--bg-surface)] rounded w-16" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : lists.length === 0 ? (
          <div className="bg-[var(--bg-elevated)] rounded-lg border border-[var(--border-light)] py-12 text-center">
            <span className="material-icons-outlined text-4xl text-[var(--text-muted)] mb-3 block">folder_off</span>
            <h3 className="text-sm font-medium text-[var(--text-primary)] mb-1">No lists yet</h3>
            <p className="text-xs text-[var(--text-muted)] mb-4">Create your first list to organize candidates</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary"
            >
              <span className="material-icons-outlined text-sm">add</span>
              Create List
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {lists.map((list) => (
              <div
                key={list.id}
                className="bg-[var(--bg-elevated)] rounded-lg border border-[var(--border-light)] p-4 hover:border-[var(--border)] transition-colors group relative"
              >
                <Link href={`/lists/${list.id}`} className="absolute inset-0" />
                <div className="flex items-start gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white flex-shrink-0"
                    style={{ backgroundColor: list.color || '#6366f1' }}
                  >
                    <span className="material-icons-outlined text-xl">{list.icon || 'folder'}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-[var(--text-primary)] truncate">{list.name}</h3>
                    <p className="text-xs text-[var(--text-muted)]">
                      {list.candidateCount || 0} candidates
                    </p>
                  </div>
                  <div className="flex items-center gap-1 relative z-10">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setShowDeleteConfirm(list.id);
                      }}
                      className="p-1 rounded text-[var(--text-tertiary)] hover:text-[var(--error)] hover:bg-[var(--error-bg)] opacity-0 group-hover:opacity-100 transition-all"
                      title="Delete list"
                    >
                      <span className="material-icons-outlined text-sm">delete</span>
                    </button>
                  </div>
                </div>
                {list.description && (
                  <p className="text-xs text-[var(--text-secondary)] mt-2 line-clamp-2">{list.description}</p>
                )}
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[var(--border-light)]">
                  <span className="text-[10px] text-[var(--text-muted)]">
                    Created {formatDate(list.created_at)}
                  </span>
                </div>

                {/* Delete confirmation */}
                {showDeleteConfirm === list.id && (
                  <div
                    className="absolute top-12 right-2 bg-[var(--bg-elevated)] border border-[var(--border-light)] rounded-md shadow-[var(--shadow-md)] p-3 z-20 w-44"
                    onClick={(e) => e.preventDefault()}
                  >
                    <p className="text-xs text-[var(--text-secondary)] mb-2">Delete this list?</p>
                    <div className="flex gap-1.5">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleDeleteList(list.id);
                        }}
                        className="flex-1 px-2 py-1 bg-[var(--error)] text-white text-[10px] font-medium rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          setShowDeleteConfirm(null);
                        }}
                        className="flex-1 px-2 py-1 border border-[var(--border-light)] text-[var(--text-secondary)] text-[10px] font-medium rounded hover:bg-[var(--bg-surface)]"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create List Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowCreateModal(false)} />
          <div className="relative bg-[var(--bg-elevated)] rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-4 border-b border-[var(--border-light)]">
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">Create New List</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors"
              >
                <span className="material-icons-outlined text-xl">close</span>
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                  List Name
                </label>
                <input
                  type="text"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  placeholder="e.g., Top Candidates"
                  className="input w-full"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setNewListColor(color)}
                      className={`w-8 h-8 rounded-lg transition-transform ${
                        newListColor === color ? 'ring-2 ring-offset-2 ring-[var(--primary)] scale-110' : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--bg-surface)]">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                  style={{ backgroundColor: newListColor }}
                >
                  <span className="material-icons-outlined">folder</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">
                    {newListName || 'List Name'}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">0 candidates</p>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-[var(--border-light)] flex gap-2">
              <button
                onClick={() => setShowCreateModal(false)}
                className="btn btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateList}
                disabled={isCreating || !newListName.trim()}
                className="btn btn-primary flex-1"
              >
                {isCreating ? (
                  <>
                    <span className="material-icons-outlined text-sm animate-spin">refresh</span>
                    Creating...
                  </>
                ) : (
                  'Create List'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Dialog */}
      <ImportDialog
        isOpen={showImportDialog}
        onClose={() => setShowImportDialog(false)}
        onImportComplete={() => fetchLists()}
      />
    </AppLayout>
  );
}
