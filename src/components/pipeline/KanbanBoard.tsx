'use client';

import { useState, useCallback } from 'react';
import { PipelineStage, PipelineCandidate } from '@/lib/hooks/usePipeline';
import { KanbanColumn } from './KanbanColumn';
import { KanbanCard } from './KanbanCard';
import { Plus, Settings, BarChart3 } from 'lucide-react';

interface KanbanBoardProps {
  stages: PipelineStage[];
  candidates: PipelineCandidate[];
  onMoveCandidate: (candidateId: string, newStage: string) => Promise<boolean>;
  onAddStage?: () => void;
  onEditStage?: (stage: PipelineStage) => void;
  onCandidateClick?: (candidate: PipelineCandidate) => void;
  isLoading?: boolean;
}

export function KanbanBoard({
  stages,
  candidates,
  onMoveCandidate,
  onAddStage,
  onEditStage,
  onCandidateClick,
  isLoading = false,
}: KanbanBoardProps) {
  const [draggedCandidate, setDraggedCandidate] = useState<PipelineCandidate | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);

  const getCandidatesForStage = useCallback((stageName: string) => {
    return candidates.filter(c =>
      c.stage === stageName || (!c.stage && stageName === 'New')
    );
  }, [candidates]);

  const handleDragStart = (candidate: PipelineCandidate) => {
    setDraggedCandidate(candidate);
  };

  const handleDragEnd = () => {
    setDraggedCandidate(null);
    setDragOverStage(null);
  };

  const handleDragOver = (stageName: string) => {
    if (draggedCandidate && draggedCandidate.stage !== stageName) {
      setDragOverStage(stageName);
    }
  };

  const handleDragLeave = () => {
    setDragOverStage(null);
  };

  const handleDrop = async (stageName: string) => {
    if (draggedCandidate && draggedCandidate.stage !== stageName) {
      await onMoveCandidate(draggedCandidate.id, stageName);
    }
    setDraggedCandidate(null);
    setDragOverStage(null);
  };

  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4 px-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="w-72 flex-shrink-0 bg-[var(--bg-surface)] rounded-lg animate-pulse"
          >
            <div className="p-3 border-b border-[var(--border-light)]">
              <div className="h-5 bg-[var(--bg-elevated)] rounded w-24" />
            </div>
            <div className="p-3 space-y-3">
              {[1, 2, 3].map((j) => (
                <div key={j} className="h-24 bg-[var(--bg-elevated)] rounded-lg" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 px-1 min-h-[calc(100vh-200px)]">
      {stages.map((stage) => {
        const stageCandidates = getCandidatesForStage(stage.name);
        const isDragOver = dragOverStage === stage.name;

        return (
          <KanbanColumn
            key={stage.id}
            stage={stage}
            candidateCount={stageCandidates.length}
            isDragOver={isDragOver}
            onDragOver={() => handleDragOver(stage.name)}
            onDragLeave={handleDragLeave}
            onDrop={() => handleDrop(stage.name)}
            onEdit={onEditStage ? () => onEditStage(stage) : undefined}
          >
            {stageCandidates.map((candidate) => (
              <KanbanCard
                key={candidate.id}
                candidate={candidate}
                isDragging={draggedCandidate?.id === candidate.id}
                onDragStart={() => handleDragStart(candidate)}
                onDragEnd={handleDragEnd}
                onClick={onCandidateClick ? () => onCandidateClick(candidate) : undefined}
              />
            ))}
            {stageCandidates.length === 0 && (
              <div className="py-8 text-center">
                <p className="text-xs text-[var(--text-muted)]">
                  No candidates
                </p>
                <p className="text-[10px] text-[var(--text-muted)] mt-1">
                  Drag candidates here
                </p>
              </div>
            )}
          </KanbanColumn>
        );
      })}

      {/* Add Stage Button */}
      {onAddStage && (
        <div className="w-72 flex-shrink-0">
          <button
            onClick={onAddStage}
            className="w-full h-full min-h-[200px] border-2 border-dashed border-[var(--border-light)] rounded-lg flex flex-col items-center justify-center gap-2 text-[var(--text-muted)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors"
          >
            <Plus className="w-6 h-6" />
            <span className="text-sm font-medium">Add Stage</span>
          </button>
        </div>
      )}
    </div>
  );
}
