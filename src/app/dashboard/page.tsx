'use client';

import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import Link from 'next/link';
import { useSearches } from '@/lib/hooks/useSearches';
import { useAuth } from '@/lib/hooks/useAuth';
import { useCandidates } from '@/lib/hooks/useCandidates';
import { DashboardStatsSkeleton, SearchRowSkeleton, CandidateCardSkeleton } from '@/components/Skeleton';
import { ActivityFeed } from '@/components/ActivityFeed';

interface DashboardStats {
  totalSearches: number;
  candidatesFound: number;
  avgMatchRate: number;
  searchesThisWeek: number;
  candidatesThisWeek: number;
}

function formatRelativeTime(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function DashboardPage() {
  const { searches, isLoading: searchesLoading } = useSearches();
  const { candidates, isLoading: candidatesLoading } = useCandidates();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);

  // Calculate stats from real data
  useEffect(() => {
    if (!searchesLoading && !candidatesLoading) {
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const searchesThisWeek = searches.filter(
        s => s.created_at && new Date(s.created_at) >= weekAgo
      ).length;

      const candidatesThisWeek = candidates.filter(
        c => c.created_at && new Date(c.created_at) >= weekAgo
      ).length;

      // Calculate average match rate from real candidate match_score data
      const candidatesWithScore = candidates.filter(c => c.match_score != null && c.match_score > 0);
      const avgMatchRate = candidatesWithScore.length > 0
        ? Math.round(candidatesWithScore.reduce((sum, c) => sum + (c.match_score || 0), 0) / candidatesWithScore.length)
        : 0;

      setStats({
        totalSearches: searches.length,
        candidatesFound: candidates.length,
        avgMatchRate,
        searchesThisWeek,
        candidatesThisWeek,
      });
    }
  }, [searches, candidates, searchesLoading, candidatesLoading]);

  const isLoading = authLoading || searchesLoading || candidatesLoading;
  const recentSearches = searches.slice(0, 3);
  const topCandidates = candidates.slice(0, 4);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-[var(--text-primary)] tracking-tight">Dashboard</h1>
            <p className="text-sm text-[var(--text-secondary)] mt-0.5">
              {isAuthenticated
                ? "Welcome back! Here's your recruiting overview."
                : "Sign in to save your searches and candidates."}
            </p>
          </div>
          <Link
            href="/search"
            className="btn btn-primary"
          >
            <span className="material-icons-outlined text-sm">auto_awesome</span>
            New Search
          </Link>
        </div>

        {/* Stats Cards */}
        {isLoading ? (
          <DashboardStatsSkeleton />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: 'Total Searches',
                value: stats?.totalSearches || 0,
                change: stats?.searchesThisWeek ? `+${stats.searchesThisWeek} this week` : 'No searches yet',
                icon: 'search',
                color: 'primary'
              },
              {
                label: 'Candidates Found',
                value: stats?.candidatesFound || 0,
                change: stats?.candidatesThisWeek ? `+${stats.candidatesThisWeek} this week` : 'No candidates yet',
                icon: 'group',
                color: 'success'
              },
              {
                label: 'Avg. Match Rate',
                value: stats?.avgMatchRate ? `${stats.avgMatchRate}%` : '-',
                change: stats?.avgMatchRate ? `Based on ${candidates.filter(c => c.match_score).length} candidates` : 'Save candidates to see stats',
                icon: 'trending_up',
                color: 'warning'
              },
              {
                label: 'Time Saved',
                value: stats?.totalSearches ? `${Math.round(stats.totalSearches * 2)}h` : '-',
                change: 'This month',
                icon: 'schedule',
                color: 'primary'
              },
            ].map((stat, i) => (
              <div key={i} className="bg-[var(--bg-elevated)] rounded-lg border border-[var(--border-light)] p-4 hover:shadow-[var(--shadow-sm)] transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-8 h-8 rounded-md flex items-center justify-center ${
                    stat.color === 'primary' ? 'bg-[var(--primary-light)]' :
                    stat.color === 'success' ? 'bg-[var(--success-bg)]' :
                    'bg-[var(--warning-bg)]'
                  }`}>
                    <span className={`material-icons-outlined text-base ${
                      stat.color === 'primary' ? 'text-[var(--primary)]' :
                      stat.color === 'success' ? 'text-[var(--success)]' :
                      'text-[var(--warning)]'
                    }`}>{stat.icon}</span>
                  </div>
                  <span className="material-icons-outlined text-sm text-[var(--text-muted)]">show_chart</span>
                </div>
                <div className="text-xl font-semibold text-[var(--text-primary)] mb-0.5 tracking-tight">{stat.value}</div>
                <div className="text-xs text-[var(--text-tertiary)]">{stat.label}</div>
                <div className={`text-xs mt-1.5 font-medium ${
                  stat.change.startsWith('+') ? 'text-[var(--success)]' : 'text-[var(--text-muted)]'
                }`}>{stat.change}</div>
              </div>
            ))}
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-4">
          {/* Recent Searches */}
          <div className="lg:col-span-2 bg-[var(--bg-elevated)] rounded-lg border border-[var(--border-light)] overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-light)]">
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">Recent Searches</h2>
              <Link href="/searches" className="text-xs text-[var(--primary)] hover:text-[var(--primary-hover)] flex items-center gap-0.5 font-medium transition-colors">
                View all
                <span className="material-icons-outlined text-sm">chevron_right</span>
              </Link>
            </div>

            {isLoading ? (
              <div>
                {[...Array(3)].map((_, i) => (
                  <SearchRowSkeleton key={i} />
                ))}
              </div>
            ) : recentSearches.length > 0 ? (
              <div className="divide-y divide-[var(--border-light)]">
                {recentSearches.map((search) => (
                  <Link
                    key={search.id}
                    href={`/searches/${search.exa_webset_id || search.id}`}
                    className="flex items-center justify-between px-4 py-3 hover:bg-[var(--bg-surface)] transition-colors group"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-[var(--text-primary)] truncate group-hover:text-[var(--primary)] transition-colors">
                        {search.query || search.name}
                      </p>
                      <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
                        {search.created_at ? formatRelativeTime(search.created_at) : 'Unknown'}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                      <span className="text-xs text-[var(--text-secondary)] font-medium">
                        {search.results_count || 0} results
                      </span>
                      <span className={`px-2 py-0.5 text-[10px] font-medium rounded ${
                        search.status === 'completed'
                          ? 'bg-[var(--success-bg)] text-[var(--success-text)]'
                          : search.status === 'failed'
                          ? 'bg-[var(--error-bg)] text-[var(--error-text)]'
                          : 'bg-[var(--primary-light)] text-[var(--primary)]'
                      }`}>
                        {search.status === 'running' && (
                          <span className="inline-block w-1 h-1 rounded-full bg-current mr-1 animate-pulse" />
                        )}
                        {search.status}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <span className="material-icons-outlined text-4xl text-[var(--text-muted)] mb-3 block">search_off</span>
                <h3 className="text-sm font-medium text-[var(--text-primary)] mb-1">No searches yet</h3>
                <p className="text-xs text-[var(--text-muted)] mb-4">Run your first AI-powered search</p>
                <Link href="/search" className="btn btn-primary">
                  <span className="material-icons-outlined text-sm">auto_awesome</span>
                  Start Searching
                </Link>
              </div>
            )}
          </div>

          {/* Top Candidates / Saved Candidates */}
          <div className="bg-[var(--bg-elevated)] rounded-lg border border-[var(--border-light)] overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-light)]">
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">Saved Candidates</h2>
            </div>

            {isLoading ? (
              <div>
                {[...Array(4)].map((_, i) => (
                  <CandidateCardSkeleton key={i} />
                ))}
              </div>
            ) : topCandidates.length > 0 ? (
              <div className="divide-y divide-[var(--border-light)]">
                {topCandidates.map((candidate) => (
                  <Link key={candidate.id} href={`/candidate/${candidate.id}`} className="block px-4 py-3 hover:bg-[var(--bg-surface)] transition-colors cursor-pointer group">
                    <div className="flex items-center gap-3">
                      {candidate.avatar ? (
                        <img
                          src={candidate.avatar}
                          alt={candidate.name}
                          className="w-8 h-8 rounded-md object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-md bg-[var(--primary)] flex items-center justify-center text-white text-xs font-medium">
                          {candidate.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-[var(--text-primary)] group-hover:text-[var(--primary)] transition-colors truncate">
                          {candidate.name}
                        </p>
                        <p className="text-[10px] text-[var(--text-tertiary)] truncate">
                          {candidate.title ? `${candidate.title}${candidate.company ? ` at ${candidate.company}` : ''}` : candidate.company || 'No details'}
                        </p>
                      </div>
                      {candidate.linkedin && (
                        <a
                          href={candidate.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span className="material-icons-outlined text-sm text-[var(--text-muted)] hover:text-[var(--primary)]">open_in_new</span>
                        </a>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <span className="material-icons-outlined text-4xl text-[var(--text-muted)] mb-3 block">person_add</span>
                <h3 className="text-sm font-medium text-[var(--text-primary)] mb-1">No candidates saved</h3>
                <p className="text-xs text-[var(--text-muted)] mb-4">Save candidates from search results</p>
              </div>
            )}

            <div className="px-4 py-2.5 border-t border-[var(--border-light)] bg-[var(--bg-surface)]">
              <Link
                href="/search"
                className="text-xs text-[var(--primary)] hover:text-[var(--primary-hover)] flex items-center gap-1 font-medium transition-colors"
              >
                Find more candidates
                <span className="material-icons-outlined text-sm">arrow_forward</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Activity Feed Section */}
        {isAuthenticated && (
          <div className="bg-[var(--bg-elevated)] rounded-lg border border-[var(--border-light)] p-4">
            <ActivityFeed limit={5} showHeader={true} />
          </div>
        )}

        {/* Quick Actions Banner */}
        <div className="bg-[var(--primary)] rounded-lg p-4 text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold mb-0.5">Ready to find your next hire?</h3>
              <p className="text-white/80 text-xs">
                Describe your ideal candidate and let AI do the heavy lifting.
              </p>
            </div>
            <Link
              href="/search"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-[var(--primary)] text-xs font-semibold rounded-md hover:bg-white/90 transition-colors whitespace-nowrap"
            >
              Start Searching
              <span className="material-icons-outlined text-sm">arrow_forward</span>
            </Link>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
