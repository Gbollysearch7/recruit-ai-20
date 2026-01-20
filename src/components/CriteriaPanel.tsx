'use client';

import { useState } from 'react';

interface CriteriaPanelProps {
  criteria: string[];
  onCriteriaChange: (criteria: string[]) => void;
  enrichments: string[];
  onEnrichmentsChange: (enrichments: string[]) => void;
  itemCount?: number;
  matchCount?: number;
  selectedPerson?: {
    name: string;
    position?: string;
    company?: string;
    location?: string;
    url?: string;
  } | null;
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
  selectedPerson = null,
}: CriteriaPanelProps) {
  const [activeTab, setActiveTab] = useState<'criteria' | 'details'>('criteria');
  const [showAddCriteriaInput, setShowAddCriteriaInput] = useState(false);
  const [newCriterion, setNewCriterion] = useState('');
  const [excludedPeople, setExcludedPeople] = useState<string[]>([]);
  const [showExcludeInput, setShowExcludeInput] = useState(false);
  const [excludePattern, setExcludePattern] = useState('');
  const [entityType, setEntityType] = useState<'people' | 'companies'>('people');
  const [showEntityDropdown, setShowEntityDropdown] = useState(false);

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

  const handleAddCriterion = () => {
    if (newCriterion.trim()) {
      onCriteriaChange([...criteria, newCriterion.trim()]);
      setNewCriterion('');
      setShowAddCriteriaInput(false);
    }
  };

  const handleAddExclusion = () => {
    if (excludePattern.trim()) {
      setExcludedPeople([...excludedPeople, excludePattern.trim()]);
      setExcludePattern('');
      setShowExcludeInput(false);
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
                <div className="relative">
                  <button
                    onClick={() => setShowEntityDropdown(!showEntityDropdown)}
                    className="flex items-center gap-1 bg-white dark:bg-slate-800 border border-[var(--border-light)] px-1.5 py-0.5 rounded text-[10px] hover:bg-[var(--bg-surface)]"
                  >
                    <span className="material-icons-outlined text-[12px]">
                      {entityType === 'people' ? 'group' : 'business'}
                    </span>
                    {entityType === 'people' ? 'People' : 'Companies'}
                    <span className="material-icons-outlined text-[12px]">expand_more</span>
                  </button>
                  {showEntityDropdown && (
                    <div className="absolute right-0 mt-1 bg-white dark:bg-slate-800 border border-[var(--border-light)] rounded shadow-lg z-10">
                      <button
                        onClick={() => { setEntityType('people'); setShowEntityDropdown(false); }}
                        className={`w-full px-3 py-1.5 text-[10px] text-left hover:bg-[var(--bg-surface)] flex items-center gap-2 ${entityType === 'people' ? 'text-[var(--primary)]' : ''}`}
                      >
                        <span className="material-icons-outlined text-[12px]">group</span>
                        People
                      </button>
                      <button
                        onClick={() => { setEntityType('companies'); setShowEntityDropdown(false); }}
                        className={`w-full px-3 py-1.5 text-[10px] text-left hover:bg-[var(--bg-surface)] flex items-center gap-2 ${entityType === 'companies' ? 'text-[var(--primary)]' : ''}`}
                      >
                        <span className="material-icons-outlined text-[12px]">business</span>
                        Companies
                      </button>
                    </div>
                  )}
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
                    className={`flex items-center gap-2 text-[11px] text-[var(--text-secondary)] group ${
                      index >= 3 ? 'opacity-60' : ''
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-sm shrink-0 ${criteriaColors[index] || 'bg-slate-300'}`}
                    ></span>
                    <span className="flex-1">{criterion}</span>
                    <button
                      onClick={() => removeCriterion(index)}
                      className="opacity-0 group-hover:opacity-100 text-[var(--text-muted)] hover:text-[var(--error)] transition-all"
                    >
                      <span className="material-icons-outlined text-xs">close</span>
                    </button>
                  </li>
                ))}
              </ul>

              {/* Excluded People */}
              {excludedPeople.length > 0 && (
                <div className="pt-2 border-t border-[var(--border-light)]">
                  <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Exclusions</span>
                  <ul className="mt-2 space-y-1">
                    {excludedPeople.map((pattern, index) => (
                      <li key={index} className="flex items-center gap-2 text-[11px] text-[var(--error)] group">
                        <span className="material-icons-outlined text-xs">block</span>
                        <span className="flex-1">{pattern}</span>
                        <button
                          onClick={() => setExcludedPeople(excludedPeople.filter((_, i) => i !== index))}
                          className="opacity-0 group-hover:opacity-100"
                        >
                          <span className="material-icons-outlined text-xs">close</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Add Criteria Input */}
              {showAddCriteriaInput && (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={newCriterion}
                    onChange={(e) => setNewCriterion(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddCriterion();
                      if (e.key === 'Escape') setShowAddCriteriaInput(false);
                    }}
                    placeholder="e.g., must have 5+ years experience"
                    className="w-full px-2 py-1.5 text-[11px] border border-[var(--border-light)] rounded bg-white dark:bg-slate-800"
                    autoFocus
                  />
                  <div className="flex gap-1">
                    <button
                      onClick={handleAddCriterion}
                      className="flex-1 px-2 py-1 text-[10px] bg-[var(--primary)] text-white rounded"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => setShowAddCriteriaInput(false)}
                      className="flex-1 px-2 py-1 text-[10px] border border-[var(--border-light)] rounded"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Exclude Input */}
              {showExcludeInput && (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={excludePattern}
                    onChange={(e) => setExcludePattern(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddExclusion();
                      if (e.key === 'Escape') setShowExcludeInput(false);
                    }}
                    placeholder="e.g., exclude recruiters, exclude @company.com"
                    className="w-full px-2 py-1.5 text-[11px] border border-[var(--border-light)] rounded bg-white dark:bg-slate-800"
                    autoFocus
                  />
                  <div className="flex gap-1">
                    <button
                      onClick={handleAddExclusion}
                      className="flex-1 px-2 py-1 text-[10px] bg-[var(--error)] text-white rounded"
                    >
                      Exclude
                    </button>
                    <button
                      onClick={() => setShowExcludeInput(false)}
                      className="flex-1 px-2 py-1 text-[10px] border border-[var(--border-light)] rounded"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Actions */}
              {!showAddCriteriaInput && !showExcludeInput && (
                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() => setShowAddCriteriaInput(true)}
                    className="text-[11px] text-[var(--text-muted)] flex items-center gap-1 hover:text-[var(--primary)] transition-colors"
                  >
                    <span className="material-icons-outlined text-xs">add</span>
                    Add Criteria
                  </button>
                  <button
                    onClick={() => setShowExcludeInput(true)}
                    className="text-[11px] text-[var(--text-muted)] flex items-center gap-1 hover:text-[var(--primary)] transition-colors"
                  >
                    <span className="material-icons-outlined text-xs">person_off</span>
                    Exclude People
                  </button>
                </div>
              )}
            </div>

            {/* Enrichments Section */}
            <div className="pt-6 border-t border-[var(--border-light)] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">
                  Enrichments
                </span>
                <span className="text-[10px] text-[var(--text-muted)] flex items-center gap-1">
                  <span className="material-icons-outlined text-[12px]">settings</span>
                  {enrichments.length} / row
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {availableEnrichments.map((enrichment) => {
                  const isSelected = enrichments.includes(enrichment.toLowerCase());
                  return (
                    <button
                      key={enrichment}
                      onClick={() => toggleEnrichment(enrichment.toLowerCase())}
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

              <CustomEnrichmentButton onAdd={(name) => {
                if (!enrichments.includes(name.toLowerCase())) {
                  onEnrichmentsChange([...enrichments, name.toLowerCase()]);
                }
              }} />
            </div>
          </>
        )}

        {activeTab === 'details' && (
          <div className="space-y-4">
            {selectedPerson ? (
              <>
                <div className="flex items-center gap-3">
                  <img
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedPerson.name}`}
                    alt={selectedPerson.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <h4 className="text-sm font-semibold text-[var(--text-primary)]">{selectedPerson.name}</h4>
                    <p className="text-[11px] text-[var(--text-muted)]">{selectedPerson.position}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  {selectedPerson.company && (
                    <div className="flex items-center gap-2 text-[11px]">
                      <span className="material-icons-outlined text-xs text-[var(--text-muted)]">business</span>
                      <span className="text-[var(--text-secondary)]">{selectedPerson.company}</span>
                    </div>
                  )}
                  {selectedPerson.location && (
                    <div className="flex items-center gap-2 text-[11px]">
                      <span className="material-icons-outlined text-xs text-[var(--text-muted)]">location_on</span>
                      <span className="text-[var(--text-secondary)]">{selectedPerson.location}</span>
                    </div>
                  )}
                  {selectedPerson.url && (
                    <div className="flex items-center gap-2 text-[11px]">
                      <span className="material-icons-outlined text-xs text-[var(--text-muted)]">link</span>
                      <a
                        href={selectedPerson.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[var(--primary)] hover:underline truncate"
                      >
                        {selectedPerson.url}
                      </a>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-[var(--border-light)]">
                  <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Actions</span>
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={() => selectedPerson.url && window.open(selectedPerson.url, '_blank')}
                      className="flex-1 px-2 py-1.5 text-[10px] border border-[var(--border-light)] rounded hover:bg-[var(--bg-surface)] flex items-center justify-center gap-1"
                    >
                      <span className="material-icons-outlined text-xs">open_in_new</span>
                      View Profile
                    </button>
                    <button
                      onClick={() => {
                        const text = `${selectedPerson.name}\n${selectedPerson.position || ''}\n${selectedPerson.company || ''}\n${selectedPerson.url || ''}`;
                        navigator.clipboard.writeText(text);
                      }}
                      className="flex-1 px-2 py-1.5 text-[10px] border border-[var(--border-light)] rounded hover:bg-[var(--bg-surface)] flex items-center justify-center gap-1"
                    >
                      <span className="material-icons-outlined text-xs">content_copy</span>
                      Copy
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <span className="material-icons-outlined text-3xl text-[var(--text-muted)] mb-2">person_search</span>
                <p className="text-[11px] text-[var(--text-muted)]">Select a row to see details</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-[var(--border-light)] flex justify-end">
        <button
          onClick={() => {
            // Trigger a search for more results
            alert('Searching for more results...');
          }}
          className="text-[11px] text-[var(--text-muted)] flex items-center gap-1 hover:text-[var(--primary)] transition-colors"
        >
          Find more results
          <span className="material-icons-outlined text-xs">trending_flat</span>
        </button>
      </div>
    </aside>
  );
}

// Custom Enrichment Button Component
function CustomEnrichmentButton({ onAdd }: { onAdd: (name: string) => void }) {
  const [showInput, setShowInput] = useState(false);
  const [customName, setCustomName] = useState('');

  const handleAdd = () => {
    if (customName.trim()) {
      onAdd(customName.trim());
      setCustomName('');
      setShowInput(false);
    }
  };

  if (showInput) {
    return (
      <div className="space-y-2">
        <input
          type="text"
          value={customName}
          onChange={(e) => setCustomName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleAdd();
            if (e.key === 'Escape') setShowInput(false);
          }}
          placeholder="e.g., Phone Number, GitHub"
          className="w-full px-2 py-1.5 text-[11px] border border-[var(--border-light)] rounded bg-white dark:bg-slate-800"
          autoFocus
        />
        <div className="flex gap-1">
          <button
            onClick={handleAdd}
            className="flex-1 px-2 py-1 text-[10px] bg-[var(--primary)] text-white rounded"
          >
            Add
          </button>
          <button
            onClick={() => setShowInput(false)}
            className="flex-1 px-2 py-1 text-[10px] border border-[var(--border-light)] rounded"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowInput(true)}
      className="w-full bg-white dark:bg-slate-800 border border-[var(--border-light)] rounded p-2 text-xs text-center text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors"
    >
      + Custom
    </button>
  );
}
