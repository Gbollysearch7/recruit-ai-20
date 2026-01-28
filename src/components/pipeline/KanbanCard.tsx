'use client';

import { PipelineCandidate } from '@/lib/hooks/usePipeline';
import {
  Mail,
  Linkedin,
  Building2,
  MapPin,
  GripVertical,
  ExternalLink,
} from 'lucide-react';

interface KanbanCardProps {
  candidate: PipelineCandidate;
  isDragging: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
  onClick?: () => void;
}

export function KanbanCard({
  candidate,
  isDragging,
  onDragStart,
  onDragEnd,
  onClick,
}: KanbanCardProps) {
  // Generate avatar from name
  const initials = candidate.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Generate a consistent color based on name
  const colors = [
    '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e',
    '#f97316', '#eab308', '#22c55e', '#14b8a6',
    '#0ea5e9', '#6b7280',
  ];
  const colorIndex = candidate.name.charCodeAt(0) % colors.length;
  const avatarColor = colors[colorIndex];

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = 'move';
        onDragStart();
      }}
      onDragEnd={onDragEnd}
      onClick={onClick}
      className={`bg-[var(--bg-elevated)] rounded-lg border border-[var(--border-light)] p-3 cursor-grab active:cursor-grabbing transition-all group ${
        isDragging ? 'opacity-50 rotate-2 scale-105' : 'hover:shadow-md hover:border-[var(--border)]'
      }`}
    >
      {/* Drag Handle */}
      <div className="flex items-start gap-2">
        <div className="text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity cursor-grab">
          <GripVertical className="w-4 h-4" />
        </div>

        {/* Avatar */}
        {candidate.avatar ? (
          <img
            src={candidate.avatar}
            alt={candidate.name}
            className="w-9 h-9 rounded-full object-cover flex-shrink-0"
          />
        ) : (
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
            style={{ backgroundColor: avatarColor }}
          >
            {initials}
          </div>
        )}

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm text-[var(--text-primary)] truncate">
            {candidate.name}
          </h4>
          {candidate.title && (
            <p className="text-xs text-[var(--text-secondary)] truncate">
              {candidate.title}
            </p>
          )}
        </div>
      </div>

      {/* Details */}
      <div className="mt-2 pl-6 space-y-1">
        {candidate.company && (
          <div className="flex items-center gap-1.5 text-[10px] text-[var(--text-muted)]">
            <Building2 className="w-3 h-3" />
            <span className="truncate">{candidate.company}</span>
          </div>
        )}
        {candidate.location && (
          <div className="flex items-center gap-1.5 text-[10px] text-[var(--text-muted)]">
            <MapPin className="w-3 h-3" />
            <span className="truncate">{candidate.location}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="mt-2 pl-6 flex items-center gap-2">
        {candidate.email && (
          <a
            href={`mailto:${candidate.email}`}
            onClick={(e) => e.stopPropagation()}
            className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--primary)] hover:bg-[var(--bg-surface)] transition-colors"
            title="Send email"
          >
            <Mail className="w-3.5 h-3.5" />
          </a>
        )}
        {candidate.linkedin && (
          <a
            href={candidate.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="p-1 rounded text-[var(--text-muted)] hover:text-[#0a66c2] hover:bg-[var(--bg-surface)] transition-colors"
            title="View LinkedIn"
          >
            <Linkedin className="w-3.5 h-3.5" />
          </a>
        )}
        {candidate.match_score !== null && candidate.match_score !== undefined && (
          <div className="ml-auto">
            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
              candidate.match_score >= 80 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
              candidate.match_score >= 60 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
              'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
            }`}>
              {candidate.match_score}%
            </span>
          </div>
        )}
      </div>

      {/* Tags */}
      {candidate.tags && candidate.tags.length > 0 && (
        <div className="mt-2 pl-6 flex flex-wrap gap-1">
          {candidate.tags.slice(0, 3).map((tag, i) => (
            <span
              key={i}
              className="text-[10px] px-1.5 py-0.5 bg-[var(--bg-surface)] text-[var(--text-muted)] rounded"
            >
              {tag}
            </span>
          ))}
          {candidate.tags.length > 3 && (
            <span className="text-[10px] text-[var(--text-muted)]">
              +{candidate.tags.length - 3}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
