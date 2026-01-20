'use client';

import { AppLayout } from '@/components/AppLayout';
import Link from 'next/link';
import {
  Search,
  Users,
  TrendingUp,
  Clock,
  ArrowRight,
  Plus,
  ExternalLink,
  Sparkles,
  ChevronRight,
  Activity
} from 'lucide-react';

// Mock data for demonstration
const recentSearches = [
  {
    id: '1',
    query: 'Full-stack engineers in SF with AI startup experience',
    results: 45,
    status: 'completed',
    createdAt: '2 hours ago'
  },
  {
    id: '2',
    query: 'Senior product managers with fintech background',
    results: 32,
    status: 'completed',
    createdAt: '5 hours ago'
  },
  {
    id: '3',
    query: 'ML engineers who graduated from Stanford',
    results: 28,
    status: 'running',
    createdAt: '1 day ago'
  },
];

const topCandidates = [
  { name: 'Sarah Chen', position: 'Senior Engineer', company: 'OpenAI', match: 98 },
  { name: 'Marcus Johnson', position: 'Staff Engineer', company: 'Anthropic', match: 95 },
  { name: 'Emily Rodriguez', position: 'Tech Lead', company: 'Scale AI', match: 92 },
  { name: 'Alex Kim', position: 'Principal Engineer', company: 'Stripe', match: 89 },
];

export default function DashboardPage() {
  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-[var(--text-primary)] tracking-tight">Dashboard</h1>
            <p className="text-[var(--text-secondary)] mt-1">Welcome back! Here's your recruiting overview.</p>
          </div>
          <Link
            href="/search"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[var(--accent)] text-white text-sm font-medium rounded-lg hover:bg-[var(--accent-hover)] transition-all shadow-sm hover:shadow-md"
          >
            <Sparkles className="w-4 h-4" />
            New Search
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Searches', value: '24', change: '+3 this week', icon: Search, color: 'accent' },
            { label: 'Candidates Found', value: '847', change: '+156 this week', icon: Users, color: 'success' },
            { label: 'Avg. Match Rate', value: '94%', change: '+2% vs last month', icon: TrendingUp, color: 'warning' },
            { label: 'Time Saved', value: '48h', change: 'This month', icon: Clock, color: 'accent' },
          ].map((stat, i) => (
            <div key={i} className="bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-light)] p-5 hover:shadow-[var(--shadow-md)] transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  stat.color === 'accent' ? 'bg-[var(--accent-light)]' :
                  stat.color === 'success' ? 'bg-[var(--success-light)]' :
                  'bg-[var(--warning-light)]'
                }`}>
                  <stat.icon className={`w-5 h-5 ${
                    stat.color === 'accent' ? 'text-[var(--accent)]' :
                    stat.color === 'success' ? 'text-[var(--success)]' :
                    'text-[var(--warning)]'
                  }`} />
                </div>
                <Activity className="w-4 h-4 text-[var(--text-muted)]" />
              </div>
              <div className="text-2xl font-semibold text-[var(--text-primary)] mb-1 tracking-tight">{stat.value}</div>
              <div className="text-sm text-[var(--text-tertiary)]">{stat.label}</div>
              <div className="text-xs text-[var(--success)] mt-2 font-medium">{stat.change}</div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Searches */}
          <div className="lg:col-span-2 bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-light)] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-light)]">
              <h2 className="font-semibold text-[var(--text-primary)]">Recent Searches</h2>
              <Link href="/searches" className="text-sm text-[var(--accent)] hover:text-[var(--accent-hover)] flex items-center gap-1 font-medium transition-colors">
                View all
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="divide-y divide-[var(--border-light)]">
              {recentSearches.map((search) => (
                <Link
                  key={search.id}
                  href={`/searches/${search.id}`}
                  className="flex items-center justify-between px-5 py-4 hover:bg-[var(--bg-secondary)] transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--text-primary)] truncate group-hover:text-[var(--accent)] transition-colors">
                      {search.query}
                    </p>
                    <p className="text-xs text-[var(--text-muted)] mt-1">{search.createdAt}</p>
                  </div>
                  <div className="flex items-center gap-4 ml-4">
                    <span className="text-sm text-[var(--text-secondary)] font-medium">{search.results} results</span>
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                      search.status === 'completed'
                        ? 'bg-[var(--success-light)] text-[var(--success)]'
                        : 'bg-[var(--accent-light)] text-[var(--accent)]'
                    }`}>
                      {search.status === 'running' && (
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-current mr-1.5 animate-pulse" />
                      )}
                      {search.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Top Candidates */}
          <div className="bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-light)] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-light)]">
              <h2 className="font-semibold text-[var(--text-primary)]">Top Matches</h2>
            </div>
            <div className="divide-y divide-[var(--border-light)]">
              {topCandidates.map((candidate, i) => (
                <div key={i} className="px-5 py-3.5 hover:bg-[var(--bg-secondary)] transition-colors cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent-hover)] flex items-center justify-center text-white text-sm font-medium shadow-sm">
                      {candidate.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                        {candidate.name}
                      </p>
                      <p className="text-xs text-[var(--text-tertiary)]">
                        {candidate.position} at {candidate.company}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-[var(--success)]">{candidate.match}%</span>
                      <ExternalLink className="w-4 h-4 text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-5 py-3 border-t border-[var(--border-light)] bg-[var(--bg-secondary)]">
              <Link
                href="/search"
                className="text-sm text-[var(--accent)] hover:text-[var(--accent-hover)] flex items-center gap-1 font-medium transition-colors"
              >
                Find more candidates
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent-hover)] rounded-xl p-6 text-white shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold mb-1">Ready to find your next hire?</h3>
              <p className="text-white/80 text-sm">
                Describe your ideal candidate and let AI do the heavy lifting.
              </p>
            </div>
            <Link
              href="/search"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-[var(--accent)] text-sm font-semibold rounded-lg hover:bg-white/90 transition-colors whitespace-nowrap shadow-sm"
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
