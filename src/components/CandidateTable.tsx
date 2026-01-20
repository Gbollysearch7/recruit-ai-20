'use client';

import { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
  SortingState,
  ColumnFiltersState,
} from '@tanstack/react-table';
import { WebsetItem } from '@/types/exa';
import {
  ArrowUpDown,
  ExternalLink,
  User,
  MapPin,
  Building2,
  Briefcase,
  Search,
  Download,
  Filter,
  ChevronDown,
  Linkedin,
  Github,
  Mail,
} from 'lucide-react';

interface CandidateTableProps {
  items: WebsetItem[];
  isLoading?: boolean;
}

const columnHelper = createColumnHelper<WebsetItem>();

export function CandidateTable({ items, isLoading }: CandidateTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  const columns = useMemo(
    () => [
      columnHelper.accessor(
        (row) =>
          row.properties.type === 'person' ? row.properties.name : '',
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
            const props = row.original.properties;
            if (props.type !== 'person') return null;
            return (
              <div className="flex items-center gap-3">
                {props.pictureUrl ? (
                  <img
                    src={props.pictureUrl}
                    alt={props.name || ''}
                    className="h-9 w-9 rounded-full object-cover ring-2 ring-white shadow-sm"
                  />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent-hover)] text-white shadow-sm">
                    <span className="text-xs font-medium">
                      {props.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </span>
                  </div>
                )}
                <div>
                  <span className="font-medium text-[var(--text-primary)]">{props.name}</span>
                </div>
              </div>
            );
          },
        }
      ),
      columnHelper.accessor(
        (row) =>
          row.properties.type === 'person' ? row.properties.position : '',
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
        (row) =>
          row.properties.type === 'person'
            ? row.properties.company?.name
            : '',
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
            const props = row.original.properties;
            if (props.type !== 'person') return <span className="text-[var(--text-muted)]">-</span>;
            const company = props.company;
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
        (row) =>
          row.properties.type === 'person' ? row.properties.location : '',
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
          cell: ({ getValue }) => (
            <div className="flex items-center gap-1.5 text-[var(--text-tertiary)]">
              <MapPin className="h-3.5 w-3.5" />
              <span>{getValue() || '-'}</span>
            </div>
          ),
        }
      ),
      columnHelper.accessor('url', {
        header: () => (
          <span className="text-xs font-medium uppercase tracking-wider text-[var(--text-tertiary)]">Links</span>
        ),
        cell: ({ row }) => {
          const url = row.original.url;
          const enrichments = row.original.enrichments || {};
          const linkedinUrl = enrichments['LinkedIn URL'] as string | undefined;
          const githubUrl = enrichments['GitHub Profile URL'] as string | undefined;
          const workEmail = enrichments['Work Email'] as string | undefined;

          return (
            <div className="flex items-center gap-2">
              {url && (
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-md hover:bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] hover:text-[var(--accent)] transition-colors"
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
                  className="p-1.5 rounded-md hover:bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] hover:text-[#0a66c2] transition-colors"
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
                  className="p-1.5 rounded-md hover:bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
                  title="GitHub"
                >
                  <Github className="h-4 w-4" />
                </a>
              )}
              {workEmail && (
                <a
                  href={`mailto:${workEmail}`}
                  className="p-1.5 rounded-md hover:bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] hover:text-[var(--accent)] transition-colors"
                  title="Email"
                >
                  <Mail className="h-4 w-4" />
                </a>
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
      columnFilters,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
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
          <div className="w-16 h-16 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center mb-4">
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
            className="w-full sm:w-72 rounded-lg border border-[var(--border-default)] bg-[var(--bg-elevated)] py-2.5 pl-10 pr-4 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--border-focus)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/10 transition-all"
          />
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-[var(--text-tertiary)]">
            {table.getFilteredRowModel().rows.length} of {items.length} candidates
          </span>
          <button className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-[var(--text-secondary)] bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors">
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-light)] overflow-hidden shadow-[var(--shadow-sm)]">
        <div className="overflow-x-auto">
          <table className="exa-table">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id}>
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
            <tbody>
              {table.getRowModel().rows.map((row, i) => (
                <tr
                  key={row.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${i * 30}ms` }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id}>
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
