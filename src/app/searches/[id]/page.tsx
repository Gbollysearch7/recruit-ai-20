'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { SearchesSidebar } from '@/components/SearchesSidebar';
import { ResultsTable } from '@/components/ResultsTable';
import { CriteriaPanel } from '@/components/CriteriaPanel';
import { SearchesToolbar, SearchesFooter } from '@/components/SearchesToolbar';
import {
  Modal,
  CodeModal,
  ConfirmModal,
  FilterModal,
  SortModal,
  AddEnrichmentModal,
} from '@/components/Modal';
import { WebsetItem, Webset, getPersonFromItem } from '@/types/exa';
import { useToast } from '@/components/Toast';
import { ThemeToggle } from '@/components/ThemeToggle';

// Mock data for demonstration - using correct nested structure
const mockItems: WebsetItem[] = [
  {
    id: '1',
    object: 'webset_item',
    source: 'search',
    sourceId: 'src-1',
    websetId: 'ws-1',
    properties: {
      type: 'person',
      url: 'https://linkedin.com/in/tina-peng',
      person: {
        name: 'Tina Peng',
        position: 'Senior Account Manager',
        location: 'Taipei, Taiwan',
        company: { name: 'SAP', location: 'Taiwan' },
      },
    },
  },
  {
    id: '2',
    object: 'webset_item',
    source: 'search',
    sourceId: 'src-2',
    websetId: 'ws-1',
    properties: {
      type: 'person',
      url: 'https://linkedin.com/in/hsin-ju-lee',
      person: {
        name: 'Hsin Ju Lee',
        position: '業務經理',
        location: 'Taipei, Taiwan',
        company: { name: '新人類資訊股份有限公司', location: 'Taiwan' },
      },
    },
  },
  {
    id: '3',
    object: 'webset_item',
    source: 'search',
    sourceId: 'src-3',
    websetId: 'ws-1',
    properties: {
      type: 'person',
      url: 'https://linkedin.com/in/eric-chang',
      person: {
        name: 'Eric Chang',
        position: '業務副總經理',
        location: 'Taipei, Taiwan',
        company: { name: 'SAS', location: 'Taiwan' },
      },
    },
  },
  {
    id: '4',
    object: 'webset_item',
    source: 'search',
    sourceId: 'src-4',
    websetId: 'ws-1',
    properties: {
      type: 'person',
      url: 'https://linkedin.com/in/chen-yi-ru',
      person: {
        name: '陳奕如',
        position: '業務經理',
        location: 'Taipei, Taiwan',
        company: { name: 'NTT DATA', location: 'Taiwan' },
      },
    },
  },
  {
    id: '5',
    object: 'webset_item',
    source: 'search',
    sourceId: 'src-5',
    websetId: 'ws-1',
    properties: {
      type: 'person',
      url: 'https://linkedin.com/in/hao-wen-cheng',
      person: {
        name: 'Hao wen Cheng',
        position: 'Sales Manager',
        location: 'Taipei, Taiwan',
        company: { name: 'Anyong Fintech Co.', location: 'Taiwan' },
      },
    },
  },
  {
    id: '6',
    object: 'webset_item',
    source: 'search',
    sourceId: 'src-6',
    websetId: 'ws-1',
    properties: {
      type: 'person',
      url: 'https://linkedin.com/in/chang-ta-yu',
      person: {
        name: 'Chang-Ta Yu',
        position: 'Account Manager',
        location: 'Taipei, Taiwan',
        company: { name: 'Oracle', location: 'Taiwan' },
      },
    },
  },
  {
    id: '7',
    object: 'webset_item',
    source: 'search',
    sourceId: 'src-7',
    websetId: 'ws-1',
    properties: {
      type: 'person',
      url: 'https://linkedin.com/in/jemmy-lee',
      person: {
        name: 'Jemmy Lee',
        position: 'Country Manager',
        location: 'Taipei, Taiwan',
        company: { name: 'ELITE CLOUD PTE.', location: 'Taiwan' },
      },
    },
  },
  {
    id: '8',
    object: 'webset_item',
    source: 'search',
    sourceId: 'src-8',
    websetId: 'ws-1',
    properties: {
      type: 'person',
      url: 'https://linkedin.com/in/gin-lee',
      person: {
        name: 'GIN LEE',
        position: 'Account Manager Key Account',
        location: 'Taipei, Taiwan',
        company: { name: 'Ricoh Taiwan', location: 'Taiwan' },
      },
    },
  },
  {
    id: '9',
    object: 'webset_item',
    source: 'search',
    sourceId: 'src-9',
    websetId: 'ws-1',
    properties: {
      type: 'person',
      url: 'https://linkedin.com/in/xiu-hao',
      person: {
        name: '詹修豪',
        position: 'Taiwan Branch Manager',
        location: 'Taipei, Taiwan',
        company: { name: 'Ecount', location: 'Taiwan' },
      },
    },
  },
  {
    id: '10',
    object: 'webset_item',
    source: 'search',
    sourceId: 'src-10',
    websetId: 'ws-1',
    properties: {
      type: 'person',
      url: 'https://linkedin.com/in/hazel-wang',
      person: {
        name: 'Hazel Wang',
        position: 'Overseas Sales Manager',
        location: 'Taipei, Taiwan',
        company: { name: 'Streamax Technology', location: 'Taiwan' },
      },
    },
  },
  {
    id: '11',
    object: 'webset_item',
    source: 'search',
    sourceId: 'src-11',
    websetId: 'ws-1',
    properties: {
      type: 'person',
      url: 'https://linkedin.com/in/guo-jun',
      person: {
        name: '曾國峻',
        position: '資深業務專員',
        location: 'Taipei, Taiwan',
        company: { name: 'iKala', location: 'Taiwan' },
      },
    },
  },
  {
    id: '12',
    object: 'webset_item',
    source: 'search',
    sourceId: 'src-12',
    websetId: 'ws-1',
    properties: {
      type: 'person',
      url: 'https://linkedin.com/in/adam-chang',
      person: {
        name: 'Adam Chang',
        position: 'Account Manager',
        location: 'Taipei, Taiwan',
        company: { name: '甲骨文', location: 'Taiwan' },
      },
    },
  },
  {
    id: '13',
    object: 'webset_item',
    source: 'search',
    sourceId: 'src-13',
    websetId: 'ws-1',
    properties: {
      type: 'person',
      url: 'https://linkedin.com/in/darren-wang',
      person: {
        name: '王博榕 Darren Wang',
        position: 'Senior Sales Account Manager',
        location: 'Taipei, Taiwan',
        company: { name: '中華電信', location: 'Taiwan' },
      },
    },
  },
  {
    id: '14',
    object: 'webset_item',
    source: 'search',
    sourceId: 'src-14',
    websetId: 'ws-1',
    properties: {
      type: 'person',
      url: 'https://linkedin.com/in/rose-huang',
      person: {
        name: 'Rose Huang',
        position: 'Manager',
        location: 'Taipei, Taiwan',
        company: { name: 'Deloitte', location: 'Taiwan' },
      },
    },
  },
  {
    id: '15',
    object: 'webset_item',
    source: 'search',
    sourceId: 'src-15',
    websetId: 'ws-1',
    properties: {
      type: 'person',
      url: 'https://linkedin.com/in/darren-lee',
      person: {
        name: 'Darren Lee',
        position: '業務經理 Sales Executive',
        location: 'Taipei, Taiwan',
        company: { name: 'NTT DATA', location: 'Taiwan' },
      },
    },
  },
  {
    id: '16',
    object: 'webset_item',
    source: 'search',
    sourceId: 'src-16',
    websetId: 'ws-1',
    properties: {
      type: 'person',
      url: 'https://linkedin.com/in/ben-chen',
      person: {
        name: 'Ben Chen',
        position: 'Senior Sales Manager',
        location: 'Taipei, Taiwan',
        company: { name: 'One Pacific', location: 'Taiwan' },
      },
    },
  },
  {
    id: '17',
    object: 'webset_item',
    source: 'search',
    sourceId: 'src-17',
    websetId: 'ws-1',
    properties: {
      type: 'person',
      url: 'https://linkedin.com/in/guan-xiao',
      person: {
        name: '林冠孝',
        position: 'Manufacturing Program Manager',
        location: 'Taipei, Taiwan',
        company: { name: 'Gogoro', location: 'Taiwan' },
      },
    },
  },
  {
    id: '18',
    object: 'webset_item',
    source: 'search',
    sourceId: 'src-18',
    websetId: 'ws-1',
    properties: {
      type: 'person',
      url: 'https://linkedin.com/in/ming-lun-w',
      person: {
        name: 'Ming Lun W.',
        position: 'Partnerships Director',
        location: 'Taipei, Taiwan',
        company: { name: 'SHOPLINE', location: 'Taiwan' },
      },
    },
  },
  {
    id: '19',
    object: 'webset_item',
    source: 'search',
    sourceId: 'src-19',
    websetId: 'ws-1',
    properties: {
      type: 'person',
      url: 'https://linkedin.com/in/leo-wu',
      person: {
        name: 'Leo Wu',
        position: 'Sales Manager',
        location: 'Taipei, Taiwan',
        company: { name: 'Freelance', location: 'Taiwan' },
      },
    },
  },
  {
    id: '20',
    object: 'webset_item',
    source: 'search',
    sourceId: 'src-20',
    websetId: 'ws-1',
    properties: {
      type: 'person',
      url: 'https://linkedin.com/in/lisa-wu',
      person: {
        name: 'Lisa WU',
        position: 'Procurement Specialist',
        location: 'Taipei, Taiwan',
        company: { name: 'CloudMile', location: 'Taiwan' },
      },
    },
  },
];

const defaultCriteria = [
  'currently or previously employed as a sales manager',
  'have experience with ERP',
  'under 12 years experience',
  'must have Chinese name',
  'based in Taiwan',
];

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
  const [items, setItems] = useState<WebsetItem[]>(mockItems);
  const [filteredItems, setFilteredItems] = useState<WebsetItem[]>(mockItems);
  const [criteria, setCriteria] = useState<string[]>(defaultCriteria);
  const [enrichments, setEnrichments] = useState<string[]>(['email', 'skills']);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('People: sales managers in Taiwan, enterprise solutions, under...');
  const [selectedItem, setSelectedItem] = useState<WebsetItem | null>(null);

  // Modal states
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeleteSearchModal, setShowDeleteSearchModal] = useState(false);
  const [showEnrichmentModal, setShowEnrichmentModal] = useState(false);
  const [showMonitorModal, setShowMonitorModal] = useState(false);

  // Filter and sort states
  const [filters, setFilters] = useState(filterOptions);
  const [currentSort, setCurrentSort] = useState('date_added');

  // Try to load real data from API
  useEffect(() => {
    const loadSearchData = async () => {
      const searchId = params.id as string;

      // Skip loading for mock IDs (1-20)
      if (parseInt(searchId) <= 20) {
        return;
      }

      setIsLoading(true);
      try {
        // Fetch search details
        const searchRes = await fetch(`/api/websets/${searchId}`);
        if (searchRes.ok) {
          const searchData: Webset = await searchRes.json();
          if (searchData.searches?.[0]?.query) {
            setSearchQuery(searchData.searches[0].query);
          }
        }

        // Fetch items
        const itemsRes = await fetch(`/api/websets/${searchId}/items?limit=100`);
        if (itemsRes.ok) {
          const data = await itemsRes.json();
          if (data.data && data.data.length > 0) {
            setItems(data.data);
            setFilteredItems(data.data);
          }
        }
      } catch (error) {
        console.error('Error loading search:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSearchData();
  }, [params.id]);

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
      count: ${items.length},
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
  };

  // Handle delete entire search
  const handleDeleteSearch = async () => {
    const searchId = params.id as string;

    // Don't delete mock searches
    if (parseInt(searchId) <= 20) {
      addToast('Cannot delete demo search', 'warning');
      setShowDeleteSearchModal(false);
      return;
    }

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

  // Handle export
  const handleExport = async () => {
    setIsExporting(true);
    addToast('Preparing export...', 'info');

    try {
      // Small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 300));

      const dataToExport = selectedIds.size > 0
        ? items.filter(item => selectedIds.has(item.id))
        : items;

      const csvContent = [
        ['Name', 'Company', 'Position', 'URL'].join(','),
        ...dataToExport.map(item => {
          const person = getPersonFromItem(item);
          if (person) {
            return [
              `"${person.name || ''}"`,
              `"${person.company?.name || ''}"`,
              `"${person.position || ''}"`,
              `"${item.properties.url || ''}"`,
            ].join(',');
          }
          return '';
        }),
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `talist-export-${params.id}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      addToast(`Exported ${dataToExport.length} candidate(s) to CSV`, 'success');
    } catch (error) {
      console.error('Export error:', error);
      addToast('Failed to export data', 'error');
    } finally {
      setIsExporting(false);
    }
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
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    addToast('Search URL copied to clipboard', 'success');
  };

  return (
    <div className="h-screen flex flex-col bg-[var(--bg-primary)]">
      {/* Header */}
      <header className="h-12 border-b border-[var(--border-light)] flex items-center px-4 shrink-0 bg-[var(--bg-primary)]">
        <div className="flex items-center gap-4 flex-1">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/dashboard')}>
            <span className="material-icons-outlined text-[var(--primary)]">filter_center_focus</span>
            <span className="font-semibold text-sm tracking-tight">talist.ai</span>
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
          <ThemeToggle />
          <button
            onClick={() => window.open('mailto:feedback@talist.ai', '_blank')}
            className="flex items-center gap-1 hover:text-[var(--primary)] transition-colors text-[var(--text-secondary)]"
          >
            <span className="material-icons-outlined text-sm">chat_bubble_outline</span>
            Feedback
          </button>
          <button className="flex items-center gap-1 hover:text-[var(--primary)] transition-colors text-[var(--text-secondary)]">
            <span className="material-icons-outlined text-sm">toll</span>
            Credits
          </button>
          <div className="w-7 h-7 bg-[var(--primary)] rounded-full flex items-center justify-center text-white text-[10px] font-semibold">
            L
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <SearchesSidebar onNewSearch={handleNewSearch} />

        {/* Main Area */}
        <main className="flex-1 flex flex-col bg-[var(--bg-primary)] min-w-0">
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
          />

          {/* Footer */}
          <SearchesFooter matchCount={filteredItems.length} totalCount={items.length} />
        </main>

        {/* Right Panel */}
        <CriteriaPanel
          criteria={criteria}
          onCriteriaChange={setCriteria}
          enrichments={enrichments}
          onEnrichmentsChange={setEnrichments}
          itemCount={filteredItems.length}
          matchCount={filteredItems.length}
          selectedPerson={selectedItem ? (() => {
            const person = getPersonFromItem(selectedItem);
            return person ? {
              name: person.name || '',
              position: person.position,
              company: person.company?.name,
              location: person.location,
              url: selectedItem.properties.url,
            } : null;
          })() : null}
        />
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
    </div>
  );
}
