'use client';

import { useState, useEffect } from 'react';
import { useCandidates } from '@/lib/hooks/useCandidates';
import { useAuth } from '@/lib/hooks/useAuth';
import { useToast } from './Toast';
import type { CandidateComment } from '@/lib/supabase';

interface CandidateNotesProps {
  candidateId: string;
}

export function CandidateNotes({ candidateId }: CandidateNotesProps) {
  const [notes, setNotes] = useState<CandidateComment[]>([]);
  const [newNote, setNewNote] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const { getCandidateComments, addCandidateComment, updateCandidateComment, deleteCandidateComment } = useCandidates();
  const { isAuthenticated, isConfigured } = useAuth();
  const { addToast } = useToast();

  // Load notes
  useEffect(() => {
    if (isAuthenticated && candidateId) {
      setIsLoading(true);
      getCandidateComments(candidateId)
        .then(setNotes)
        .finally(() => setIsLoading(false));
    } else {
      setNotes([]);
      setIsLoading(false);
    }
  }, [candidateId, isAuthenticated, getCandidateComments]);

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    setIsAdding(true);
    try {
      const note = await addCandidateComment(candidateId, newNote.trim());
      if (note) {
        setNotes(prev => [note, ...prev]);
        setNewNote('');
        addToast('Note added', 'success');
      } else {
        addToast('Failed to add note', 'error');
      }
    } finally {
      setIsAdding(false);
    }
  };

  const handleUpdateNote = async (id: string) => {
    if (!editContent.trim()) return;

    try {
      const updated = await updateCandidateComment(id, editContent.trim());
      if (updated) {
        setNotes(prev => prev.map(n => n.id === id ? updated : n));
        setEditingId(null);
        setEditContent('');
        addToast('Note updated', 'success');
      } else {
        addToast('Failed to update note', 'error');
      }
    } catch {
      addToast('Failed to update note', 'error');
    }
  };

  const handleDeleteNote = async (id: string) => {
    try {
      const success = await deleteCandidateComment(id);
      if (success) {
        setNotes(prev => prev.filter(n => n.id !== id));
        addToast('Note deleted', 'success');
      } else {
        addToast('Failed to delete note', 'error');
      }
    } catch {
      addToast('Failed to delete note', 'error');
    }
  };

  const startEditing = (note: CandidateComment) => {
    setEditingId(note.id);
    setEditContent(note.content);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditContent('');
  };

  if (!isConfigured || !isAuthenticated) {
    return (
      <div className="text-center py-4">
        <span className="material-icons-outlined text-2xl text-[var(--text-tertiary)] mb-2">lock</span>
        <p className="text-sm text-[var(--text-tertiary)]">Sign in to add notes</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Add note form */}
      <div className="space-y-2">
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Add a note about this candidate..."
          className="input w-full min-h-[80px] resize-none"
          rows={3}
        />
        <div className="flex justify-end">
          <button
            onClick={handleAddNote}
            disabled={isAdding || !newNote.trim()}
            className="btn btn-primary btn-sm"
          >
            {isAdding ? (
              <>
                <span className="material-icons-outlined text-sm animate-spin">refresh</span>
                Adding...
              </>
            ) : (
              <>
                <span className="material-icons-outlined text-sm">add</span>
                Add Note
              </>
            )}
          </button>
        </div>
      </div>

      {/* Notes list */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map(i => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-[var(--bg-surface)] rounded w-1/4 mb-2" />
              <div className="h-16 bg-[var(--bg-surface)] rounded" />
            </div>
          ))}
        </div>
      ) : notes.length === 0 ? (
        <p className="text-sm text-[var(--text-tertiary)] text-center py-4">
          No notes yet. Add one above.
        </p>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <div
              key={note.id}
              className="p-3 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-light)]"
            >
              {editingId === note.id ? (
                <div className="space-y-2">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="input w-full min-h-[60px] resize-none"
                    rows={2}
                    autoFocus
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={cancelEditing}
                      className="btn btn-secondary btn-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleUpdateNote(note.id)}
                      disabled={!editContent.trim()}
                      className="btn btn-primary btn-sm"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-sm text-[var(--text-primary)] whitespace-pre-wrap">
                    {note.content}
                  </p>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-[var(--border-light)]">
                    <span className="text-xs text-[var(--text-tertiary)]">
                      {note.created_at
                        ? new Date(note.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : 'Just now'}
                    </span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => startEditing(note)}
                        className="p-1 rounded text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
                        title="Edit"
                      >
                        <span className="material-icons-outlined text-sm">edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="p-1 rounded text-[var(--text-tertiary)] hover:text-[var(--error)] hover:bg-[var(--error-bg)] transition-colors"
                        title="Delete"
                      >
                        <span className="material-icons-outlined text-sm">delete</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
