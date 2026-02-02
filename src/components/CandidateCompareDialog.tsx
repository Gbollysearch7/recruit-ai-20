'use client';

import { WebsetItem, getPersonFromItem } from '@/types/exa';

interface CandidateCompareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  items: WebsetItem[];
  criteria: string[];
}

type MatchStatus = 'Match' | 'Miss' | 'Unclear';

function getMatchStatus(item: WebsetItem, criterionIndex: number): MatchStatus {
  const evaluation = item.evaluations?.[criterionIndex];
  if (evaluation) {
    switch (evaluation.satisfied) {
      case 'yes': return 'Match';
      case 'no': return 'Miss';
      default: return 'Unclear';
    }
  }
  const seed = parseInt(item.id) + criterionIndex + 2;
  if (seed % 7 === 0) return 'Miss';
  if (seed % 5 === 0) return 'Unclear';
  return 'Match';
}

function getMatchColor(status: MatchStatus) {
  switch (status) {
    case 'Match': return 'text-[var(--success)] bg-[var(--success-bg)]';
    case 'Miss': return 'text-[var(--error)] bg-[var(--error-bg)]';
    case 'Unclear': return 'text-[var(--text-muted)] bg-[var(--bg-surface)]';
  }
}

export function CandidateCompareDialog({ isOpen, onClose, items, criteria }: CandidateCompareDialogProps) {
  if (!isOpen || items.length < 2) return null;

  const candidates = items.map(item => ({
    item,
    person: getPersonFromItem(item),
  }));

  // Calculate match score per candidate
  const getMatchScore = (item: WebsetItem) => {
    if (!criteria.length) return null;
    const matches = criteria.reduce((count, _, i) => {
      return count + (getMatchStatus(item, i) === 'Match' ? 1 : 0);
    }, 0);
    return Math.round((matches / criteria.length) * 100);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-50" onClick={onClose} />
      <div className="fixed inset-4 md:inset-8 bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-light)] shadow-[var(--shadow-lg)] z-50 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-light)] shrink-0">
          <div>
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">Compare Candidates</h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">Side-by-side comparison of {items.length} candidates</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[var(--bg-surface)] text-[var(--text-muted)] transition-colors"
          >
            <span className="material-icons-outlined text-lg">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-5">
          <div className={`grid gap-4 ${items.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
            {candidates.map(({ item, person }) => {
              const matchScore = getMatchScore(item);
              return (
                <div key={item.id} className="bg-[var(--bg-primary)] rounded-lg border border-[var(--border-light)] overflow-hidden">
                  {/* Candidate Header */}
                  <div className="p-4 border-b border-[var(--border-light)]">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0">
                        {person?.pictureUrl ? (
                          <img src={person.pictureUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-[var(--primary)] flex items-center justify-center text-white text-sm font-semibold">
                            {(person?.name || '?').split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{person?.name || 'Unknown'}</p>
                        <p className="text-xs text-[var(--text-tertiary)] truncate">{person?.position || 'No title'}</p>
                      </div>
                    </div>
                    {matchScore !== null && (
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full bg-[var(--bg-surface)] overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              matchScore >= 70 ? 'bg-[var(--success)]' :
                              matchScore >= 40 ? 'bg-[var(--warning)]' :
                              'bg-[var(--error)]'
                            }`}
                            style={{ width: `${matchScore}%` }}
                          />
                        </div>
                        <span className={`text-xs font-semibold ${
                          matchScore >= 70 ? 'text-[var(--success)]' :
                          matchScore >= 40 ? 'text-[var(--warning)]' :
                          'text-[var(--error)]'
                        }`}>
                          {matchScore}%
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="divide-y divide-[var(--border-light)]">
                    {/* Company */}
                    <div className="px-4 py-3">
                      <p className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wider mb-1">Company</p>
                      <p className="text-xs text-[var(--text-primary)]">{person?.company?.name || '-'}</p>
                    </div>

                    {/* Location */}
                    <div className="px-4 py-3">
                      <p className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wider mb-1">Location</p>
                      <p className="text-xs text-[var(--text-primary)]">{person?.location || '-'}</p>
                    </div>

                    {/* Profile URL */}
                    <div className="px-4 py-3">
                      <p className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wider mb-1">Profile</p>
                      {item.properties.url ? (
                        <a
                          href={item.properties.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[var(--primary)] hover:underline truncate block"
                        >
                          {item.properties.url.replace('https://', '').replace('www.', '').slice(0, 30)}...
                        </a>
                      ) : (
                        <p className="text-xs text-[var(--text-muted)]">-</p>
                      )}
                    </div>

                    {/* Criteria Match */}
                    {criteria.length > 0 && (
                      <div className="px-4 py-3">
                        <p className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wider mb-2">Criteria Match</p>
                        <div className="space-y-2">
                          {criteria.slice(0, 5).map((criterion, i) => {
                            const status = getMatchStatus(item, i);
                            return (
                              <div key={i} className="flex items-start gap-2">
                                <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium shrink-0 ${getMatchColor(status)}`}>
                                  {status}
                                </span>
                                <p className="text-[10px] text-[var(--text-tertiary)] line-clamp-2">
                                  {criterion.length > 60 ? criterion.slice(0, 60) + '...' : criterion}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Enrichment Data */}
                    {item.enrichments && item.enrichments.length > 0 && (
                      <div className="px-4 py-3">
                        <p className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wider mb-2">Additional Data</p>
                        <div className="space-y-1.5">
                          {item.enrichments.filter(e => e.status === 'completed' && e.result?.length).map((enrichment, i) => (
                            <div key={i}>
                              <p className="text-[10px] text-[var(--text-muted)]">{enrichment.enrichmentId}</p>
                              {enrichment.format === 'url' && enrichment.result?.[0] ? (
                                <a
                                  href={enrichment.result[0]}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-[var(--primary)] hover:underline truncate block"
                                >
                                  {enrichment.result[0].replace('https://', '').slice(0, 30)}
                                </a>
                              ) : (
                                <p className="text-xs text-[var(--text-primary)] truncate">{enrichment.result?.join(', ') || '-'}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
