'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Loader2, Plus, X, ChevronDown, ChevronUp, Sparkles, Settings2, BookmarkPlus, FolderOpen } from 'lucide-react';
import { CreateEnrichmentParameters } from '@/types/exa';
import { TemplatePickerDialog, SaveTemplateDialog } from './TemplatePickerDialog';
import type { SearchTemplate } from '@/lib/supabase';

interface SearchFormProps {
  onSearch: (
    query: string,
    count: number,
    criteria: string[],
    enrichments: CreateEnrichmentParameters[]
  ) => void;
  isLoading: boolean;
  initialQuery?: string;
  showSaveTemplate?: boolean;
}

// Key for localStorage
const SEARCH_STATE_KEY = 'talist_search_form_state';

interface SavedSearchState {
  query: string;
  count: number;
  criteria: string[];
  showAdvanced: boolean;
  savedAt: number;
}

// Load saved state from localStorage
function loadSavedState(): SavedSearchState | null {
  if (typeof window === 'undefined') return null;
  try {
    const saved = localStorage.getItem(SEARCH_STATE_KEY);
    if (saved) {
      const state = JSON.parse(saved) as SavedSearchState;
      // Only restore if saved within the last hour
      if (Date.now() - state.savedAt < 60 * 60 * 1000) {
        return state;
      }
    }
  } catch {
    // Ignore parse errors
  }
  return null;
}

const defaultEnrichments: CreateEnrichmentParameters[] = [
  { description: 'LinkedIn URL', format: 'url' },
  { description: 'GitHub Profile URL', format: 'url' },
  { description: 'Work Email', format: 'text' },
];

// Parse number from query like "5 digital marketers" -> 5
function parseCountFromQuery(query: string): number | null {
  // Match patterns like "5 engineers", "10 marketers", "find 20 developers"
  const match = query.match(/\b(\d+)\s+(?:people|persons|candidates|engineers|developers|marketers|designers|managers|analysts|scientists|specialists|professionals|experts|consultants|recruiters|salespeople|writers|editors|accountants|lawyers|doctors|nurses|teachers|coaches|trainers|administrators|executives|directors|officers|leads|seniors|juniors|interns)/i);
  if (match) {
    const num = parseInt(match[1], 10);
    // Limit to reasonable range
    if (num >= 1 && num <= 100) {
      return num;
    }
  }
  return null;
}

export function SearchForm({ onSearch, isLoading, initialQuery = '', showSaveTemplate = false }: SearchFormProps) {
  // Initialize state from localStorage if available
  const savedState = typeof window !== 'undefined' ? loadSavedState() : null;

  const [query, setQuery] = useState(initialQuery || savedState?.query || '');
  const [count, setCount] = useState(savedState?.count || 20);
  const [countAutoSet, setCountAutoSet] = useState(false);
  const [criteria, setCriteria] = useState<string[]>(savedState?.criteria || []);
  const [newCriterion, setNewCriterion] = useState('');
  const [enrichments, setEnrichments] = useState<CreateEnrichmentParameters[]>(defaultEnrichments);
  const [showAdvanced, setShowAdvanced] = useState(savedState?.showAdvanced || false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showSaveTemplateDialog, setShowSaveTemplateDialog] = useState(false);

  const handleSelectTemplate = (template: SearchTemplate) => {
    setQuery(template.query || '');
    if (template.count) setCount(template.count);
    if (template.criteria && Array.isArray(template.criteria)) {
      setCriteria(template.criteria as string[]);
    }
    if (template.enrichments && Array.isArray(template.enrichments)) {
      setEnrichments(template.enrichments as unknown as CreateEnrichmentParameters[]);
    }
    setCountAutoSet(false);
  };

  // Save state to localStorage whenever it changes
  const saveState = useCallback(() => {
    if (typeof window === 'undefined') return;
    const state: SavedSearchState = {
      query,
      count,
      criteria,
      showAdvanced,
      savedAt: Date.now(),
    };
    localStorage.setItem(SEARCH_STATE_KEY, JSON.stringify(state));
  }, [query, count, criteria, showAdvanced]);

  // Save state on change
  useEffect(() => {
    saveState();
  }, [saveState]);

  // Clear saved state when search is submitted
  const clearSavedState = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(SEARCH_STATE_KEY);
    }
  }, []);

  // Update query when initialQuery prop changes
  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
    }
  }, [initialQuery]);

  // Auto-detect count from query
  const handleQueryChange = (newQuery: string) => {
    setQuery(newQuery);
    const parsedCount = parseCountFromQuery(newQuery);
    if (parsedCount !== null) {
      setCount(parsedCount);
      setCountAutoSet(true);
    } else if (countAutoSet) {
      // Reset to default if no number found and was previously auto-set
      setCount(20);
      setCountAutoSet(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      const finalCriteria = criteria.length > 0 ? criteria : [
        `MUST match the search query: "${query}". Their profile must clearly indicate relevant experience.`,
        'MUST be a professional with a verifiable work history. They should have a LinkedIn profile or professional online presence.'
      ];
      // Clear saved state when search is submitted successfully
      clearSavedState();
      onSearch(query.trim(), count, finalCriteria, enrichments);
    }
  };

  const addCriterion = () => {
    if (newCriterion.trim()) {
      setCriteria([...criteria, newCriterion.trim()]);
      setNewCriterion('');
    }
  };

  const removeCriterion = (index: number) => {
    setCriteria(criteria.filter((_, i) => i !== index));
  };

  const toggleEnrichment = (enrichment: CreateEnrichmentParameters) => {
    const exists = enrichments.find(e => e.description === enrichment.description);
    if (exists) {
      setEnrichments(enrichments.filter(e => e.description !== enrichment.description));
    } else {
      setEnrichments([...enrichments, enrichment]);
    }
  };

  const exampleQueries = [
    '5 Senior Software Engineers with Python experience',
    'Digital Marketing Managers in New York',
    'Data Scientists with machine learning background',
    'Product Designers who worked at startups',
  ];

  const availableEnrichments: CreateEnrichmentParameters[] = [
    { description: 'LinkedIn URL', format: 'url' },
    { description: 'GitHub Profile URL', format: 'url' },
    { description: 'Work Email', format: 'text' },
    { description: 'Twitter/X Profile', format: 'url' },
    { description: 'Personal Website', format: 'url' },
    { description: 'Phone Number', format: 'text' },
  ];

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="e.g., 5 Digital Marketers in San Francisco with startup experience..."
            className="w-full rounded-xl border border-[var(--border-default)] bg-[var(--bg-primary)] py-4 pl-12 pr-4 text-base text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--border-focus)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/10 transition-all"
          />
        </div>

        {/* Options row */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-[var(--text-secondary)]">
              Results:
            </label>
            <div className="relative">
              <input
                type="number"
                min={1}
                max={100}
                value={count}
                onChange={(e) => {
                  setCount(Math.min(100, Math.max(1, parseInt(e.target.value) || 1)));
                  setCountAutoSet(false);
                }}
                className={`w-20 rounded-lg border bg-[var(--bg-primary)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--border-focus)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]/20 transition-colors ${
                  countAutoSet
                    ? 'border-[var(--primary)] ring-1 ring-[var(--primary)]/20'
                    : 'border-[var(--border-default)]'
                }`}
              />
              {countAutoSet && (
                <span className="absolute -top-2 -right-2 px-1.5 py-0.5 bg-[var(--primary)] text-white text-[9px] font-medium rounded-full">
                  auto
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg hover:bg-[var(--bg-surface)] transition-colors"
          >
            <Settings2 className="h-4 w-4" />
            Advanced
            {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>

          <button
            type="button"
            onClick={() => setShowTemplates(true)}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg hover:bg-[var(--bg-surface)] transition-colors"
          >
            <FolderOpen className="h-4 w-4" />
            Templates
          </button>

          {showSaveTemplate && query.trim() && (
            <button
              type="button"
              onClick={() => setShowSaveTemplateDialog(true)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[var(--primary)] hover:text-[var(--primary-hover)] rounded-lg hover:bg-[var(--primary-light)] transition-colors"
            >
              <BookmarkPlus className="h-4 w-4" />
              Save as Template
            </button>
          )}
        </div>

        {/* Advanced Options */}
        {showAdvanced && (
          <div className="space-y-5 p-5 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-light)] animate-slide-up">
            {/* Criteria */}
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-[var(--text-primary)]">
                  Search Criteria
                </label>
                <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
                  Add specific requirements candidates must meet
                </p>
              </div>

              {criteria.length > 0 && (
                <div className="space-y-2">
                  {criteria.map((criterion, index) => (
                    <div key={index} className="flex items-start gap-2 group">
                      <div className="flex-1 px-3 py-2.5 bg-[var(--bg-primary)] rounded-lg border border-[var(--border-light)] text-sm text-[var(--text-secondary)]">
                        {criterion}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeCriterion(index)}
                        className="p-2 text-[var(--text-muted)] hover:text-[var(--error)] rounded-md hover:bg-[var(--error-bg)] transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCriterion}
                  onChange={(e) => setNewCriterion(e.target.value)}
                  placeholder="e.g., MUST have 5+ years of experience..."
                  className="flex-1 rounded-lg border border-[var(--border-default)] bg-[var(--bg-primary)] px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--border-focus)] focus:outline-none transition-colors"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCriterion())}
                />
                <button
                  type="button"
                  onClick={addCriterion}
                  disabled={!newCriterion.trim()}
                  className="px-3 py-2.5 bg-[var(--bg-surface)] text-[var(--text-secondary)] rounded-lg hover:bg-[var(--border-default)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Enrichments */}
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-[var(--text-primary)]">
                  Data to Extract
                </label>
                <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
                  Select what information to enrich for each candidate
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {availableEnrichments.map((enrichment) => {
                  const isSelected = enrichments.some(e => e.description === enrichment.description);
                  return (
                    <button
                      key={enrichment.description}
                      type="button"
                      onClick={() => toggleEnrichment(enrichment)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        isSelected
                          ? 'bg-[var(--primary-light)] text-[var(--primary)] border border-[var(--primary)]/20'
                          : 'bg-[var(--bg-primary)] text-[var(--text-secondary)] border border-[var(--border-default)] hover:border-[var(--border-focus)]'
                      }`}
                    >
                      {enrichment.description}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Submit button */}
        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-[var(--primary)] py-4 text-base font-semibold text-white transition-all hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:bg-[var(--border-default)] disabled:text-[var(--text-muted)] shadow-sm hover:shadow-md"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Searching...
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5" />
              Find Candidates
            </>
          )}
        </button>
      </form>

      {/* Example queries */}
      <div className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">Try an example</p>
        <div className="flex flex-wrap gap-2">
          {exampleQueries.map((example, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleQueryChange(example)}
              className="rounded-lg border border-[var(--border-light)] bg-[var(--bg-primary)] px-3 py-2 text-sm text-[var(--text-secondary)] transition-all hover:border-[var(--border-default)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)]"
            >
              {example}
            </button>
          ))}
        </div>
      </div>

      {/* Template Dialogs */}
      <TemplatePickerDialog
        isOpen={showTemplates}
        onClose={() => setShowTemplates(false)}
        onSelectTemplate={handleSelectTemplate}
      />
      <SaveTemplateDialog
        isOpen={showSaveTemplateDialog}
        onClose={() => setShowSaveTemplateDialog(false)}
        query={query}
        count={count}
        criteria={criteria}
        enrichments={enrichments.map(e => ({ description: e.description, format: e.format || 'text' }))}
      />
    </div>
  );
}
