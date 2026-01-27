'use client';

import { useState } from 'react';
import { useSearches } from '@/lib/hooks/useSearches';
import { useToast } from './Toast';

interface ShareSearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  searchId: string;
  searchName: string;
  currentShareId?: string | null;
  isPublic?: boolean;
}

export function ShareSearchDialog({
  isOpen,
  onClose,
  searchId,
  searchName,
  currentShareId,
  isPublic,
}: ShareSearchDialogProps) {
  const [shareUrl, setShareUrl] = useState<string | null>(
    currentShareId && isPublic
      ? `${typeof window !== 'undefined' ? window.location.origin : ''}/shared/${currentShareId}`
      : null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const { shareSearch, unshareSearch } = useSearches();
  const { addToast } = useToast();

  const handleShare = async () => {
    setIsLoading(true);
    try {
      const url = await shareSearch(searchId);
      if (url) {
        setShareUrl(url);
        addToast('Share link created', 'success');
      } else {
        addToast('Failed to create share link', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnshare = async () => {
    setIsLoading(true);
    try {
      const success = await unshareSearch(searchId);
      if (success) {
        setShareUrl(null);
        addToast('Share link removed', 'success');
      } else {
        addToast('Failed to remove share link', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!shareUrl) return;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setIsCopied(true);
      addToast('Link copied to clipboard', 'success');
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      addToast('Failed to copy link', 'error');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-[var(--bg-elevated)] rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--border-light)]">
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">
            Share Search
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors"
          >
            <span className="material-icons-outlined text-xl">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--bg-surface)]">
            <div className="w-10 h-10 rounded-lg bg-[var(--primary-light)] flex items-center justify-center">
              <span className="material-icons-outlined text-[var(--primary)]">search</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--text-primary)] truncate">{searchName}</p>
              <p className="text-xs text-[var(--text-tertiary)]">
                {shareUrl ? 'Shared' : 'Not shared'}
              </p>
            </div>
          </div>

          {shareUrl ? (
            <div className="space-y-3">
              <p className="text-sm text-[var(--text-secondary)]">
                Anyone with this link can view this search and its results.
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="input flex-1 text-sm"
                />
                <button
                  onClick={handleCopy}
                  className="btn btn-secondary"
                  title="Copy link"
                >
                  <span className="material-icons-outlined text-sm">
                    {isCopied ? 'check' : 'content_copy'}
                  </span>
                </button>
              </div>
              <button
                onClick={handleUnshare}
                disabled={isLoading}
                className="w-full btn btn-secondary text-[var(--error)]"
              >
                {isLoading ? (
                  <>
                    <span className="material-icons-outlined text-sm animate-spin">refresh</span>
                    Removing...
                  </>
                ) : (
                  <>
                    <span className="material-icons-outlined text-sm">link_off</span>
                    Remove Share Link
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-[var(--text-secondary)]">
                Create a public link to share this search with others. They will be able to view
                the search query and results, but not modify them.
              </p>
              <button
                onClick={handleShare}
                disabled={isLoading}
                className="w-full btn btn-primary"
              >
                {isLoading ? (
                  <>
                    <span className="material-icons-outlined text-sm animate-spin">refresh</span>
                    Creating Link...
                  </>
                ) : (
                  <>
                    <span className="material-icons-outlined text-sm">link</span>
                    Create Share Link
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[var(--border-light)]">
          <button onClick={onClose} className="w-full btn btn-secondary">
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
