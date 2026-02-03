'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { SearchesSidebar } from '@/components/SearchesSidebar';
import { ResultsTable } from '@/components/ResultsTable';
import { CriteriaPanel } from '@/components/CriteriaPanel';
import { CandidateDetailPanel } from '@/components/CandidateDetailPanel';
import { SearchesToolbar, SearchesFooter } from '@/components/SearchesToolbar';
import {
  Modal,
  CodeModal,
  ConfirmModal,
  FilterModal,
  SortModal,
  AddEnrichmentModal,
} from '@/components/Modal';
import { ExportDialog } from '@/components/ExportDialog';
import { WebsetItem, Webset, getPersonFromItem } from '@/types/exa';
import { useToast } from '@/components/Toast';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ShareSearchDialog } from '@/components/ShareSearchDialog';
import { useSearches } from '@/lib/hooks/useSearches';
import { useAuth } from '@/lib/hooks/useAuth';
import { SearchDetailSkeleton } from '@/components/Skeleton';
import { KeyboardShortcutsDialog } from '@/components/KeyboardShortcutsDialog';
import { useKeyboardShortcuts, createCommonShortcuts } from '@/hooks/useKeyboardShortcuts';
import { CandidateCompareDialog } from '@/components/CandidateCompareDialog';

const availableEnrichmentOptions = [
  { id: 'email', label: 'Email', description: 'Work or personal email address' },
  { id: 'linkedin', label: 'LinkedIn URL', description: 'LinkedIn profile URL' },
  { id: 'github', label: 'GitHub Profile', description: 'GitHub profile URL' },
  { id: 'interests', label: 'Interests', description: 'Professional interests and hobbies' },
  { id: 'seniority', label: 'Seniority', description: 'Years of experience level' },
  { id: 'skills', label: 'Skills', description: 'Technical and soft skills' },
  { id: 'education', label: 'Education', description: 'Educational background' },
  { id: 'phone', label: 'Phone Number', description: 'Contact phone number' },
];

const filterOptions = [
  { id: 'match', label: 'Show only Matches', checked: false },
  { id: 'miss', label: 'Show only Misses', checked: false },
  { id: 'unclear', label: 'Show only Unclear', checked: false },
  { id: 'hasEmail', label: 'Has Email', checked: false },
  { id: 'hasLinkedIn', label: 'Has LinkedIn', checked: false },
];

const sortOptions = [
  { id: 'name_asc', label: 'Name (A-Z)' },
  { id: 'name_desc', label: 'Name (Z-A)' },
  { id: 'company_asc', label: 'Company (A-Z)' },
  { id: 'company_desc', label: 'Company (Z-A)' },
  { id: 'match_score', label: 'Match Score (High to Low)' },
  { id: 'date_added', label: 'Recently Added' },
];

export default function SearchDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToast } = useToast();
  const { isAuthenticated, user } = useAuth();
  const { getSearch } = useSearches();

  // Data states
  const [items, setItems] = useState<WebsetItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<WebsetItem[]>([]);
  const [criteria, setCriteria] = useState<string[]>([]);
  const [enrichments, setEnrichments] = useState<string[]>(['email', 'skills']);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<WebsetItem | null>(null);
  const [searchShareInfo, setSearchShareInfo] = useState<{ shareId?: string | null; isPublic?: boolean }>({});

  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isPolling, setIsPolling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Modal states
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeleteSearchModal, setShowDeleteSearchModal] = useState(false);
  const [showEnrichmentModal, setShowEnrichmentModal] = useState(false);
  const [showMonitorModal, setShowMonitorModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const [showCompareDialog, setShowCompareDialog] = useState(false);

  // Keyboard shortcuts
  const shortcuts = createCommonShortcuts({
    onSearch: () => {
      const searchInput = document.querySelector('input[placeholder*="Search query"]') as HTMLInputElement;
      searchInput?.focus();
    },
    onExport: () => setShowExportModal(true),
    onSelectAll: () => setSelectedIds(new Set(filteredItems.map(item => item.id))),
    onDeselectAll: () => {
      if (selectedItem) {
        setSelectedItem(null);
      } else if (selectedIds.size > 0) {
        setSelectedIds(new Set());
      }
    },
    onDelete: () => selectedIds.size > 0 && setShowDeleteModal(true),
    onNewSearch: () => router.push('/search'),
    onClosePanel: () => setSelectedItem(null),
    onShowHelp: () => setShowKeyboardHelp(true),
  });

  useKeyboardShortcuts({ shortcuts });

  // Filter and sort states
  const [filters, setFilters] = useState(filterOptions);
  const [currentSort, setCurrentSort] = useState('date_added');

  // Fetch search data
  const fetchSearchData = useCallback(async (searchId: string) => {
    setIsLoading(true);
    try {
      // First, try to load from Supabase (for persisted/completed results)
      const savedSearch = await getSearch(searchId);

      // If we have a completed search with results in Supabase, use that
      if (savedSearch && savedSearch.status === 'completed' && savedSearch.results && Array.isArray(savedSearch.results) && savedSearch.results.length > 0) {
        // Use saved results from Supabase
        setSearchQuery(savedSearch.query);
        if (savedSearch.criteria && Array.isArray(savedSearch.criteria)) {
          setCriteria(savedSearch.criteria.filter((c): c is string => typeof c === 'string'));
        }
        const results = savedSearch.results as unknown as WebsetItem[];
        setItems(results);
        setFilteredItems(results);
        setIsLoading(false);
        return null;
      }

      // For running searches or no saved results, fetch from Exa API
      const searchRes = await fetch(`/api/websets/${searchId}`);
      if (!searchRes.ok) {
        throw new Error('Search not found');
      }

      const searchData: Webset = await searchRes.json();
      const search = searchData.searches?.[0];

      if (search?.query) {
        setSearchQuery(search.query);
      }

      if (search?.criteria) {
        setCriteria(search.criteria.map(c => c.description));
      }

      // Check if search is still running
      const isSearchActive =
        searchData.status === 'running' ||
        searchData.status === 'pending' ||
        search?.status === 'running' ||
        search?.status === 'created';

      if (isSearchActive) {
        setIsPolling(true);
      }

      // Fetch items
      const itemsRes = await fetch(`/api/websets/${searchId}/items?limit=100`);
      if (itemsRes.ok) {
        const data = await itemsRes.json();
        if (data.data) {
          setItems(data.data);
          setFilteredItems(data.data);
        }
      }

      return searchData;
    } catch (error) {
      console.error('Error loading search:', error);
      addToast('Failed to load search', 'error');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [addToast, getSearch]);

  // Poll for updates if search is running
  useEffect(() => {
    if (!isPolling) return;

    const searchId = params.id as string;
    const pollInterval = setInterval(async () => {
      try {
        const searchRes = await fetch(`/api/websets/${searchId}`);
        if (!searchRes.ok) return;

        const searchData: Webset = await searchRes.json();
        const search = searchData.searches?.[0];

        const isSearchActive =
          searchData.status === 'running' ||
          searchData.status === 'pending' ||
          search?.status === 'running' ||
          search?.status === 'created';

        // Fetch updated items
        const itemsRes = await fetch(`/api/websets/${searchId}/items?limit=100`);
        if (itemsRes.ok) {
          const data = await itemsRes.json();
          if (data.data) {
            setItems(data.data);
            setFilteredItems(data.data);
          }
        }

        if (!isSearchActive) {
          setIsPolling(false);
          addToast('Search complete!', 'success');
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 2000);

    return () => clearInterval(pollInterval);
  }, [isPolling, params.id, addToast]);

  // Load search data on mount
  useEffect(() => {
    const searchId = params.id as string;
    if (searchId) {
      fetchSearchData(searchId);
    }
  }, [params.id, fetchSearchData]);

  // Load search share info from Supabase
  useEffect(() => {
    const loadSearchShareInfo = async () => {
      const searchId = params.id as string;
      if (isAuthenticated && searchId) {
        const search = await getSearch(searchId);
        if (search) {
          setSearchShareInfo({
            shareId: search.share_id,
            isPublic: search.is_public ?? undefined,
          });
        }
      }
    };
    loadSearchShareInfo();
  }, [params.id, isAuthenticated, getSearch]);

  // Generate API code
  const generateApiCode = () => {
    return `// Exa Websets API - JavaScript/TypeScript
const response = await fetch('https://api.exa.ai/websets/v0/websets/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'YOUR_API_KEY'
  },
  body: JSON.stringify({
    search: {
      query: "${searchQuery}",
      count: ${items.length || 20},
      criteria: ${JSON.stringify(criteria, null, 2)}
    },
    enrichments: [
      ${enrichments.map(e => `{ description: "${e}" }`).join(',\n      ')}
    ]
  })
});

const webset = await response.json();
console.log('Webset ID:', webset.id);

// Poll for results
const pollResults = async (websetId) => {
  const res = await fetch(\`https://api.exa.ai/websets/v0/websets/\${websetId}/items\`, {
    headers: { 'x-api-key': 'YOUR_API_KEY' }
  });
  return res.json();
};`;
  };

  // Handle delete selected items
  const handleDeleteSelected = () => {
    const newItems = items.filter(item => !selectedIds.has(item.id));
    setItems(newItems);
    setFilteredItems(newItems);
    setSelectedIds(new Set());
    addToast(`${selectedIds.size} item(s) removed`, 'success');
    setShowDeleteModal(false);
  };

  // Handle delete entire search
  const handleDeleteSearch = async () => {
    const searchId = params.id as string;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/websets/${searchId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        addToast('Search deleted successfully', 'success');
        router.push('/dashboard');
      } else {
        const data = await res.json();
        throw new Error(data.message || data.error || 'Failed to delete search');
      }
    } catch (error) {
      console.error('Error deleting search:', error);
      addToast(error instanceof Error ? error.message : 'Failed to delete search', 'error');
    } finally {
      setIsDeleting(false);
      setShowDeleteSearchModal(false);
    }
  };

  // Handle export - open dialog
  const handleExport = () => {
    setShowExportModal(true);
  };

  // Handle sort
  const handleSort = (sortId: string) => {
    setCurrentSort(sortId);
    const sorted = [...filteredItems].sort((a, b) => {
      const personA = getPersonFromItem(a);
      const personB = getPersonFromItem(b);
      if (!personA || !personB) return 0;

      switch (sortId) {
        case 'name_asc':
          return (personA.name || '').localeCompare(personB.name || '');
        case 'name_desc':
          return (personB.name || '').localeCompare(personA.name || '');
        case 'company_asc':
          return (personA.company?.name || '').localeCompare(personB.company?.name || '');
        case 'company_desc':
          return (personB.company?.name || '').localeCompare(personA.company?.name || '');
        default:
          return 0;
      }
    });
    setFilteredItems(sorted);
    setShowSortModal(false);
  };

  // Handle adding enrichment
  const handleAddEnrichment = (enrichmentId: string) => {
    if (!enrichments.includes(enrichmentId)) {
      setEnrichments([...enrichments, enrichmentId]);
    }
  };

  // Handle new search navigation
  const handleNewSearch = () => {
    router.push('/search');
  };

  // Copy search to clipboard
  const handleCopySearch = () => {
    navigator.clipboard.writeText(searchQuery);
    addToast('Search query copied to clipboard', 'success');
  };

  // Share search
  const handleShare = () => {
    if (isAuthenticated) {
      setShowShareModal(true);
    } else {
      const url = window.location.href;
      navigator.clipboard.writeText(url);
      addToast('Search URL copied to clipboard', 'success');
    }
  };

  // Show loading skeleton while fetching initial data
  if (isLoading && items.length === 0) {
    return <SearchDetailSkeleton />;
  }

  return (
    <div className="h-screen flex flex-col bg-[var(--bg-primary)]">
      {/* Header */}
      <header className="h-12 border-b border-[var(--border-light)] flex items-center px-4 shrink-0 bg-[var(--bg-primary)]">
        <div className="flex items-center gap-4 flex-1">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/dashboard')}>
            <span className="material-icons-outlined text-[var(--primary)]">filter_center_focus</span>
            <span className="font-semibold text-sm tracking-tight">Recruit AI</span>
          </div>

          {/* Search Input */}
          <div className="flex-1 max-w-2xl relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <span className="material-icons-outlined text-sm text-[var(--text-muted)]">search</span>
            </div>
            <input
              type="text"
              className="input-base pl-9 pr-24"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search query..."
            />
            <div className="absolute inset-y-0 right-3 flex items-center gap-2">
              <button
                onClick={handleShare}
                className="material-icons-outlined text-sm text-[var(--text-muted)] cursor-pointer hover:text-[var(--primary)]"
                title="Share"
              >
                share
              </button>
              <button
                onClick={handleCopySearch}
                className="material-icons-outlined text-sm text-[var(--text-muted)] cursor-pointer hover:text-[var(--primary)]"
                title="Copy"
              >
                content_copy
              </button>
              <button
                onClick={() => router.push('/searches')}
                className="material-icons-outlined text-sm text-[var(--text-muted)] cursor-pointer hover:text-[var(--primary)]"
                title="History"
              >
                history
              </button>
            </div>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4 text-xs font-medium">
          {isPolling && (
            <div className="flex items-center gap-1.5 text-[var(--primary)]">
              <span className="material-icons-outlined text-sm animate-spin">refresh</span>
              <span>Searching...</span>
            </div>
          )}
          <ThemeToggle />
          <button
            onClick={() => window.open('mailto:feedback@recruitai.app', '_blank')}
            className="flex items-center gap-1 hover:text-[var(--primary)] transition-colors text-[var(--text-secondary)]"
          >
            <span className="material-icons-outlined text-sm">chat_bubble_outline</span>
            Feedback
          </button>
          <button className="flex items-center gap-1 hover:text-[var(--primary)] transition-colors text-[var(--text-secondary)]">
            <span className="material-icons-outlined text-sm">toll</span>
            Credits
          </button>
          {user ? (
            <div className="w-7 h-7 bg-[var(--primary)] rounded-full flex items-center justify-center text-white text-[10px] font-semibold">
              {(user.email?.[0] || 'U').toUpperCase()}
            </div>
          ) : (
            <div className="w-7 h-7 bg-[var(--text-muted)] rounded-full flex items-center justify-center text-white text-[10px] font-semibold">
              G
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <SearchesSidebar onNewSearch={handleNewSearch} />

        {/* Main Area */}
        <main className="flex-1 flex flex-col bg-[var(--bg-primary)] min-w-0">
          {/* Search In Progress Banner */}
          {isPolling && (
            <div className="px-4 py-2 bg-[var(--primary-light)] border-b border-[var(--primary)]/20 flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="material-icons-outlined text-sm text-[var(--primary)] animate-spin">refresh</span>
                <span className="text-xs font-medium text-[var(--primary)]">Search in progress</span>
              </div>
              <span className="text-xs text-[var(--primary)]/70">
                {items.length > 0 ? `${items.length} candidates found so far...` : 'Finding candidates...'}
              </span>
            </div>
          )}

          {/* Toolbar */}
          <SearchesToolbar
            selectedCount={selectedIds.size}
            totalCount={filteredItems.length}
            onFilter={() => setShowFilterModal(true)}
            onSort={() => setShowSortModal(true)}
            onGetCode={() => setShowCodeModal(true)}
            onMonitor={() => setShowMonitorModal(true)}
            onAddEnrichment={() => setShowEnrichmentModal(true)}
            onDelete={() => setShowDeleteModal(true)}
            onDeleteSearch={() => setShowDeleteSearchModal(true)}
            onExport={handleExport}
            onCompare={() => setShowCompareDialog(true)}
            isExporting={isExporting}
          />

          {/* Table */}
          <ResultsTable
            items={filteredItems}
            criteria={criteria}
            isLoading={isLoading}
            onSelectionChange={(selected) => setSelectedIds(selected)}
            onRowClick={(item) => setSelectedItem(item)}
            selectedRowId={selectedItem?.id}
            searchId={params.id as string}
          />

          {/* Footer */}
          <SearchesFooter matchCount={filteredItems.length} totalCount={items.length} />
        </main>

        {/* Right Panel - Show Candidate Detail when selected, otherwise show Criteria Panel */}
        {selectedItem ? (
          <CandidateDetailPanel
            websetItem={selectedItem}
            onClose={() => setSelectedItem(null)}
            isPanel={true}
          />
        ) : (
          <CriteriaPanel
            criteria={criteria}
            onCriteriaChange={setCriteria}
            enrichments={enrichments}
            onEnrichmentsChange={setEnrichments}
            itemCount={filteredItems.length}
            matchCount={filteredItems.length}
            selectedPerson={null}
          />
        )}
      </div>

      {/* Modals */}
      <FilterModal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        filters={filters}
        onApply={setFilters}
      />

      <SortModal
        isOpen={showSortModal}
        onClose={() => setShowSortModal(false)}
        options={sortOptions}
        currentSort={currentSort}
        onSort={handleSort}
      />

      <CodeModal
        isOpen={showCodeModal}
        onClose={() => setShowCodeModal(false)}
        code={generateApiCode()}
        language="javascript"
      />

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteSelected}
        title="Delete Selected Items"
        message={`Are you sure you want to delete ${selectedIds.size} selected item(s)? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />

      <AddEnrichmentModal
        isOpen={showEnrichmentModal}
        onClose={() => setShowEnrichmentModal(false)}
        availableEnrichments={availableEnrichmentOptions}
        selectedEnrichments={enrichments}
        onAdd={handleAddEnrichment}
      />

      <Modal
        isOpen={showMonitorModal}
        onClose={() => setShowMonitorModal(false)}
        title="Monitor for New People"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-[var(--text-secondary)]">
            Get notified when new people matching your criteria are found.
          </p>
          <div className="space-y-3">
            <label className="block">
              <span className="text-xs font-medium text-[var(--text-tertiary)]">Notification Frequency</span>
              <select className="input-base mt-1">
                <option>Daily</option>
                <option>Weekly</option>
                <option>Monthly</option>
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-medium text-[var(--text-tertiary)]">Email</span>
              <input
                type="email"
                className="input-base mt-1"
                placeholder="your@email.com"
                defaultValue={user?.email || ''}
              />
            </label>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setShowMonitorModal(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button
              onClick={() => {
                addToast('Monitor created! You will receive notifications.', 'success');
                setShowMonitorModal(false);
              }}
              className="btn btn-primary"
            >
              Enable Monitor
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={showDeleteSearchModal}
        onClose={() => setShowDeleteSearchModal(false)}
        onConfirm={handleDeleteSearch}
        title="Delete Search"
        message="Are you sure you want to delete this entire search? This will remove all results and cannot be undone."
        confirmText={isDeleting ? 'Deleting...' : 'Delete Search'}
        variant="danger"
      />

      <ShareSearchDialog
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        searchId={params.id as string}
        searchName={searchQuery}
        currentShareId={searchShareInfo.shareId}
        isPublic={searchShareInfo.isPublic}
      />

      <ExportDialog
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        items={selectedIds.size > 0 ? filteredItems.filter(item => selectedIds.has(item.id)) : filteredItems}
        criteria={criteria}
        searchQuery={searchQuery}
      />

      <KeyboardShortcutsDialog
        isOpen={showKeyboardHelp}
        onClose={() => setShowKeyboardHelp(false)}
      />

      <CandidateCompareDialog
        isOpen={showCompareDialog}
        onClose={() => setShowCompareDialog(false)}
        items={filteredItems.filter(item => selectedIds.has(item.id))}
        criteria={criteria}
      />
    </div>
  );
}
