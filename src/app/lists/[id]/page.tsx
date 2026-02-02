'use client';

import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { useLists } from '@/lib/hooks/useLists';
import { useAuth } from '@/lib/hooks/useAuth';
import { useToast } from '@/components/Toast';
import { CandidateNotes } from '@/components/CandidateNotes';
import { InlineBreadcrumb } from '@/components/Breadcrumbs';
import { ShareListDialog } from '@/components/ShareListDialog';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import type { List, Candidate, ListMember } from '@/lib/supabase';

interface ListMemberWithCandidate extends ListMember {
  candidate?: Candidate | null;
}

interface ListWithMembers extends List {
  members?: ListMemberWithCandidate[];
  candidateCount?: number;
}

function formatDate(dateString: string | null | undefined) {
  if (!dateString) return 'Just now';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function ListDetailPage() {
  const params = useParams();
  const listId = params.id as string;

  const { getListWithCandidates, removeCandidateFromList, updateList } = useLists();
  const { isAuthenticated, isConfigured } = useAuth();
  const { addToast } = useToast();

  const [list, setList] = useState<ListWithMembers | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const colors = [
    '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316',
    '#eab308', '#22c55e', '#14b8a6', '#0ea5e9', '#6b7280',
  ];

  useEffect(() => {
    if (isAuthenticated && listId) {
      loadList();
    }
  }, [isAuthenticated, listId]);

  const loadList = async () => {
    setIsLoading(true);
    const data = await getListWithCandidates(listId);
    setList(data);
    if (data) {
      setEditName(data.name);
      setEditColor(data.color || '#6366f1');
    }
    setIsLoading(false);
  };

  const handleRemoveCandidate = async (candidateId: string) => {
    const success = await removeCandidateFromList(listId, candidateId);
    if (success) {
      addToast('Candidate removed from list', 'success');
      setList(prev => prev ? {
        ...prev,
        members: prev.members?.filter(m => m.candidate_id !== candidateId),
        candidateCount: Math.max((prev.candidateCount || 0) - 1, 0),
      } : null);
      if (selectedCandidate?.id === candidateId) {
        setSelectedCandidate(null);
      }
    } else {
      addToast('Failed to remove candidate', 'error');
    }
  };

  const handleUpdateList = async () => {
    if (!editName.trim()) return;

    setIsUpdating(true);
    const updated = await updateList(listId, {
      name: editName.trim(),
      color: editColor,
    });
    if (updated) {
      setList(prev => prev ? { ...prev, ...updated } : null);
      addToast('List updated', 'success');
      setShowEditModal(false);
    } else {
      addToast('Failed to update list', 'error');
    }
    setIsUpdating(false);
  };

  if (!isConfigured || !isAuthenticated) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <span className="material-icons-outlined text-5xl text-[var(--text-muted)] mb-4 block">lock</span>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Sign in required</h2>
            <p className="text-sm text-[var(--text-secondary)]">Please sign in to view this list.</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-4">
          <div className="animate-pulse">
            <div className="h-8 bg-[var(--bg-surface)] rounded w-48 mb-2" />
            <div className="h-4 bg-[var(--bg-surface)] rounded w-32" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 bg-[var(--bg-elevated)] rounded-lg border border-[var(--border-light)] p-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse flex items-center gap-3 py-3">
                  <div className="w-10 h-10 rounded-full bg-[var(--bg-surface)]" />
                  <div className="flex-1">
                    <div className="h-4 bg-[var(--bg-surface)] rounded w-32 mb-2" />
                    <div className="h-3 bg-[var(--bg-surface)] rounded w-24" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!list) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <span className="material-icons-outlined text-5xl text-[var(--text-muted)] mb-4 block">folder_off</span>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">List not found</h2>
            <p className="text-sm text-[var(--text-secondary)] mb-4">This list doesn&apos;t exist or you don&apos;t have access.</p>
            <Link href="/lists" className="btn btn-primary">
              Back to Lists
            </Link>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-4">
        {/* Breadcrumbs */}
        <InlineBreadcrumb parent="My Lists" parentHref="/lists" current={list.name} />

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
              style={{ backgroundColor: list.color || '#6366f1' }}
            >
              <span className="material-icons-outlined">{list.icon || 'folder'}</span>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-[var(--text-primary)] tracking-tight">{list.name}</h1>
              <p className="text-sm text-[var(--text-secondary)]">
                {list.candidateCount || 0} candidates
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadList}
              className="btn btn-secondary"
              title="Refresh"
            >
              <span className="material-icons-outlined text-sm">refresh</span>
            </button>
            <button
              onClick={() => setShowShareDialog(true)}
              className="btn btn-secondary"
            >
              <span className="material-icons-outlined text-sm">share</span>
              Share
            </button>
            <button
              onClick={() => setShowEditModal(true)}
              className="btn btn-secondary"
            >
              <span className="material-icons-outlined text-sm">edit</span>
              Edit
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Candidates List */}
          <div className="lg:col-span-2 bg-[var(--bg-elevated)] rounded-lg border border-[var(--border-light)] overflow-hidden">
            {(!list.members || list.members.length === 0) ? (
              <div className="py-12 text-center">
                <span className="material-icons-outlined text-4xl text-[var(--text-muted)] mb-3 block">person_off</span>
                <h3 className="text-sm font-medium text-[var(--text-primary)] mb-1">No candidates yet</h3>
                <p className="text-xs text-[var(--text-muted)] mb-4">Add candidates from search results</p>
                <Link href="/search" className="btn btn-primary">
                  <span className="material-icons-outlined text-sm">search</span>
                  Search Candidates
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-[var(--border-light)]">
                {list.members.map((member) => {
                  const candidate = member.candidate;
                  if (!candidate) return null;

                  return (
                    <div
                      key={member.id}
                      onClick={() => setSelectedCandidate(candidate)}
                      className={`p-4 cursor-pointer transition-colors ${
                        selectedCandidate?.id === candidate.id
                          ? 'bg-[var(--primary-light)]'
                          : 'hover:bg-[var(--bg-surface)]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-[var(--bg-surface)] flex-shrink-0">
                          {candidate.avatar ? (
                            <img src={candidate.avatar} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <img
                              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${candidate.name}`}
                              alt=""
                              className="w-full h-full"
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-[var(--text-primary)] truncate">{candidate.name}</p>
                          <p className="text-xs text-[var(--text-secondary)] truncate">
                            {candidate.title && candidate.company
                              ? `${candidate.title} at ${candidate.company}`
                              : candidate.title || candidate.company || 'No title'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {candidate.linkedin && (
                            <a
                              href={candidate.linkedin}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="p-1 rounded text-[var(--text-tertiary)] hover:text-[var(--primary)] hover:bg-[var(--bg-surface)]"
                              title="View profile"
                            >
                              <span className="material-icons-outlined text-sm">open_in_new</span>
                            </a>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveCandidate(candidate.id);
                            }}
                            className="p-1 rounded text-[var(--text-tertiary)] hover:text-[var(--error)] hover:bg-[var(--error-bg)]"
                            title="Remove from list"
                          >
                            <span className="material-icons-outlined text-sm">close</span>
                          </button>
                        </div>
                      </div>
                      <p className="text-[10px] text-[var(--text-muted)] mt-2">
                        Added {formatDate(member.added_at)}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Selected Candidate Details */}
          <div className="bg-[var(--bg-elevated)] rounded-lg border border-[var(--border-light)] overflow-hidden">
            {selectedCandidate ? (
              <div>
                <div className="p-4 border-b border-[var(--border-light)]">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-[var(--bg-surface)]">
                      {selectedCandidate.avatar ? (
                        <img src={selectedCandidate.avatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <img
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedCandidate.name}`}
                          alt=""
                          className="w-full h-full"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-[var(--text-primary)]">{selectedCandidate.name}</h3>
                      {selectedCandidate.title && (
                        <p className="text-sm text-[var(--text-secondary)]">{selectedCandidate.title}</p>
                      )}
                      {selectedCandidate.company && (
                        <p className="text-xs text-[var(--text-tertiary)]">{selectedCandidate.company}</p>
                      )}
                    </div>
                  </div>
                  {selectedCandidate.linkedin && (
                    <a
                      href={selectedCandidate.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary w-full mt-3"
                    >
                      <span className="material-icons-outlined text-sm">open_in_new</span>
                      View Profile
                    </a>
                  )}
                </div>
                <div className="p-4">
                  <h4 className="text-sm font-medium text-[var(--text-primary)] mb-3">Notes</h4>
                  <CandidateNotes candidateId={selectedCandidate.id} />
                </div>
              </div>
            ) : (
              <div className="p-8 text-center">
                <span className="material-icons-outlined text-3xl text-[var(--text-muted)] mb-2 block">person_search</span>
                <p className="text-sm text-[var(--text-tertiary)]">Select a candidate to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit List Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowEditModal(false)} />
          <div className="relative bg-[var(--bg-elevated)] rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-4 border-b border-[var(--border-light)]">
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">Edit List</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1 rounded text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]"
              >
                <span className="material-icons-outlined text-xl">close</span>
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">List Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="input w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Color</label>
                <div className="flex flex-wrap gap-2">
                  {colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setEditColor(color)}
                      className={`w-8 h-8 rounded-lg transition-transform ${
                        editColor === color ? 'ring-2 ring-offset-2 ring-[var(--primary)] scale-110' : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-[var(--border-light)] flex gap-2">
              <button onClick={() => setShowEditModal(false)} className="btn btn-secondary flex-1">
                Cancel
              </button>
              <button
                onClick={handleUpdateList}
                disabled={isUpdating || !editName.trim()}
                className="btn btn-primary flex-1"
              >
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share List Dialog */}
      <ShareListDialog
        isOpen={showShareDialog}
        onClose={() => setShowShareDialog(false)}
        listId={listId}
        listName={list.name}
        currentShareId={list.share_id}
        isPublic={list.is_public ?? false}
      />
    </AppLayout>
  );
}
