'use client';

import { useState } from 'react';
import {
  Users,
  Building2,
  ChevronDown,
  X,
  Ban,
  Plus,
  UserX,
  Settings,
  MapPin,
  Link as LinkIcon,
  ExternalLink,
  Copy,
  ArrowRight,
  User
} from 'lucide-react';

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
  searchQuery?: string;
  onSearch?: () => void;
}

const availableEnrichments = [
  'LinkedIn URL',
  'GitHub Profile',
  'Work Email',
  'Twitter/X',
  'Personal Website',
  'Phone Number',
  'Skills',
  'Interests',
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
  searchQuery,
  onSearch,
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
          className={`text-xs font-semibold py-2 px-1 border-b-2 transition-colors ${activeTab === 'criteria'
            ? 'border-[var(--primary)] text-[var(--text-primary)]'
            : 'border-transparent text-[var(--text-muted)]'
            }`}
        >
          Criteria
        </button>
        <button
          onClick={() => setActiveTab('details')}
          className={`text-xs font-semibold py-2 px-1 border-b-2 transition-colors ${activeTab === 'details'
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
                    {entityType === 'people' ? <Users className="w-3 h-3" /> : <Building2 className="w-3 h-3" />}
                    {entityType === 'people' ? 'People' : 'Companies'}
                    <ChevronDown className="w-3 h-3" />
                  </button>
                  {showEntityDropdown && (
                    <div className="absolute right-0 mt-1 bg-white dark:bg-slate-800 border border-[var(--border-light)] rounded shadow-lg z-10 w-24">
                      <button
                        onClick={() => { setEntityType('people'); setShowEntityDropdown(false); }}
                        className={`w-full px-3 py-1.5 text-[10px] text-left hover:bg-[var(--bg-surface)] flex items-center gap-2 ${entityType === 'people' ? 'text-[var(--primary)]' : ''}`}
                      >
                        <Users className="w-3 h-3" />
                        People
                      </button>
                      <button
                        onClick={() => { setEntityType('companies'); setShowEntityDropdown(false); }}
                        className={`w-full px-3 py-1.5 text-[10px] text-left hover:bg-[var(--bg-surface)] flex items-center gap-2 ${entityType === 'companies' ? 'text-[var(--primary)]' : ''}`}
                      >
                        <Building2 className="w-3 h-3" />
                        Companies
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Search Query Box */}
              {searchQuery && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded border border-blue-100 dark:border-blue-800/50">
                  <p className="text-[11px] leading-relaxed text-blue-800 dark:text-blue-300">
                    <span className="font-semibold block mb-1 text-[var(--primary)] uppercase text-[9px]">Query</span>
                    "{searchQuery}"
                  </p>
                </div>
              )}

              {/* Criteria List */}
              <ul className="space-y-2">
                {criteria.map((criterion, index) => (
                  <li
                    key={index}
                    className={`flex items-center gap-2 text-[11px] text-[var(--text-secondary)] group ${index >= 3 ? 'opacity-60' : ''
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
                      <X className="w-3 h-3" />
                    </button>
                  </li>
                ))}
              </ul>

              {/* Excluded People - Same as before */}
              {excludedPeople.length > 0 && (
                <div className="pt-2 border-t border-[var(--border-light)]">
                  <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Exclusions</span>
                  <ul className="mt-2 space-y-1">
                    {excludedPeople.map((pattern, index) => (
                      <li key={index} className="flex items-center gap-2 text-[11px] text-[var(--error)] group">
                        <Ban className="w-3 h-3" />
                        <span className="flex-1">{pattern}</span>
                        <button
                          onClick={() => setExcludedPeople(excludedPeople.filter((_, i) => i !== index))}
                          className="opacity-0 group-hover:opacity-100"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Add Criteria Input - Same as before */}
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

              {/* Exclude Input - Same as before */}
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

              {/* ... Actions ... */}
              {!showAddCriteriaInput && !showExcludeInput && (
                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() => setShowAddCriteriaInput(true)}
                    className="text-[11px] text-[var(--text-muted)] flex items-center gap-1 hover:text-[var(--primary)] transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    Add Criteria
                  </button>
                  <button
                    onClick={() => setShowExcludeInput(true)}
                    className="text-[11px] text-[var(--text-muted)] flex items-center gap-1 hover:text-[var(--primary)] transition-colors"
                  >
                    <UserX className="w-3 h-3" />
                    Exclude People
                  </button>
                </div>
              )}
            </div>

            {/* Enrichments Section - Same as before */}
            <div className="pt-6 border-t border-[var(--border-light)] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">
                  Enrichments
                </span>
                <span className="text-[10px] text-[var(--text-muted)] flex items-center gap-1">
                  <Settings className="w-3 h-3" />
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
                      className={`border rounded p-2 text-xs flex items-center justify-center transition-colors ${isSelected
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

        {/* Details Tab - Same as before */}
        {activeTab === 'details' && (
          <div className="space-y-4">
            {/* ... details ... */}
            {selectedPerson ? (
              <>
                {/* ... (keep existing detail view) ... */}
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
                {/* ... (rest of details) ... */}
                <div className="space-y-2">
                  {selectedPerson.company && (
                    <div className="flex items-center gap-2 text-[11px]">
                      <Building2 className="w-3 h-3 text-[var(--text-muted)]" />
                      <span className="text-[var(--text-secondary)]">{selectedPerson.company}</span>
                    </div>
                  )}
                  {selectedPerson.location && (
                    <div className="flex items-center gap-2 text-[11px]">
                      <MapPin className="w-3 h-3 text-[var(--text-muted)]" />
                      <span className="text-[var(--text-secondary)]">{selectedPerson.location}</span>
                    </div>
                  )}
                  {selectedPerson.url && (
                    <div className="flex items-center gap-2 text-[11px]">
                      <LinkIcon className="w-3 h-3 text-[var(--text-muted)]" />
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
                      <ExternalLink className="w-3 h-3" />
                      View Profile
                    </button>
                    <button
                      onClick={() => {
                        const text = `${selectedPerson.name}\n${selectedPerson.position || ''}\n${selectedPerson.company || ''}\n${selectedPerson.url || ''}`;
                        navigator.clipboard.writeText(text);
                      }}
                      className="flex-1 px-2 py-1.5 text-[10px] border border-[var(--border-light)] rounded hover:bg-[var(--bg-surface)] flex items-center justify-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      Copy
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <div className="w-14 h-14 rounded-full bg-[var(--bg-surface)] flex items-center justify-center mx-auto mb-3">
                  <User className="w-7 h-7 text-[var(--text-muted)]" />
                </div>
                <p className="text-sm font-medium text-[var(--text-secondary)] mb-1">No candidate selected</p>
                <p className="text-xs text-[var(--text-muted)] max-w-[180px] mx-auto">
                  Click on a candidate row in the table to view their details here
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-[var(--border-light)] flex justify-end">
        <button
          onClick={onSearch}
          disabled={!onSearch}
          className="text-[11px] text-[var(--text-muted)] flex items-center gap-1 hover:text-[var(--primary)] transition-colors disabled:opacity-50"
        >
          Find more results
          <ArrowRight className="w-3 h-3" />
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
