'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
  SortingState,
} from '@tanstack/react-table';
import { WebsetItem, getPersonFromItem, getEnrichmentResult } from '@/types/exa';
import {
  ArrowUpDown,
  ExternalLink,
  User,
  MapPin,
  Search,
  Download,
  Linkedin,
  Github,
  Mail,
  CheckCircle,
  XCircle,
  HelpCircle,
  Twitter,
  Globe,
  Phone,
  FileText,
  FileSpreadsheet,
  ChevronDown,
} from 'lucide-react';

// Helper function to escape CSV values
function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

// Export to CSV
function exportToCSV(items: WebsetItem[], filename: string = 'candidates') {
  const headers = ['Name', 'Position', 'Company', 'Location', 'Profile URL', 'LinkedIn', 'GitHub', 'Email', 'Phone'];

  const rows = items.map(item => {
    const person = getPersonFromItem(item);
    return [
      escapeCSV(person?.name || ''),
      escapeCSV(person?.position || ''),
      escapeCSV(person?.company?.name || ''),
      escapeCSV(person?.location || ''),
      escapeCSV(item.properties.url || ''),
      escapeCSV(getEnrichmentResult(item, 'linkedin') || ''),
      escapeCSV(getEnrichmentResult(item, 'github') || ''),
      escapeCSV(getEnrichmentResult(item, 'email') || ''),
      escapeCSV(getEnrichmentResult(item, 'phone') || ''),
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Export to PDF (generates a printable HTML that opens in new window)
function exportToPDF(items: WebsetItem[], filename: string = 'candidates') {
  const rows = items.map(item => {
    const person = getPersonFromItem(item);
    const email = getEnrichmentResult(item, 'email');
    const linkedin = getEnrichmentResult(item, 'linkedin');
    const github = getEnrichmentResult(item, 'github');
    const phone = getEnrichmentResult(item, 'phone');

    return `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
          <div style="font-weight: 600; color: #111827;">${person?.name || '-'}</div>
          <div style="font-size: 12px; color: #6b7280;">${person?.position || ''}</div>
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #374151;">${person?.company?.name || '-'}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">${person?.location || '-'}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-size: 12px; color: #6b7280;">
          ${email ? `<div>Email: ${email}</div>` : ''}
          ${phone ? `<div>Phone: ${phone}</div>` : ''}
          ${linkedin ? `<div>LinkedIn: <a href="${linkedin}" style="color: #2563eb;">${linkedin.replace('https://www.linkedin.com/in/', '')}</a></div>` : ''}
          ${github ? `<div>GitHub: <a href="${github}" style="color: #2563eb;">${github.replace('https://github.com/', '')}</a></div>` : ''}
        </td>
      </tr>
    `;
  }).join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Candidates Export - ${new Date().toLocaleDateString()}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; color: #111827; }
        h1 { font-size: 24px; margin-bottom: 8px; }
        .subtitle { color: #6b7280; margin-bottom: 24px; font-size: 14px; }
        table { width: 100%; border-collapse: collapse; }
        th { text-align: left; padding: 12px; background: #f9fafb; border-bottom: 2px solid #e5e7eb; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280; }
        @media print {
          body { padding: 20px; }
          @page { margin: 1cm; }
        }
      </style>
    </head>
    <body>
      <h1>Candidate List</h1>
      <p class="subtitle">Exported on ${new Date().toLocaleString()} • ${items.length} candidates</p>
      <table>
        <thead>
          <tr>
            <th style="width: 25%;">Name</th>
            <th style="width: 20%;">Company</th>
            <th style="width: 20%;">Location</th>
            <th style="width: 35%;">Contact</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
      <script>window.onload = function() { window.print(); }</script>
    </body>
    </html>
  `;

  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

interface CandidateTableProps {
  items: WebsetItem[];
  isLoading?: boolean;
}

const columnHelper = createColumnHelper<WebsetItem>();

export function CandidateTable({ items, isLoading }: CandidateTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  // Close export menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const columns = useMemo(
    () => [
      columnHelper.accessor(
        (row) => {
          const person = getPersonFromItem(row);
          return person?.name || '';
        },
        {
          id: 'name',
          header: ({ column }) => (
            <button
              className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              Name
              <ArrowUpDown className="h-3 w-3" />
            </button>
          ),
          cell: ({ row }) => {
            const person = getPersonFromItem(row.original);
            if (!person) return <span className="text-[var(--text-muted)]">-</span>;

            const initials = person.name
              ?.split(' ')
              .map(n => n[0])
              .join('')
              .slice(0, 2)
              .toUpperCase() || '?';

            return (
              <div className="flex items-center gap-3">
                {person.pictureUrl ? (
                  <img
                    src={person.pictureUrl}
                    alt={person.name || ''}
                    className="h-9 w-9 rounded-full object-cover ring-2 ring-white shadow-sm"
                  />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--primary-hover)] text-white shadow-sm">
                    <span className="text-xs font-medium">{initials}</span>
                  </div>
                )}
                <div>
                  <span className="font-medium text-[var(--text-primary)]">
                    {person.name || 'Unknown'}
                  </span>
                </div>
              </div>
            );
          },
        }
      ),
      columnHelper.accessor(
        (row) => {
          const person = getPersonFromItem(row);
          return person?.position || '';
        },
        {
          id: 'position',
          header: ({ column }) => (
            <button
              className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              Position
              <ArrowUpDown className="h-3 w-3" />
            </button>
          ),
          cell: ({ getValue }) => (
            <span className="text-[var(--text-secondary)]">{getValue() || '-'}</span>
          ),
        }
      ),
      columnHelper.accessor(
        (row) => {
          const person = getPersonFromItem(row);
          return person?.company?.name || '';
        },
        {
          id: 'company',
          header: ({ column }) => (
            <button
              className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              Company
              <ArrowUpDown className="h-3 w-3" />
            </button>
          ),
          cell: ({ row }) => {
            const person = getPersonFromItem(row.original);
            const company = person?.company;
            if (!company?.name) return <span className="text-[var(--text-muted)]">-</span>;
            return (
              <div className="flex items-center gap-2">
                {company.logo && (
                  <img src={company.logo} alt="" className="h-5 w-5 rounded object-contain" />
                )}
                <span className="text-[var(--text-secondary)]">{company.name}</span>
              </div>
            );
          },
        }
      ),
      columnHelper.accessor(
        (row) => {
          const person = getPersonFromItem(row);
          return person?.location || '';
        },
        {
          id: 'location',
          header: ({ column }) => (
            <button
              className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              Location
              <ArrowUpDown className="h-3 w-3" />
            </button>
          ),
          cell: ({ getValue }) => {
            const location = getValue();
            if (!location) return <span className="text-[var(--text-muted)]">-</span>;
            return (
              <div className="flex items-center gap-1.5 text-[var(--text-tertiary)]">
                <MapPin className="h-3.5 w-3.5" />
                <span>{location}</span>
              </div>
            );
          },
        }
      ),
      columnHelper.display({
        id: 'match',
        header: () => (
          <span className="text-xs font-medium uppercase tracking-wider text-[var(--text-tertiary)]">Match</span>
        ),
        cell: ({ row }) => {
          const evaluations = row.original.evaluations;
          if (!evaluations || evaluations.length === 0) {
            return <span className="text-[var(--text-muted)]">-</span>;
          }

          // Count satisfied criteria
          const satisfied = evaluations.filter(e => e.satisfied === 'yes').length;
          const total = evaluations.length;
          const allMatch = satisfied === total;
          const someMatch = satisfied > 0;

          return (
            <div className="flex items-center gap-1.5">
              {allMatch ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--success-bg)] text-[var(--success-text)]">
                  <CheckCircle className="h-3 w-3" />
                  {satisfied}/{total}
                </span>
              ) : someMatch ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--warning-bg)] text-[var(--warning-text)]">
                  <HelpCircle className="h-3 w-3" />
                  {satisfied}/{total}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--error-bg)] text-[var(--error-text)]">
                  <XCircle className="h-3 w-3" />
                  {satisfied}/{total}
                </span>
              )}
            </div>
          );
        },
      }),
      columnHelper.display({
        id: 'links',
        header: () => (
          <span className="text-xs font-medium uppercase tracking-wider text-[var(--text-tertiary)]">Links</span>
        ),
        cell: ({ row }) => {
          const item = row.original;
          const profileUrl = item.properties.url;

          // Get enrichment results for various link types
          const linkedinUrl = getEnrichmentResult(item, 'linkedin');
          const githubUrl = getEnrichmentResult(item, 'github');
          const workEmail = getEnrichmentResult(item, 'email');
          const twitterUrl = getEnrichmentResult(item, 'twitter');
          const websiteUrl = getEnrichmentResult(item, 'website');
          const phoneNumber = getEnrichmentResult(item, 'phone');

          const hasAnyLink = profileUrl || linkedinUrl || githubUrl || workEmail || twitterUrl || websiteUrl || phoneNumber;

          return (
            <div className="flex items-center gap-1">
              {profileUrl && (
                <a
                  href={profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-md hover:bg-[var(--bg-surface)] text-[var(--text-tertiary)] hover:text-[var(--primary)] transition-colors"
                  title="Profile"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
              {linkedinUrl && (
                <a
                  href={linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-md hover:bg-[var(--bg-surface)] text-[var(--text-tertiary)] hover:text-[#0a66c2] transition-colors"
                  title="LinkedIn"
                >
                  <Linkedin className="h-4 w-4" />
                </a>
              )}
              {githubUrl && (
                <a
                  href={githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-md hover:bg-[var(--bg-surface)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
                  title="GitHub"
                >
                  <Github className="h-4 w-4" />
                </a>
              )}
              {twitterUrl && (
                <a
                  href={twitterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-md hover:bg-[var(--bg-surface)] text-[var(--text-tertiary)] hover:text-[#1da1f2] transition-colors"
                  title="Twitter/X"
                >
                  <Twitter className="h-4 w-4" />
                </a>
              )}
              {websiteUrl && (
                <a
                  href={websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-md hover:bg-[var(--bg-surface)] text-[var(--text-tertiary)] hover:text-[var(--primary)] transition-colors"
                  title="Website"
                >
                  <Globe className="h-4 w-4" />
                </a>
              )}
              {workEmail && (
                <a
                  href={`mailto:${workEmail}`}
                  className="p-1.5 rounded-md hover:bg-[var(--bg-surface)] text-[var(--text-tertiary)] hover:text-[var(--primary)] transition-colors"
                  title={workEmail}
                >
                  <Mail className="h-4 w-4" />
                </a>
              )}
              {phoneNumber && (
                <a
                  href={`tel:${phoneNumber}`}
                  className="p-1.5 rounded-md hover:bg-[var(--bg-surface)] text-[var(--text-tertiary)] hover:text-[var(--success)] transition-colors"
                  title={phoneNumber}
                >
                  <Phone className="h-4 w-4" />
                </a>
              )}
              {!hasAnyLink && (
                <span className="text-[var(--text-muted)]">-</span>
              )}
            </div>
          );
        },
      }),
    ],
    []
  );

  const table = useReactTable({
    data: items,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  if (isLoading) {
    return (
      <div className="bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-light)] overflow-hidden">
        <div className="p-4 border-b border-[var(--border-light)]">
          <div className="h-10 w-64 skeleton rounded-lg" />
        </div>
        <div className="divide-y divide-[var(--border-light)]">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-6 py-4">
              <div className="h-9 w-9 skeleton rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 skeleton rounded" />
                <div className="h-3 w-48 skeleton rounded" />
              </div>
              <div className="h-4 w-24 skeleton rounded" />
              <div className="h-4 w-20 skeleton rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-light)]">
        <div className="flex flex-col items-center justify-center py-16 px-6">
          <div className="w-16 h-16 rounded-full bg-[var(--bg-surface)] flex items-center justify-center mb-4">
            <User className="h-8 w-8 text-[var(--text-muted)]" />
          </div>
          <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">No candidates found</h3>
          <p className="text-sm text-[var(--text-tertiary)] text-center max-w-sm">
            Try adjusting your search criteria or broadening your query to find more candidates.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Filter candidates..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="w-full sm:w-72 rounded-lg border border-[var(--border-default)] bg-[var(--bg-elevated)] py-2.5 pl-10 pr-4 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--border-focus)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/10 transition-all"
          />
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-[var(--text-tertiary)]">
            {table.getFilteredRowModel().rows.length} of {items.length} candidates
          </span>

          {/* Export Dropdown */}
          <div className="relative" ref={exportMenuRef}>
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-[var(--text-secondary)] bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-lg hover:bg-[var(--bg-surface)] transition-colors"
            >
              <Download className="h-4 w-4" />
              Export
              <ChevronDown className={`h-4 w-4 transition-transform ${showExportMenu ? 'rotate-180' : ''}`} />
            </button>

            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-lg shadow-lg z-50 overflow-hidden animate-fade-in">
                <button
                  onClick={() => {
                    const filteredItems = table.getFilteredRowModel().rows.map(row => row.original);
                    exportToCSV(filteredItems);
                    setShowExportMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors"
                >
                  <FileSpreadsheet className="h-4 w-4 text-green-600" />
                  <div className="text-left">
                    <div className="font-medium">Export CSV</div>
                    <div className="text-xs text-[var(--text-tertiary)]">Spreadsheet format</div>
                  </div>
                </button>
                <button
                  onClick={() => {
                    const filteredItems = table.getFilteredRowModel().rows.map(row => row.original);
                    exportToPDF(filteredItems);
                    setShowExportMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors border-t border-[var(--border-light)]"
                >
                  <FileText className="h-4 w-4 text-red-600" />
                  <div className="text-left">
                    <div className="font-medium">Export PDF</div>
                    <div className="text-xs text-[var(--text-tertiary)]">Print-ready format</div>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-light)] overflow-hidden shadow-[var(--shadow-sm)]">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[var(--bg-surface)] border-b border-[var(--border-light)]">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-left"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-[var(--border-light)]">
              {table.getRowModel().rows.map((row, i) => (
                <tr
                  key={row.id}
                  className="hover:bg-[var(--bg-surface)] transition-colors animate-fade-in"
                  style={{ animationDelay: `${i * 30}ms` }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-4 py-3"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
