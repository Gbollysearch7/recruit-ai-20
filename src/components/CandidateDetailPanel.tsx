'use client';

import { useState, useEffect } from 'react';
import { useCandidates } from '@/lib/hooks/useCandidates';
import { useToast } from '@/components/Toast';
import { ActivityFeed } from '@/components/ActivityFeed';
import { Candidate, CandidateComment } from '@/lib/supabase';
import { WebsetItem, getPersonFromItem, getEnrichmentResult } from '@/types/exa';
import Link from 'next/link';

interface CandidateDetailPanelProps {
  // Either pass a saved candidate ID or a webset item
  candidateId?: string;
  websetItem?: WebsetItem;
  onClose?: () => void;
  isPanel?: boolean; // If true, shows as slide-out panel; if false, shows as full page content
}

export function CandidateDetailPanel({ candidateId, websetItem, onClose, isPanel = true }: CandidateDetailPanelProps) {
  const { getCandidate, getCandidateComments, addCandidateComment, saveCandidate, updateCandidateStage } = useCandidates();
  const { addToast } = useToast();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [comments, setComments] = useState<CandidateComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'notes' | 'activity'>('overview');

  // Load candidate data
  useEffect(() => {
    const loadCandidate = async () => {
      if (candidateId) {
        setIsLoading(true);
        const data = await getCandidate(candidateId);
        setCandidate(data);
        if (data) {
          const commentData = await getCandidateComments(candidateId);
          setComments(commentData);
        }
        setIsLoading(false);
      } else if (websetItem) {
        // Convert webset item to candidate-like structure
        const person = getPersonFromItem(websetItem);
        const mockCandidate: Candidate = {
          id: websetItem.id,
          user_id: null,
          name: person?.name || 'Unknown',
          email: getEnrichmentResult(websetItem, 'Work Email') || getEnrichmentResult(websetItem, 'Email') || null,
          title: person?.position || null,
          company: person?.company?.name || null,
          location: person?.location || null,
          linkedin: getEnrichmentResult(websetItem, 'LinkedIn URL') || getEnrichmentResult(websetItem, 'LinkedIn') || null,
          github: getEnrichmentResult(websetItem, 'GitHub') || getEnrichmentResult(websetItem, 'GitHub Profile URL') || null,
          avatar: person?.pictureUrl || null,
          summary: websetItem.properties?.description || null,
          skills: null,
          match_score: calculateMatchScore(websetItem),
          source: 'exa_search',
          stage: 'new',
          tags: null,
          created_at: websetItem.createdAt || null,
          updated_at: websetItem.updatedAt || null,
          // Additional fields from Candidate type
          education: null,
          experience: null,
          notes: null,
          phone: null,
          website: null,
          raw_data: null,
          search_id: null,
          status: null,
          exa_item_id: websetItem.id,
        };
        setCandidate(mockCandidate);
        setIsLoading(false);
      }
    };

    loadCandidate();
  }, [candidateId, websetItem, getCandidate, getCandidateComments]);

  const handleAddComment = async () => {
    if (!newComment.trim() || !candidate) return;

    setIsAddingComment(true);
    const comment = await addCandidateComment(candidate.id, newComment.trim());
    if (comment) {
      setComments(prev => [comment, ...prev]);
      setNewComment('');
      addToast('Note added', 'success');
    } else {
      addToast('Failed to add note', 'error');
    }
    setIsAddingComment(false);
  };

  const handleSaveCandidate = async () => {
    if (!websetItem || !candidate) return;

    const saved = await saveCandidate({
      name: candidate.name,
      email: candidate.email || undefined,
      title: candidate.title || undefined,
      company: candidate.company || undefined,
      location: candidate.location || undefined,
      linkedin: candidate.linkedin || undefined,
      github: candidate.github || undefined,
      avatar: candidate.avatar || undefined,
      summary: candidate.summary || undefined,
      skills: Array.isArray(candidate.skills) ? candidate.skills as string[] : [],
      matchScore: candidate.match_score || undefined,
      source: 'exa_search',
    });

    if (saved) {
      addToast('Candidate saved!', 'success');
      setCandidate(saved);
    } else {
      addToast('Failed to save candidate', 'error');
    }
  };

  const handleStageChange = async (stage: string) => {
    if (!candidateId || !candidate) return;

    const updated = await updateCandidateStage(candidateId, stage);
    if (updated) {
      setCandidate(updated);
      addToast(`Stage updated to ${stage}`, 'success');
    }
  };

  if (isLoading) {
    return (
      <div className={`${isPanel ? 'w-96 border-l border-[var(--border-light)]' : ''} bg-[var(--bg-elevated)] h-full animate-pulse`}>
        <div className="p-4 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 skeleton rounded-lg" />
            <div className="flex-1">
              <div className="w-32 h-5 skeleton rounded mb-2" />
              <div className="w-24 h-4 skeleton rounded" />
            </div>
          </div>
          <div className="w-full h-20 skeleton rounded" />
          <div className="w-full h-32 skeleton rounded" />
        </div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className={`${isPanel ? 'w-96 border-l border-[var(--border-light)]' : ''} bg-[var(--bg-elevated)] h-full flex items-center justify-center`}>
        <div className="text-center p-6">
          <span className="material-icons-outlined text-4xl text-[var(--text-muted)] mb-2 block">person_off</span>
          <p className="text-sm text-[var(--text-secondary)]">Candidate not found</p>
        </div>
      </div>
    );
  }

  const stages = ['new', 'contacted', 'screening', 'interview', 'offer', 'hired', 'rejected'];

  const content = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-[var(--border-light)] bg-[var(--bg-elevated)]">
        <div className="flex items-start gap-3">
          {candidate.avatar ? (
            <img src={candidate.avatar} alt={candidate.name} className="w-12 h-12 rounded-lg object-cover" />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-[var(--primary)] flex items-center justify-center text-white font-semibold">
              {candidate.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-semibold text-[var(--text-primary)] truncate">{candidate.name}</h2>
            <p className="text-xs text-[var(--text-secondary)] truncate">
              {candidate.title}{candidate.company ? ` at ${candidate.company}` : ''}
            </p>
            {candidate.location && (
              <p className="text-xs text-[var(--text-muted)] flex items-center gap-1 mt-1">
                <span className="material-icons-outlined text-xs">location_on</span>
                {candidate.location}
              </p>
            )}
          </div>
          {isPanel && onClose && (
            <button onClick={onClose} className="p-1 hover:bg-[var(--bg-surface)] rounded transition-colors">
              <span className="material-icons-outlined text-sm text-[var(--text-muted)]">close</span>
            </button>
          )}
        </div>

        {/* Match Score */}
        {candidate.match_score && (
          <div className="mt-3 flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-[var(--bg-surface)] rounded-full overflow-hidden">
              <div
                className="h-full bg-[var(--success)] rounded-full transition-all"
                style={{ width: `${candidate.match_score}%` }}
              />
            </div>
            <span className="text-xs font-medium text-[var(--success)]">{candidate.match_score}% match</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2 mt-3">
          {websetItem && !candidateId && (
            <button onClick={handleSaveCandidate} className="btn btn-primary text-xs flex-1">
              <span className="material-icons-outlined text-sm">bookmark_add</span>
              Save Candidate
            </button>
          )}
          {candidate.linkedin && (
            <a href={candidate.linkedin} target="_blank" rel="noopener noreferrer" className="btn btn-secondary text-xs">
              <span className="material-icons-outlined text-sm">link</span>
              LinkedIn
            </a>
          )}
          {candidate.email && (
            <a href={`mailto:${candidate.email}`} className="btn btn-secondary text-xs">
              <span className="material-icons-outlined text-sm">mail</span>
              Email
            </a>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[var(--border-light)] bg-[var(--bg-elevated)]">
        {(['overview', 'notes', 'activity'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 px-3 py-2 text-xs font-medium capitalize transition-colors ${
              activeTab === tab
                ? 'text-[var(--primary)] border-b-2 border-[var(--primary)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'overview' && (
          <div className="p-4 space-y-4">
            {/* Stage Selector (only for saved candidates) */}
            {candidateId && (
              <div>
                <label className="text-xs font-medium text-[var(--text-secondary)] block mb-2">Pipeline Stage</label>
                <div className="flex flex-wrap gap-1">
                  {stages.map(stage => (
                    <button
                      key={stage}
                      onClick={() => handleStageChange(stage)}
                      className={`px-2 py-1 text-[10px] font-medium rounded capitalize transition-colors ${
                        candidate.stage === stage
                          ? 'bg-[var(--primary)] text-white'
                          : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                      }`}
                    >
                      {stage}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Summary */}
            {candidate.summary && (
              <div>
                <h3 className="text-xs font-medium text-[var(--text-secondary)] mb-2">About</h3>
                <p className="text-sm text-[var(--text-primary)] leading-relaxed">{candidate.summary}</p>
              </div>
            )}

            {/* Contact Info */}
            <div>
              <h3 className="text-xs font-medium text-[var(--text-secondary)] mb-2">Contact</h3>
              <div className="space-y-2">
                {candidate.email && (
                  <a href={`mailto:${candidate.email}`} className="flex items-center gap-2 text-xs text-[var(--primary)] hover:underline">
                    <span className="material-icons-outlined text-sm">mail</span>
                    {candidate.email}
                  </a>
                )}
                {candidate.linkedin && (
                  <a href={candidate.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-[var(--primary)] hover:underline">
                    <span className="material-icons-outlined text-sm">link</span>
                    LinkedIn Profile
                  </a>
                )}
                {candidate.github && (
                  <a href={candidate.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-[var(--primary)] hover:underline">
                    <span className="material-icons-outlined text-sm">code</span>
                    GitHub Profile
                  </a>
                )}
              </div>
            </div>

            {/* Skills */}
            {Array.isArray(candidate.skills) && candidate.skills.length > 0 && (
              <div>
                <h3 className="text-xs font-medium text-[var(--text-secondary)] mb-2">Skills</h3>
                <div className="flex flex-wrap gap-1">
                  {(candidate.skills as string[]).map((skill, i) => (
                    <span key={i} className="px-2 py-0.5 bg-[var(--bg-surface)] text-[var(--text-secondary)] text-[10px] rounded">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {candidate.tags && candidate.tags.length > 0 && (
              <div>
                <h3 className="text-xs font-medium text-[var(--text-secondary)] mb-2">Tags</h3>
                <div className="flex flex-wrap gap-1">
                  {candidate.tags.map((tag, i) => (
                    <span key={i} className="px-2 py-0.5 bg-[var(--primary-light)] text-[var(--primary)] text-[10px] rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Webset Evaluations */}
            {websetItem?.evaluations && websetItem.evaluations.length > 0 && (
              <div>
                <h3 className="text-xs font-medium text-[var(--text-secondary)] mb-2">Criteria Match</h3>
                <div className="space-y-2">
                  {websetItem.evaluations.map((evaluation, i) => (
                    <div key={i} className="p-2 bg-[var(--bg-surface)] rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-[var(--text-primary)]">
                          {evaluation.criterion.length > 40
                            ? evaluation.criterion.slice(0, 40) + '...'
                            : evaluation.criterion}
                        </span>
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                          evaluation.satisfied === 'yes'
                            ? 'bg-[var(--success-bg)] text-[var(--success)]'
                            : evaluation.satisfied === 'no'
                            ? 'bg-[var(--error-bg)] text-[var(--error)]'
                            : 'bg-[var(--warning-bg)] text-[var(--warning)]'
                        }`}>
                          {evaluation.satisfied}
                        </span>
                      </div>
                      {evaluation.reasoning && (
                        <p className="text-[10px] text-[var(--text-muted)] mt-1">{evaluation.reasoning}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Webset Enrichments */}
            {websetItem?.enrichments && websetItem.enrichments.length > 0 && (
              <div>
                <h3 className="text-xs font-medium text-[var(--text-secondary)] mb-2">Additional Data</h3>
                <div className="space-y-1">
                  {websetItem.enrichments.map((enrichment, i) => (
                    enrichment.result && enrichment.result.length > 0 && (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <span className="text-[var(--text-muted)]">{enrichment.enrichmentId}</span>
                        <span className="text-[var(--text-primary)]">{enrichment.result[0]}</span>
                      </div>
                    )
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="p-4">
            {/* Add Note */}
            <div className="mb-4">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a note about this candidate..."
                className="w-full px-3 py-2 text-sm border border-[var(--border-light)] rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]"
                rows={3}
              />
              <button
                onClick={handleAddComment}
                disabled={!newComment.trim() || isAddingComment}
                className="btn btn-primary text-xs mt-2 disabled:opacity-50"
              >
                {isAddingComment ? 'Adding...' : 'Add Note'}
              </button>
            </div>

            {/* Notes List */}
            {comments.length > 0 ? (
              <div className="space-y-3">
                {comments.map(comment => (
                  <div key={comment.id} className="p-3 bg-[var(--bg-surface)] rounded-lg">
                    <p className="text-sm text-[var(--text-primary)]">{comment.content}</p>
                    <p className="text-[10px] text-[var(--text-muted)] mt-2">
                      {comment.created_at ? new Date(comment.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : 'Unknown date'}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <span className="material-icons-outlined text-3xl text-[var(--text-muted)] mb-2 block">notes</span>
                <p className="text-xs text-[var(--text-muted)]">No notes yet</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="p-4">
            {candidateId ? (
              <ActivityFeed candidateId={candidateId} limit={20} showHeader={false} />
            ) : (
              <div className="text-center py-8">
                <span className="material-icons-outlined text-3xl text-[var(--text-muted)] mb-2 block">history</span>
                <p className="text-xs text-[var(--text-muted)]">Save this candidate to track activity</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  if (isPanel) {
    return (
      <aside className="w-96 border-l border-[var(--border-light)] bg-[var(--bg-elevated)] flex flex-col h-full animate-slide-in-right">
        {content}
      </aside>
    );
  }

  return content;
}

// Helper function to calculate match score from webset item
function calculateMatchScore(item: WebsetItem): number {
  if (!item.evaluations || item.evaluations.length === 0) return 0;

  const satisfied = item.evaluations.filter(e => e.satisfied === 'yes').length;
  return Math.round((satisfied / item.evaluations.length) * 100);
}

// Add slide-in animation for panel
const slideInStyles = `
@keyframes slide-in-right {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.animate-slide-in-right {
  animation: slide-in-right 0.2s ease-out;
}
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = slideInStyles;
  document.head.appendChild(styleSheet);
}
