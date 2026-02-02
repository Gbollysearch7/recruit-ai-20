'use client';

import { useState } from 'react';
import { useLists } from '@/lib/hooks/useLists';
import { useToast } from './Toast';

interface ShareListDialogProps {
  isOpen: boolean;
  onClose: () => void;
  listId: string;
  listName: string;
  currentShareId?: string | null;
  isPublic?: boolean;
}

export function ShareListDialog({ isOpen, onClose, listId, listName, currentShareId, isPublic }: ShareListDialogProps) {
  const { shareList, unshareList } = useLists();
  const { addToast } = useToast();
  const [shareUrl, setShareUrl] = useState<string | null>(
    currentShareId ? `${typeof window !== 'undefined' ? window.location.origin : ''}/shared/list/${currentShareId}` : null
  );
  const [isSharing, setIsSharing] = useState(false);
  const [isUnsharing, setIsUnsharing] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleShare = async () => {
    setIsSharing(true);
    const url = await shareList(listId);
    setIsSharing(false);
    if (url) {
      setShareUrl(url);
      addToast('Share link generated', 'success');
    } else {
      addToast('Failed to generate share link', 'error');
    }
  };

  const handleUnshare = async () => {
    setIsUnsharing(true);
    const success = await unshareList(listId);
    setIsUnsharing(false);
    if (success) {
      setShareUrl(null);
      addToast('List is now private', 'success');
      onClose();
    } else {
      addToast('Failed to make list private', 'error');
    }
  };

  const handleCopy = async () => {
    if (shareUrl) {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      addToast('Link copied to clipboard', 'success');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      <div className="fixed inset-x-4 top-[20%] mx-auto max-w-md bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-light)] shadow-[var(--shadow-lg)] z-50 overflow-hidden">
        <div className="px-5 py-4 border-b border-[var(--border-light)]">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">Share List</h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">Share &quot;{listName}&quot; with anyone via a public link</p>
        </div>

        <div className="p-5 space-y-4">
          {shareUrl || (isPublic && currentShareId) ? (
            <>
              <div className="flex items-center gap-2 p-3 bg-[var(--bg-surface)] rounded-lg border border-[var(--border-light)]">
                <span className="material-icons-outlined text-sm text-[var(--success)]">public</span>
                <p className="text-xs text-[var(--text-secondary)] flex-1 truncate">{shareUrl}</p>
                <button
                  onClick={handleCopy}
                  className="px-2 py-1 text-xs font-medium text-[var(--primary)] hover:bg-[var(--primary-light)] rounded transition-colors"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <p className="text-xs text-[var(--text-muted)]">
                Anyone with this link can view the candidates in this list (read-only).
              </p>
              <button
                onClick={handleUnshare}
                disabled={isUnsharing}
                className="w-full px-3 py-2 text-xs font-medium border border-[var(--error)]/20 text-[var(--error)] rounded-lg hover:bg-[var(--error-bg)] transition-colors disabled:opacity-50"
              >
                {isUnsharing ? 'Removing...' : 'Remove Public Access'}
              </button>
            </>
          ) : (
            <>
              <div className="text-center py-4">
                <span className="material-icons-outlined text-4xl text-[var(--text-muted)] mb-2 block">link</span>
                <p className="text-sm font-medium text-[var(--text-primary)] mb-1">Create a shareable link</p>
                <p className="text-xs text-[var(--text-muted)]">
                  Generate a public link that anyone can use to view this list
                </p>
              </div>
              <button
                onClick={handleShare}
                disabled={isSharing}
                className="w-full px-4 py-2.5 text-xs font-medium bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary-hover)] disabled:opacity-50 transition-colors"
              >
                {isSharing ? 'Generating...' : 'Generate Share Link'}
              </button>
            </>
          )}
        </div>

        <div className="flex justify-end px-5 py-3 border-t border-[var(--border-light)] bg-[var(--bg-surface)]">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg hover:bg-[var(--bg-elevated)] transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </>
  );
}
