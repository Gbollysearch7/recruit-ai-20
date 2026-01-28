'use client';

import { ReactNode } from 'react';
import { PipelineStage } from '@/lib/hooks/usePipeline';
import { MoreHorizontal, Settings } from 'lucide-react';

interface KanbanColumnProps {
  stage: PipelineStage;
  candidateCount: number;
  isDragOver: boolean;
  onDragOver: () => void;
  onDragLeave: () => void;
  onDrop: () => void;
  onEdit?: () => void;
  children: ReactNode;
}

export function KanbanColumn({
  stage,
  candidateCount,
  isDragOver,
  onDragOver,
  onDragLeave,
  onDrop,
  onEdit,
  children,
}: KanbanColumnProps) {
  return (
    <div
      className={`w-72 flex-shrink-0 bg-[var(--bg-surface)] rounded-lg flex flex-col transition-all ${
        isDragOver ? 'ring-2 ring-[var(--primary)] ring-opacity-50 bg-[var(--primary-light)]' : ''
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        onDragOver();
      }}
      onDragLeave={onDragLeave}
      onDrop={(e) => {
        e.preventDefault();
        onDrop();
      }}
    >
      {/* Column Header */}
      <div className="p-3 border-b border-[var(--border-light)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: stage.color }}
          />
          <h3 className="font-medium text-sm text-[var(--text-primary)]">
            {stage.name}
          </h3>
          <span className="text-xs text-[var(--text-muted)] bg-[var(--bg-elevated)] px-1.5 py-0.5 rounded-full">
            {candidateCount}
          </span>
        </div>
        {onEdit && (
          <button
            onClick={onEdit}
            className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Column Content */}
      <div className="flex-1 p-2 space-y-2 overflow-y-auto max-h-[calc(100vh-280px)] sidebar-scroll">
        {children}
      </div>
    </div>
  );
}
