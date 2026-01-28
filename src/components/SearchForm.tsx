'use client';

import { useState, useEffect } from 'react';
import { Search, Loader2, Plus, X, ChevronDown, ChevronUp, Sparkles, Settings2, Zap, Target } from 'lucide-react';
import { CreateEnrichmentParameters } from '@/types/exa';
import { useLocalStorage } from '@/lib/hooks/useLocalStorage';

interface SearchFormProps {
  onSearch: (
    query: string,
    count: number,
    criteria: string[],
    enrichments: CreateEnrichmentParameters[]
  ) => void;
  isLoading: boolean;
  initialQuery?: string;
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

const defaultEnrichments: CreateEnrichmentParameters[] = [
  { description: 'LinkedIn URL', format: 'url' },
  { description: 'GitHub Profile URL', format: 'url' },
  { description: 'Work Email', format: 'text' },
];

const defaultState: SavedSearchState = {
  query: '',
  count: 20,
  criteria: [],
  showAdvanced: false,
  savedAt: Date.now(),
};

function parseCountFromQuery(query: string): number | null {
  const match = query.match(/(?:^|\s)(\d{1,3})(?=\s|$)/);

  if (match) {
    const num = parseInt(match[1], 10);
    if (num >= 1 && num <= 100) {
      return num;
    }
  }
  return null;
}

export function SearchForm({ onSearch, isLoading, initialQuery = '' }: SearchFormProps) {
  const [savedState, setSavedState] = useLocalStorage<SavedSearchState>(SEARCH_STATE_KEY, defaultState);

  const [query, setQuery] = useState(initialQuery || savedState.query);
  const [count, setCount] = useState(savedState.count);
  const [countAutoSet, setCountAutoSet] = useState(false);
  const [criteria, setCriteria] = useState<string[]>(savedState.criteria);
  const [newCriterion, setNewCriterion] = useState('');
  const [enrichments, setEnrichments] = useState<CreateEnrichmentParameters[]>(defaultEnrichments);
  const [showAdvanced, setShowAdvanced] = useState(savedState.showAdvanced);
  const [hasRestored, setHasRestored] = useState(false);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setSavedState({
        query,
        count,
        criteria,
        showAdvanced,
        savedAt: Date.now(),
      });
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [query, count, criteria, showAdvanced, setSavedState]);

  useEffect(() => {
    if (savedState.savedAt !== defaultState.savedAt && !hasRestored && !initialQuery) {
      if (savedState.query) setQuery(savedState.query);
      if (savedState.count) setCount(savedState.count);
      if (savedState.criteria?.length) setCriteria(savedState.criteria);
      if (savedState.showAdvanced) setShowAdvanced(savedState.showAdvanced);
      setHasRestored(true);
    }
  }, [savedState, hasRestored, initialQuery]);

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
    }
  }, [initialQuery]);

  const handleQueryChange = (newQuery: string) => {
    setQuery(newQuery);
    const parsedCount = parseCountFromQuery(newQuery);
    if (parsedCount !== null) {
      setCount(parsedCount);
      setCountAutoSet(true);
    } else if (countAutoSet) {
      if (!parseCountFromQuery(newQuery)) {
        setCount(20);
        setCountAutoSet(false);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      const finalCriteria = criteria.length > 0 ? criteria : [
        `MUST match the search query: "${query}". Their profile must clearly indicate relevant experience.`,
        'MUST be a professional with a verifiable work history.'
      ];
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
    'Data Scientists with machine learning',
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
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Search input - Hero Style */}
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
            <Search className="h-6 w-6 text-[var(--primary)] opacity-60 group-focus-within:opacity-100 transition-opacity" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="Describe your ideal candidate..."
            className="block w-full rounded-2xl border-0 py-5 pl-14 pr-4 text-primary bg-white ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[var(--primary)] sm:text-lg sm:leading-6 shadow-lg shadow-black/5 transition-all duration-300 group-hover:shadow-xl"
            style={{ fontSize: '18px' }}
          />
          {/* Subtle indicator if count is auto-set */}
          {countAutoSet && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-2.5 py-1 bg-[var(--primary-light)] text-[var(--primary)] text-xs font-semibold rounded-full animate-fade-in">
              <Target className="w-3 h-3" />
              Auto: {count}
            </div>
          )}
        </div>

        {/* Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 px-1">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg transition-all ${showAdvanced
                  ? 'bg-[var(--bg-elevated)] text-[var(--primary)] shadow-sm ring-1 ring-[var(--border-light)]'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)]'
                }`}
            >
              <Settings2 className="h-4 w-4" />
              <span>Configuration</span>
              {showAdvanced ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>

            {/* Quick Count Selector if not in Auto Mode */}
            {!countAutoSet && (
              <div className="flex items-center items-center gap-2 text-sm text-[var(--text-secondary)] bg-[var(--bg-surface)] px-2 py-1 rounded-lg">
                <span className="text-xs font-medium px-1">Limit:</span>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={count}
                  onChange={(e) => setCount(Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))}
                  className="w-12 bg-transparent border-none p-0 text-center font-semibold text-[var(--text-primary)] focus:ring-0"
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--primary-hover)] px-8 py-3 text-sm font-bold text-white shadow-lg shadow-[var(--primary)]/20 transition-all hover:shadow-[var(--primary)]/30 hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Find Candidates
              </>
            )}
          </button>
        </div>

        {/* Advanced Options Panel */}
        {showAdvanced && (
          <div className="rounded-2xl border border-[var(--border-light)] bg-[var(--bg-elevated)] p-6 shadow-sm animate-slide-up">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Criteria Column */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-[var(--primary)]" />
                  <h3 className="text-sm font-semibold text-[var(--text-primary)]">Match Criteria</h3>
                </div>

                <div className="space-y-3">
                  {criteria.map((criterion, index) => (
                    <div key={index} className="flex items-start gap-3 group animate-fade-in">
                      <div className="flex-1 p-3 bg-[var(--bg-surface)] rounded-lg text-sm text-[var(--text-secondary)] border border-transparent group-hover:border-[var(--border-light)] transition-colors">
                        {criterion}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeCriterion(index)}
                        className="p-2 mt-1 text-[var(--text-muted)] hover:text-[var(--error)] rounded-full hover:bg-[var(--error-bg)] transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}

                  <div className="relative">
                    <input
                      type="text"
                      value={newCriterion}
                      onChange={(e) => setNewCriterion(e.target.value)}
                      placeholder="Add a requirement (e.g. 'Must have led a team')..."
                      className="w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-primary)] py-2.5 pl-4 pr-12 text-sm focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCriterion())}
                    />
                    <button
                      type="button"
                      onClick={addCriterion}
                      disabled={!newCriterion.trim()}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-[var(--bg-surface)] text-[var(--text-secondary)] rounded-md hover:bg-[var(--primary)] hover:text-white disabled:opacity-50 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Enrichment Column */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-[var(--warning)]" />
                  <h3 className="text-sm font-semibold text-[var(--text-primary)]">Data Enrichment</h3>
                </div>

                <div className="flex flex-wrap gap-2">
                  {availableEnrichments.map((enrichment) => {
                    const isSelected = enrichments.some(e => e.description === enrichment.description);
                    return (
                      <button
                        key={enrichment.description}
                        type="button"
                        onClick={() => toggleEnrichment(enrichment)}
                        className={`px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 border ${isSelected
                          ? 'bg-[var(--primary-light)] text-[var(--primary)] border-[var(--primary)]/30 shadow-sm'
                          : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border-transparent hover:border-[var(--border-light)]'
                          }`}
                      >
                        {enrichment.description}
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-[var(--text-tertiary)] leading-relaxed">
                  Selected data points will be automatically extracted and verified for each candidate found.
                </p>
              </div>
            </div>
          </div>
        )}
      </form>

      {/* Suggested Queries */}
      <div className="pt-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3 px-1">Try searching for</p>
        <div className="flex flex-wrap gap-2">
          {exampleQueries.map((example, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleQueryChange(example)}
              className="group flex items-center gap-2 rounded-full border border-[var(--border-light)] bg-white px-4 py-2 text-sm text-[var(--text-secondary)] transition-all hover:border-[var(--primary)] hover:text-[var(--primary)] hover:shadow-sm active:scale-95"
            >
              <Search className="h-3.5 w-3.5 text-[var(--text-muted)] group-hover:text-[var(--primary)] transition-colors" />
              {example}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
