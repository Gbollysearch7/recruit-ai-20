'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface CandidateInfo {
  name: string;
  position?: string;
  company?: string;
  location?: string;
  pictureUrl?: string;
  url?: string;
  matchScore?: number;
  criteria?: Array<{
    label: string;
    status: 'Match' | 'Miss' | 'Unclear';
  }>;
}

interface CandidatePreviewCardProps {
  candidate: CandidateInfo;
  children: React.ReactNode;
  delay?: number;
}

export function CandidatePreviewCard({
  candidate,
  children,
  delay = 300,
}: CandidatePreviewCardProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLSpanElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const showPreview = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        const cardWidth = 280;
        const cardHeight = 200;

        // Calculate position - prefer showing above and to the right
        let x = rect.right + 8;
        let y = rect.top;

        // Adjust if too close to right edge
        if (x + cardWidth > window.innerWidth - 16) {
          x = rect.left - cardWidth - 8;
        }

        // Adjust if too close to bottom
        if (y + cardHeight > window.innerHeight - 16) {
          y = window.innerHeight - cardHeight - 16;
        }

        // Adjust if too close to top
        if (y < 16) {
          y = 16;
        }

        setPosition({ x, y });
        setIsVisible(true);
      }
    }, delay);
  };

  const hidePreview = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const getStatusColor = (status: 'Match' | 'Miss' | 'Unclear') => {
    switch (status) {
      case 'Match':
        return 'bg-[var(--match-bg)] text-[var(--match-text)]';
      case 'Miss':
        return 'bg-[var(--miss-bg)] text-[var(--miss-text)]';
      default:
        return 'bg-[var(--unclear-bg)] text-[var(--unclear-text)]';
    }
  };

  const previewCard = isVisible && mounted ? createPortal(
    <div
      className="fixed z-[100] animate-fade-in"
      style={{ left: position.x, top: position.y }}
      onMouseEnter={showPreview}
      onMouseLeave={hidePreview}
    >
      <div className="w-[280px] bg-[var(--bg-elevated)] border border-[var(--border-light)] rounded-lg shadow-[var(--shadow-md)] overflow-hidden">
        {/* Header */}
        <div className="p-3 border-b border-[var(--border-light)] bg-[var(--bg-surface)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-[var(--bg-primary)] flex-shrink-0">
              {candidate.pictureUrl ? (
                <img
                  src={candidate.pictureUrl}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${candidate.name}`}
                  alt=""
                  className="w-full h-full"
                />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-[var(--text-primary)] truncate">
                {candidate.name}
              </h3>
              {candidate.position && (
                <p className="text-xs text-[var(--text-secondary)] truncate">
                  {candidate.position}
                </p>
              )}
            </div>
            {candidate.matchScore && (
              <div className="flex items-center gap-1 px-2 py-1 bg-[var(--success-bg)] text-[var(--success-text)] rounded-full text-[10px] font-semibold">
                <span className="material-icons-outlined text-xs">check_circle</span>
                {candidate.matchScore}%
              </div>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="p-3 space-y-2">
          {candidate.company && (
            <div className="flex items-center gap-2 text-xs">
              <span className="material-icons-outlined text-sm text-[var(--text-muted)]">business</span>
              <span className="text-[var(--text-secondary)]">{candidate.company}</span>
            </div>
          )}
          {candidate.location && (
            <div className="flex items-center gap-2 text-xs">
              <span className="material-icons-outlined text-sm text-[var(--text-muted)]">location_on</span>
              <span className="text-[var(--text-secondary)]">{candidate.location}</span>
            </div>
          )}
          {candidate.url && (
            <div className="flex items-center gap-2 text-xs">
              <span className="material-icons-outlined text-sm text-[var(--text-muted)]">link</span>
              <a
                href={candidate.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--primary)] hover:underline truncate"
              >
                {candidate.url.replace('https://', '').replace('www.', '').slice(0, 30)}...
              </a>
            </div>
          )}
        </div>

        {/* Criteria Summary */}
        {candidate.criteria && candidate.criteria.length > 0 && (
          <div className="px-3 pb-3">
            <p className="text-[10px] font-medium text-[var(--text-muted)] uppercase mb-1.5">
              Criteria Match
            </p>
            <div className="flex flex-wrap gap-1">
              {candidate.criteria.slice(0, 4).map((criterion, i) => (
                <span
                  key={i}
                  className={`px-1.5 py-0.5 text-[9px] font-medium rounded ${getStatusColor(criterion.status)}`}
                  title={criterion.label}
                >
                  {criterion.status}
                </span>
              ))}
              {candidate.criteria.length > 4 && (
                <span className="px-1.5 py-0.5 text-[9px] text-[var(--text-muted)]">
                  +{candidate.criteria.length - 4} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="p-2 border-t border-[var(--border-light)] bg-[var(--bg-surface)] flex items-center gap-1">
          {candidate.url && (
            <a
              href={candidate.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 btn btn-secondary text-[10px] py-1"
            >
              <span className="material-icons-outlined text-xs">open_in_new</span>
              View Profile
            </a>
          )}
          <button className="flex-1 btn btn-primary text-[10px] py-1">
            <span className="material-icons-outlined text-xs">bookmark_border</span>
            Save
          </button>
        </div>
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <>
      <span
        ref={triggerRef}
        onMouseEnter={showPreview}
        onMouseLeave={hidePreview}
        className="cursor-pointer"
      >
        {children}
      </span>
      {previewCard}
    </>
  );
}

// Simplified version for table rows
export function TableCandidatePreview({
  name,
  position,
  company,
  pictureUrl,
  children,
}: {
  name: string;
  position?: string;
  company?: string;
  pictureUrl?: string;
  children: React.ReactNode;
}) {
  return (
    <CandidatePreviewCard
      candidate={{ name, position, company, pictureUrl }}
      delay={400}
    >
      {children}
    </CandidatePreviewCard>
  );
}
