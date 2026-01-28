'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { KanbanBoard, PipelineStats, AddCandidateModal } from '@/components/pipeline';
import { usePipeline, PipelineCandidate, PipelineStage } from '@/lib/hooks/usePipeline';
import { useToast } from '@/components/Toast';
import { useAuth } from '@/lib/hooks/useAuth';
import Link from 'next/link';
import {
  Kanban,
  BarChart3,
  Plus,
  Settings,
  RefreshCw,
  ChevronDown,
  Filter,
  Search,
  X,
  Users,
  Sparkles,
} from 'lucide-react';

type ViewMode = 'board' | 'stats';

export default function PipelinePage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const {
    stages,
    candidates,
    isLoading,
    isLoadingCandidates,
    fetchStages,
    fetchCandidates,
    moveCandidate,
    addCandidateToPipeline,
    addStage,
  } = usePipeline();
  const { addToast } = useToast();

  const [viewMode, setViewMode] = useState<ViewMode>('board');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddStageModal, setShowAddStageModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStageFilter, setSelectedStageFilter] = useState<string>('all');

  // Filter candidates
  const filteredCandidates = candidates.filter(c => {
    const matchesSearch = !searchQuery ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.title?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStage = selectedStageFilter === 'all' ||
      c.stage === selectedStageFilter ||
      (!c.stage && selectedStageFilter === 'New');

    return matchesSearch && matchesStage;
  });

  const handleMoveCandidate = async (candidateId: string, newStage: string) => {
    const success = await moveCandidate(candidateId, newStage);
    if (success) {
      addToast(`Candidate moved to ${newStage}`, 'success');
    } else {
      addToast('Failed to move candidate', 'error');
    }
    return success;
  };

  const handleAddCandidate = async (candidate: Parameters<typeof addCandidateToPipeline>[0]) => {
    const result = await addCandidateToPipeline(candidate);
    if (result) {
      addToast(`${candidate.name} added to pipeline`, 'success');
    } else {
      addToast('Failed to add candidate', 'error');
    }
  };

  const handleAddStage = async (name: string, color: string) => {
    const result = await addStage(name, color);
    if (result) {
      addToast(`Stage "${name}" created`, 'success');
      setShowAddStageModal(false);
    } else {
      addToast('Failed to create stage', 'error');
    }
  };

  const handleRefresh = () => {
    fetchStages();
    fetchCandidates();
    addToast('Pipeline refreshed', 'success');
  };

  const handleCandidateClick = (candidate: PipelineCandidate) => {
    // Navigate to candidate detail or open modal
    // For now, just show a toast
    addToast(`Viewing ${candidate.name}`, 'info');
  };

  // Show loading state
  if (authLoading || (isLoading && stages.length === 0)) {
    return (
      <AppLayout>
        <div className="space-y-4">
          <div className="h-10 bg-[var(--bg-surface)] rounded animate-pulse" />
          <div className="flex gap-4 overflow-hidden">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="w-72 h-96 bg-[var(--bg-surface)] rounded-lg animate-pulse flex-shrink-0" />
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  // Show sign-in prompt for unauthenticated users
  if (!isAuthenticated) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-16 h-16 rounded-full bg-[var(--primary-light)] flex items-center justify-center mb-4">
            <Kanban className="w-8 h-8 text-[var(--primary)]" />
          </div>
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
            Candidate Pipeline
          </h2>
          <p className="text-sm text-[var(--text-secondary)] text-center max-w-md mb-6">
            Track candidates through your hiring process with a visual Kanban board.
            Sign in to get started.
          </p>
          <Link href="/login" className="btn btn-primary">
            Sign in to continue
          </Link>
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
            <h1 className="text-xl font-semibold text-[var(--text-primary)] tracking-tight">
              Pipeline
            </h1>
            <p className="text-sm text-[var(--text-secondary)] mt-0.5">
              Track candidates through your hiring process
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* View Toggle */}
            <div className="flex items-center bg-[var(--bg-surface)] rounded-lg p-0.5 border border-[var(--border-light)]">
              <button
                onClick={() => setViewMode('board')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  viewMode === 'board'
                    ? 'bg-[var(--bg-elevated)] text-[var(--text-primary)] shadow-sm'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Kanban className="w-3.5 h-3.5" />
                Board
              </button>
              <button
                onClick={() => setViewMode('stats')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  viewMode === 'stats'
                    ? 'bg-[var(--bg-elevated)] text-[var(--text-primary)] shadow-sm'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                Stats
              </button>
            </div>

            <button
              onClick={handleRefresh}
              className="btn btn-secondary"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="btn btn-primary"
            >
              <Plus className="w-4 h-4" />
              Add Candidate
            </button>
          </div>
        </div>

        {/* Filters (Board view only) */}
        {viewMode === 'board' && (
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search candidates..."
                className="w-full pl-9 pr-8 py-2 bg-[var(--bg-surface)] border border-[var(--border-light)] rounded-lg text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Stage Filter */}
            <div className="relative">
              <select
                value={selectedStageFilter}
                onChange={(e) => setSelectedStageFilter(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 bg-[var(--bg-surface)] border border-[var(--border-light)] rounded-lg text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50"
              >
                <option value="all">All Stages</option>
                {stages.map(stage => (
                  <option key={stage.id} value={stage.name}>{stage.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] pointer-events-none" />
            </div>

            {/* Candidate Count */}
            <div className="flex items-center gap-1.5 text-sm text-[var(--text-muted)]">
              <Users className="w-4 h-4" />
              <span>{filteredCandidates.length} candidates</span>
            </div>
          </div>
        )}

        {/* Content */}
        {viewMode === 'board' ? (
          candidates.length === 0 && !isLoadingCandidates ? (
            <div className="bg-[var(--bg-elevated)] rounded-lg border border-[var(--border-light)] py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-[var(--primary-light)] flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-[var(--primary)]" />
              </div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                Start Building Your Pipeline
              </h3>
              <p className="text-sm text-[var(--text-secondary)] max-w-md mx-auto mb-6">
                Add candidates manually or import them from your searches to start tracking them through your hiring process.
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setShowAddModal(true)}
                  className="btn btn-primary"
                >
                  <Plus className="w-4 h-4" />
                  Add Candidate
                </button>
                <Link href="/search" className="btn btn-secondary">
                  <Search className="w-4 h-4" />
                  Find Candidates
                </Link>
              </div>
            </div>
          ) : (
            <KanbanBoard
              stages={stages}
              candidates={filteredCandidates}
              onMoveCandidate={handleMoveCandidate}
              onAddStage={() => setShowAddStageModal(true)}
              onCandidateClick={handleCandidateClick}
              isLoading={isLoading || isLoadingCandidates}
            />
          )
        ) : (
          <PipelineStats stages={stages} candidates={candidates} />
        )}
      </div>

      {/* Add Candidate Modal */}
      <AddCandidateModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddCandidate}
        stages={stages}
      />

      {/* Add Stage Modal */}
      {showAddStageModal && (
        <AddStageModal
          isOpen={showAddStageModal}
          onClose={() => setShowAddStageModal(false)}
          onAdd={handleAddStage}
        />
      )}
    </AppLayout>
  );
}

// Simple Add Stage Modal
function AddStageModal({
  isOpen,
  onClose,
  onAdd,
}: {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string, color: string) => void;
}) {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#6366f1');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const colors = [
    '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e',
    '#f97316', '#eab308', '#22c55e', '#14b8a6',
    '#0ea5e9', '#6b7280',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSubmitting(true);
    await onAdd(name.trim(), color);
    setIsSubmitting(false);
    setName('');
    setColor('#6366f1');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-[var(--bg-elevated)] rounded-xl shadow-xl w-full max-w-sm mx-4">
        <div className="flex items-center justify-between p-4 border-b border-[var(--border-light)]">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Add Stage</h2>
          <button
            onClick={onClose}
            className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
              Stage Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Phone Screen"
              className="w-full px-4 py-2 bg-[var(--bg-surface)] border border-[var(--border-light)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-2">
              Color
            </label>
            <div className="flex flex-wrap gap-2">
              {colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-lg transition-transform ${
                    color === c ? 'ring-2 ring-offset-2 ring-[var(--primary)] scale-110' : ''
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn btn-secondary justify-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="flex-1 btn btn-primary justify-center"
            >
              {isSubmitting ? 'Creating...' : 'Create Stage'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
