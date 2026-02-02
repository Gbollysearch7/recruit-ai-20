'use client';

import { ReactNode } from 'react';

interface SkeletonProps {
  className?: string;
  children?: ReactNode;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`skeleton rounded ${className}`}
      style={{ minHeight: '1em' }}
    />
  );
}

// Table Row Skeleton
export function TableRowSkeleton({ columns = 6 }: { columns?: number }) {
  return (
    <tr className="animate-pulse">
      <td className="text-center">
        <div className="w-4 h-4 skeleton rounded mx-auto" />
      </td>
      <td className="text-center">
        <div className="w-6 h-4 skeleton rounded mx-auto" />
      </td>
      {[...Array(columns - 2)].map((_, i) => (
        <td key={i}>
          <div className="flex items-center gap-2">
            {i === 0 && <div className="w-5 h-5 skeleton rounded-full" />}
            <div className={`h-4 skeleton rounded ${i === 0 ? 'w-24' : 'w-20'}`} />
          </div>
        </td>
      ))}
    </tr>
  );
}

// Results Table Skeleton
export function ResultsTableSkeleton({ rows = 10 }: { rows?: number }) {
  return (
    <div className="flex-1 bg-white dark:bg-black/20 overflow-auto">
      <table className="dense-table">
        <thead>
          <tr>
            <th className="w-10 text-center">
              <div className="w-4 h-4 skeleton rounded mx-auto" />
            </th>
            <th className="w-10 text-center">#</th>
            <th className="w-48">Name</th>
            <th className="w-40">Company</th>
            <th className="w-48">Job Title</th>
            <th className="w-48">URL</th>
            <th className="min-w-[140px]">Criteria 1</th>
            <th className="min-w-[140px]">Criteria 2</th>
            <th className="min-w-[140px]">Criteria 3</th>
            <th className="w-24 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {[...Array(rows)].map((_, i) => (
            <tr key={i} className="animate-pulse">
              <td className="text-center">
                <div className="w-4 h-4 skeleton rounded mx-auto" />
              </td>
              <td className="text-center text-[var(--text-muted)]">{i + 1}</td>
              <td>
                <div className="flex items-center gap-2 py-0.5">
                  <div className="w-5 h-5 skeleton rounded-full flex-shrink-0" />
                  <div className="w-28 h-4 skeleton rounded" />
                </div>
              </td>
              <td>
                <div className="w-24 h-4 skeleton rounded" />
              </td>
              <td>
                <div className="w-32 h-4 skeleton rounded" />
              </td>
              <td>
                <div className="w-36 h-4 skeleton rounded" />
              </td>
              <td>
                <div className="flex items-center justify-between">
                  <div className="w-12 h-5 skeleton rounded" />
                  <div className="w-8 h-3 skeleton rounded" />
                </div>
              </td>
              <td>
                <div className="flex items-center justify-between">
                  <div className="w-12 h-5 skeleton rounded" />
                  <div className="w-8 h-3 skeleton rounded" />
                </div>
              </td>
              <td>
                <div className="flex items-center justify-between">
                  <div className="w-12 h-5 skeleton rounded" />
                  <div className="w-8 h-3 skeleton rounded" />
                </div>
              </td>
              <td className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <div className="w-6 h-6 skeleton rounded" />
                  <div className="w-6 h-6 skeleton rounded" />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Card Skeleton
export function CardSkeleton({ hasIcon = true }: { hasIcon?: boolean }) {
  return (
    <div className="bg-[var(--bg-elevated)] rounded-lg border border-[var(--border-light)] p-4 animate-pulse">
      {hasIcon && (
        <div className="flex items-center justify-between mb-3">
          <div className="w-8 h-8 skeleton rounded-md" />
          <div className="w-6 h-6 skeleton rounded" />
        </div>
      )}
      <div className="w-16 h-6 skeleton rounded mb-1" />
      <div className="w-24 h-4 skeleton rounded mb-2" />
      <div className="w-20 h-3 skeleton rounded" />
    </div>
  );
}

// Search Row Skeleton
export function SearchRowSkeleton() {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-light)] animate-pulse">
      <div className="flex-1 min-w-0">
        <div className="w-64 h-4 skeleton rounded mb-1" />
        <div className="w-20 h-3 skeleton rounded" />
      </div>
      <div className="flex items-center gap-3 ml-4">
        <div className="w-16 h-4 skeleton rounded" />
        <div className="w-16 h-5 skeleton rounded" />
      </div>
    </div>
  );
}

// Dashboard Stats Skeleton
export function DashboardStatsSkeleton() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

// Candidate Card Skeleton
export function CandidateCardSkeleton() {
  return (
    <div className="px-4 py-3 border-b border-[var(--border-light)] animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 skeleton rounded-md" />
        <div className="flex-1 min-w-0">
          <div className="w-28 h-4 skeleton rounded mb-1" />
          <div className="w-40 h-3 skeleton rounded" />
        </div>
        <div className="w-10 h-5 skeleton rounded" />
      </div>
    </div>
  );
}

// List Page Skeleton
export function ListPageSkeleton() {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between animate-pulse">
        <div>
          <div className="w-32 h-6 skeleton rounded mb-2" />
          <div className="w-48 h-4 skeleton rounded" />
        </div>
        <div className="w-28 h-9 skeleton rounded" />
      </div>

      {/* Stats */}
      <DashboardStatsSkeleton />

      {/* Content Grid */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-[var(--bg-elevated)] rounded-lg border border-[var(--border-light)] overflow-hidden">
          <div className="px-4 py-3 border-b border-[var(--border-light)] animate-pulse">
            <div className="w-32 h-5 skeleton rounded" />
          </div>
          {[...Array(3)].map((_, i) => (
            <SearchRowSkeleton key={i} />
          ))}
        </div>
        <div className="bg-[var(--bg-elevated)] rounded-lg border border-[var(--border-light)] overflow-hidden">
          <div className="px-4 py-3 border-b border-[var(--border-light)] animate-pulse">
            <div className="w-24 h-5 skeleton rounded" />
          </div>
          {[...Array(4)].map((_, i) => (
            <CandidateCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

// Search Detail Page Skeleton
export function SearchDetailSkeleton() {
  return (
    <div className="h-screen flex flex-col bg-[var(--bg-primary)]">
      {/* Header Skeleton */}
      <header className="h-12 border-b border-[var(--border-light)] flex items-center px-4 shrink-0 bg-[var(--bg-primary)] animate-pulse">
        <div className="flex items-center gap-4 flex-1">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 skeleton rounded" />
            <div className="w-16 h-4 skeleton rounded" />
          </div>
          <div className="flex-1 max-w-2xl">
            <div className="w-full h-8 skeleton rounded" />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 skeleton rounded" />
          <div className="w-16 h-4 skeleton rounded" />
          <div className="w-7 h-7 skeleton rounded-full" />
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar Skeleton */}
        <aside className="w-52 border-r border-[var(--border-light)] bg-[var(--bg-elevated)] p-3 animate-pulse">
          <div className="w-full h-8 skeleton rounded mb-4" />
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-full h-10 skeleton rounded" />
            ))}
          </div>
        </aside>

        {/* Main Area */}
        <main className="flex-1 flex flex-col bg-[var(--bg-primary)] min-w-0">
          {/* Toolbar Skeleton */}
          <div className="h-10 border-b border-[var(--border-light)] px-3 flex items-center gap-2 animate-pulse">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="w-16 h-6 skeleton rounded" />
            ))}
          </div>

          {/* Table Skeleton */}
          <ResultsTableSkeleton rows={15} />

          {/* Footer Skeleton */}
          <div className="h-8 border-t border-[var(--border-light)] px-3 flex items-center animate-pulse">
            <div className="w-32 h-4 skeleton rounded" />
          </div>
        </main>

        {/* Right Panel Skeleton */}
        <aside className="w-72 border-l border-[var(--border-light)] bg-[var(--bg-elevated)] p-3 animate-pulse">
          <div className="w-24 h-5 skeleton rounded mb-4" />
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-3 h-3 skeleton rounded" />
                <div className="flex-1 h-4 skeleton rounded" />
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}

// Inline Loading Spinner
export function LoadingSpinner({ size = 'sm' }: { size?: 'xs' | 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div className={`${sizeClasses[size]} animate-spin`}>
      <svg className="w-full h-full" viewBox="0 0 24 24" fill="none">
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );
}
