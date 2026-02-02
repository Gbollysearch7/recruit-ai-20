'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useLists } from '@/lib/hooks/useLists';
import type { List, Candidate, ListMember } from '@/lib/supabase';

interface ListMemberWithCandidate extends ListMember {
  candidate?: Candidate | null;
}

interface ListWithMembers extends List {
  members?: ListMemberWithCandidate[];
  candidateCount?: number;
}

export default function SharedListPage() {
  const params = useParams();
  const shareId = params.id as string;
  const { getListByShareId } = useLists();
  const [list, setList] = useState<ListWithMembers | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadList = async () => {
      setIsLoading(true);
      const data = await getListByShareId(shareId);
      if (data) {
        setList(data);
      } else {
        setError('List not found or is no longer shared.');
      }
      setIsLoading(false);
    };
    if (shareId) loadList();
  }, [shareId, getListByShareId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="text-center">
          <span className="material-icons-outlined text-3xl text-[var(--text-muted)] animate-spin block mb-2">refresh</span>
          <p className="text-sm text-[var(--text-muted)]">Loading shared list...</p>
        </div>
      </div>
    );
  }

  if (error || !list) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="text-center max-w-sm">
          <span className="material-icons-outlined text-4xl text-[var(--text-muted)] block mb-3">link_off</span>
          <h1 className="text-lg font-semibold text-[var(--text-primary)] mb-1.5">List Not Found</h1>
          <p className="text-xs text-[var(--text-muted)] mb-4">{error || 'This list may have been removed or is no longer shared.'}</p>
          <Link href="/" className="btn btn-primary">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  const candidates = (list.members || [])
    .map(m => m.candidate)
    .filter((c): c is Candidate => c !== null && c !== undefined);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Header */}
      <header className="border-b border-[var(--border-light)] bg-[var(--bg-elevated)]">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-md flex items-center justify-center"
              style={{ backgroundColor: list.color || '#6366f1' }}
            >
              <span className="material-icons-outlined text-sm text-white">folder</span>
            </div>
            <div>
              <h1 className="text-sm font-semibold text-[var(--text-primary)]">{list.name}</h1>
              <p className="text-[10px] text-[var(--text-muted)]">
                {candidates.length} candidate{candidates.length !== 1 ? 's' : ''} · Shared list
              </p>
            </div>
          </div>
          <Link
            href="/"
            className="text-xs text-[var(--primary)] hover:text-[var(--primary-hover)] font-medium"
          >
            Recruit AI
          </Link>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {list.description && (
          <p className="text-xs text-[var(--text-secondary)] mb-4">{list.description}</p>
        )}

        {candidates.length === 0 ? (
          <div className="text-center py-12">
            <span className="material-icons-outlined text-4xl text-[var(--text-muted)] block mb-2">person_off</span>
            <p className="text-sm text-[var(--text-muted)]">No candidates in this list</p>
          </div>
        ) : (
          <div className="bg-[var(--bg-elevated)] rounded-lg border border-[var(--border-light)] overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border-light)] bg-[var(--bg-surface)]">
                  <th className="text-left px-4 py-2.5 text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wider">#</th>
                  <th className="text-left px-4 py-2.5 text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wider">Name</th>
                  <th className="text-left px-4 py-2.5 text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wider">Title</th>
                  <th className="text-left px-4 py-2.5 text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wider">Company</th>
                  <th className="text-left px-4 py-2.5 text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wider">LinkedIn</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-light)]">
                {candidates.map((candidate, i) => (
                  <tr key={candidate.id} className="hover:bg-[var(--bg-surface)] transition-colors">
                    <td className="px-4 py-3 text-xs text-[var(--text-muted)]">{i + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {candidate.avatar ? (
                          <img src={candidate.avatar} alt="" className="w-7 h-7 rounded-md object-cover" />
                        ) : (
                          <div className="w-7 h-7 rounded-md bg-[var(--primary)] flex items-center justify-center text-white text-[10px] font-medium">
                            {candidate.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                        )}
                        <span className="text-xs font-medium text-[var(--text-primary)]">{candidate.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--text-secondary)]">{candidate.title || '-'}</td>
                    <td className="px-4 py-3 text-xs text-[var(--text-secondary)]">{candidate.company || '-'}</td>
                    <td className="px-4 py-3">
                      {candidate.linkedin ? (
                        <a
                          href={candidate.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[var(--primary)] hover:underline"
                        >
                          View Profile
                        </a>
                      ) : (
                        <span className="text-xs text-[var(--text-muted)]">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
