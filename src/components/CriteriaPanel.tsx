'use client';

import { useState } from 'react';

interface CriteriaPanelProps {
  criteria: string[];
  onCriteriaChange: (criteria: string[]) => void;
  enrichments: string[];
  onEnrichmentsChange: (enrichments: string[]) => void;
  itemCount?: number;
  matchCount?: number;
}

const availableEnrichments = [
  'Email',
  'Interests',
  'Seniority',
  'Skills',
];

// Criteria colors matching the design
const criteriaColors = ['bg-purple-500', 'bg-orange-500', 'bg-blue-500', 'bg-slate-300', 'bg-slate-300'];

export function CriteriaPanel({
  criteria,
  onCriteriaChange,
  enrichments,
  onEnrichmentsChange,
  itemCount = 0,
  matchCount = 0,
}: CriteriaPanelProps) {
  const [activeTab, setActiveTab] = useState<'criteria' | 'details'>('criteria');

  const removeCriterion = (index: number) => {
    onCriteriaChange(criteria.filter((_, i) => i !== index));
  };

  const toggleEnrichment = (enrichment: string) => {
    if (enrichments.includes(enrichment)) {
      onEnrichmentsChange(enrichments.filter(e => e !== enrichment));
    } else {
      onEnrichmentsChange([...enrichments, enrichment]);
    }
  };

  return (
    <aside className="w-80 border-l border-[var(--border-light)] flex flex-col bg-[var(--bg-surface)] bg-opacity-30 shrink-0">
      {/* Tabs */}
      <div className="h-10 border-b border-[var(--border-light)] flex items-center gap-2 px-3">
        <button
          onClick={() => setActiveTab('criteria')}
          className={`text-xs font-semibold py-2 px-1 border-b-2 transition-colors ${
            activeTab === 'criteria'
              ? 'border-[var(--primary)] text-[var(--text-primary)]'
              : 'border-transparent text-[var(--text-muted)]'
          }`}
        >
          Criteria
        </button>
        <button
          onClick={() => setActiveTab('details')}
          className={`text-xs font-semibold py-2 px-1 border-b-2 transition-colors ${
            activeTab === 'details'
              ? 'border-[var(--primary)] text-[var(--text-primary)]'
              : 'border-transparent text-[var(--text-muted)]'
          }`}
        >
          Details
        </button>
      </div>

      <div className="flex-1 overflow-y-auto sidebar-scroll p-4 space-y-6">
        {activeTab === 'criteria' && (
          <>
            {/* Criteria Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Criteria</span>
                <div className="flex items-center gap-1 bg-white dark:bg-slate-800 border border-[var(--border-light)] px-1.5 py-0.5 rounded text-[10px]">
                  <span className="material-icons-outlined text-[12px]">group</span>
                  People
                  <span className="material-icons-outlined text-[12px]">expand_more</span>
                </div>
              </div>

              {/* Search Query Box */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded border border-blue-100 dark:border-blue-800/50">
                <p className="text-[11px] leading-relaxed text-blue-800 dark:text-blue-300">
                  looking for <span className="font-bold underline">sales managers</span> in{' '}
                  <span className="font-bold underline">Taiwan</span> that are selling enterprise
                  solution such as Oracle netsuite. Ideally{' '}
                  <span className="font-bold underline">under 35 years old</span> or under 10 years
                  experience
                </p>
              </div>

              {/* Criteria List */}
              <ul className="space-y-2">
                {criteria.map((criterion, index) => (
                  <li
                    key={index}
                    className={`flex items-center gap-2 text-[11px] text-[var(--text-secondary)] ${
                      index >= 3 ? 'opacity-60' : ''
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-sm shrink-0 ${criteriaColors[index] || 'bg-slate-300'}`}
                    ></span>
                    <span className="flex-1">{criterion}</span>
                  </li>
                ))}
              </ul>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => {
                    const criterion = prompt('Enter new criterion:');
                    if (criterion) {
                      onCriteriaChange([...criteria, criterion]);
                    }
                  }}
                  className="text-[11px] text-[var(--text-muted)] flex items-center gap-1 hover:text-[var(--primary)] transition-colors"
                >
                  <span className="material-icons-outlined text-xs">add</span>
                  Add Criteria
                </button>
                <button className="text-[11px] text-[var(--text-muted)] flex items-center gap-1 hover:text-[var(--primary)] transition-colors">
                  <span className="material-icons-outlined text-xs">person_off</span>
                  Exclude People
                </button>
              </div>
            </div>

            {/* Enrichments Section */}
            <div className="pt-6 border-t border-[var(--border-light)] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">
                  Enrichments
                </span>
                <span className="text-[10px] text-[var(--text-muted)] flex items-center gap-1">
                  <span className="material-icons-outlined text-[12px]">settings</span>
                  2 / row
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {availableEnrichments.map((enrichment) => {
                  const isSelected = enrichments.includes(enrichment);
                  return (
                    <button
                      key={enrichment}
                      onClick={() => toggleEnrichment(enrichment)}
                      className={`border rounded p-2 text-xs flex items-center justify-center transition-colors ${
                        isSelected
                          ? 'bg-[var(--primary-light)] border-[var(--primary)] text-[var(--primary)]'
                          : 'bg-white dark:bg-slate-800 border-[var(--border-light)] hover:bg-[var(--bg-surface)]'
                      }`}
                    >
                      {enrichment}
                    </button>
                  );
                })}
              </div>

              <button className="w-full bg-white dark:bg-slate-800 border border-[var(--border-light)] rounded p-2 text-xs text-center text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors">
                + Custom
              </button>
            </div>
          </>
        )}

        {activeTab === 'details' && (
          <div className="text-[11px] text-[var(--text-muted)]">
            <p>Select a row to see details</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-[var(--border-light)] flex justify-end">
        <button className="text-[11px] text-[var(--text-muted)] flex items-center gap-1 hover:text-[var(--primary)] transition-colors">
          Find more results
          <span className="material-icons-outlined text-xs">trending_flat</span>
        </button>
      </div>
    </aside>
  );
}
