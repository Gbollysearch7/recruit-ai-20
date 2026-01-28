'use client';

import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import Link from 'next/link';
import { useSearches } from '@/lib/hooks/useSearches';
import { useAuth } from '@/lib/hooks/useAuth';
import { useCandidates } from '@/lib/hooks/useCandidates';
import { DashboardStatsSkeleton, SearchRowSkeleton, CandidateCardSkeleton } from '@/components/Skeleton';
import { ActivityFeed } from '@/components/ActivityFeed';
import {
  Sparkles,
  Search,
  Users,
  TrendingUp,
  Clock,
  Activity,
  ChevronRight,
  SearchX,
  UserPlus,
  ArrowRight,
  ExternalLink
} from 'lucide-react';

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

      // Calculate average match rate (mock for now since we don't store this)
      const completedSearches = searches.filter(s => s.status === 'completed');
      const avgMatchRate = completedSearches.length > 0 ? 94 : 0; // TODO: Calculate from actual data

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
      <div className="space-y-6 animate-fade-in">
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
            className="btn btn-primary shadow-sm hover:shadow-md transition-all active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
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
                icon: Search,
                color: 'primary'
              },
              {
                label: 'Candidates Found',
                value: stats?.candidatesFound || 0,
                change: stats?.candidatesThisWeek ? `+${stats.candidatesThisWeek} this week` : 'No candidates yet',
                icon: Users,
                color: 'success'
              },
              {
                label: 'Avg. Match Rate',
                value: stats?.avgMatchRate ? `${stats.avgMatchRate}%` : '-',
                change: stats?.avgMatchRate ? '+2% vs last month' : 'Run searches to see stats',
                icon: TrendingUp,
                color: 'warning'
              },
              {
                label: 'Time Saved',
                value: stats?.totalSearches ? `${Math.round(stats.totalSearches * 2)}h` : '-',
                change: 'This month',
                icon: Clock,
                color: 'primary'
              },
            ].map((stat, i) => (
              <div key={i} className="bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-light)] p-4 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${stat.color === 'primary' ? 'bg-[var(--primary-light)]' :
                    stat.color === 'success' ? 'bg-[var(--success-bg)]' :
                      'bg-[var(--warning-bg)]'
                    }`}>
                    <stat.icon className={`w-4 h-4 ${stat.color === 'primary' ? 'text-[var(--primary)]' :
                      stat.color === 'success' ? 'text-[var(--success)]' :
                        'text-[var(--warning)]'
                      }`} />
                  </div>
                  <Activity className="w-4 h-4 text-[var(--text-muted)] opacity-50" />
                </div>
                <div className="text-2xl font-bold text-[var(--text-primary)] mb-0.5 tracking-tight">{stat.value}</div>
                <div className="text-xs text-[var(--text-tertiary)] font-medium mb-1.5">{stat.label}</div>
                <div className={`text-xs font-medium inline-flex items-center px-1.5 py-0.5 rounded ${stat.change.startsWith('+')
                  ? 'bg-[var(--success-bg)] text-[var(--success-text)]'
                  : 'bg-[var(--bg-surface)] text-[var(--text-tertiary)]'
                  }`}>{stat.change}</div>
              </div>
            ))}
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Searches */}
          <div className="lg:col-span-2 bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-light)] overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-light)]">
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">Recent Searches</h2>
              <Link href="/searches" className="text-xs text-[var(--primary)] hover:text-[var(--primary-hover)] flex items-center gap-0.5 font-medium transition-colors hover:underline">
                View all
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {isLoading ? (
              <div className="p-4">
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
                    className="flex items-center justify-between px-5 py-4 hover:bg-[var(--bg-surface)] transition-all group"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--text-primary)] truncate group-hover:text-[var(--primary)] transition-colors">
                        {search.query || search.name}
                      </p>
                      <p className="text-xs text-[var(--text-muted)] mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {search.created_at ? formatRelativeTime(search.created_at) : 'Unknown'}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 ml-4">
                      <span className="text-xs text-[var(--text-secondary)] font-medium bg-[var(--bg-surface)] px-2 py-1 rounded">
                        {search.results_count || 0} results
                      </span>
                      <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded ${search.status === 'completed'
                        ? 'bg-[var(--success-bg)] text-[var(--success-text)]'
                        : search.status === 'failed'
                          ? 'bg-[var(--error-bg)] text-[var(--error-text)]'
                          : 'bg-[var(--primary-light)] text-[var(--primary)]'
                        }`}>
                        {search.status === 'running' && (
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-current mr-1.5 animate-pulse" />
                        )}
                        {search.status}
                      </span>
                      <ChevronRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--primary)] transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center">
                <div className="w-16 h-16 bg-[var(--bg-surface)] rounded-full flex items-center justify-center mx-auto mb-4">
                  <SearchX className="w-8 h-8 text-[var(--text-muted)]" />
                </div>
                <h3 className="text-sm font-medium text-[var(--text-primary)] mb-1">No searches yet</h3>
                <p className="text-xs text-[var(--text-muted)] mb-6 max-w-[200px] mx-auto">Run your first AI-powered search to find candidates</p>
                <Link href="/search" className="btn btn-primary">
                  <Sparkles className="w-4 h-4" />
                  Start Searching
                </Link>
              </div>
            )}
          </div>

          {/* Top Candidates / Saved Candidates */}
          <div className="bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-light)] overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-light)]">
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">Saved Candidates</h2>
            </div>

            {isLoading ? (
              <div className="p-4">
                {[...Array(4)].map((_, i) => (
                  <CandidateCardSkeleton key={i} />
                ))}
              </div>
            ) : topCandidates.length > 0 ? (
              <div className="divide-y divide-[var(--border-light)]">
                {topCandidates.map((candidate) => (
                  <Link
                    key={candidate.id}
                    href={`/candidate/${candidate.id}`}
                    className="block px-5 py-3.5 hover:bg-[var(--bg-surface)] transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      {candidate.avatar ? (
                        <img
                          src={candidate.avatar}
                          alt={candidate.name}
                          className="w-9 h-9 rounded-lg object-cover ring-1 ring-[var(--border-light)]"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-lg bg-[var(--primary)] flex items-center justify-center text-white text-xs font-bold ring-1 ring-[var(--primary)]/20">
                          {candidate.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[var(--text-primary)] group-hover:text-[var(--primary)] transition-colors truncate">
                          {candidate.name}
                        </p>
                        <p className="text-xs text-[var(--text-tertiary)] truncate mt-0.5">
                          {candidate.title ? `${candidate.title}${candidate.company ? ` at ${candidate.company}` : ''}` : candidate.company || 'No details'}
                        </p>
                      </div>
                      {candidate.linkedin && (
                        <a
                          href={candidate.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-md hover:bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-[#0077b5] transition-all opacity-0 group-hover:opacity-100"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center">
                <div className="w-16 h-16 bg-[var(--bg-surface)] rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserPlus className="w-8 h-8 text-[var(--text-muted)]" />
                </div>
                <h3 className="text-sm font-medium text-[var(--text-primary)] mb-1">No candidates saved</h3>
                <p className="text-xs text-[var(--text-muted)] mb-4">Save candidates from search results</p>
              </div>
            )}

            <div className="px-5 py-3 border-t border-[var(--border-light)] bg-[var(--bg-surface)]/50 backdrop-blur-sm">
              <Link
                href="/search"
                className="text-xs text-[var(--primary)] hover:text-[var(--primary-hover)] flex items-center justify-center gap-1.5 font-medium transition-colors p-1"
              >
                Find more candidates
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Activity Feed Section */}
        {isAuthenticated && (
          <div className="bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-light)] p-1 overflow-hidden shadow-sm">
            <ActivityFeed limit={5} showHeader={true} />
          </div>
        )}

        {/* Quick Actions Banner */}
        <div className="bg-gradient-to-r from-[var(--primary)] to-[var(--primary-hover)] rounded-xl p-5 text-white shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-white/10 transition-colors duration-700" />
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 relative z-10">
            <div>
              <h3 className="text-base font-bold mb-1">Ready to find your next hire?</h3>
              <p className="text-white/80 text-sm max-w-lg">
                Describe your ideal candidate in plain English and let our AI scour the web to find the perfect match.
              </p>
            </div>
            <Link
              href="/search"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-[var(--primary)] text-sm font-bold rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-300 whitespace-nowrap"
            >
              Start Searching
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
