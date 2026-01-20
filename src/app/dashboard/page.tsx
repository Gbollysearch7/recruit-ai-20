'use client';

import { AppLayout } from '@/components/AppLayout';
import Link from 'next/link';

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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-[var(--text-primary)] tracking-tight">Dashboard</h1>
            <p className="text-sm text-[var(--text-secondary)] mt-0.5">Welcome back! Here's your recruiting overview.</p>
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
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Searches', value: '24', change: '+3 this week', icon: 'search', color: 'primary' },
            { label: 'Candidates Found', value: '847', change: '+156 this week', icon: 'group', color: 'success' },
            { label: 'Avg. Match Rate', value: '94%', change: '+2% vs last month', icon: 'trending_up', color: 'warning' },
            { label: 'Time Saved', value: '48h', change: 'This month', icon: 'schedule', color: 'primary' },
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
              <div className="text-xs text-[var(--success)] mt-1.5 font-medium">{stat.change}</div>
            </div>
          ))}
        </div>

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
            <div className="divide-y divide-[var(--border-light)]">
              {recentSearches.map((search) => (
                <Link
                  key={search.id}
                  href={`/searches/${search.id}`}
                  className="flex items-center justify-between px-4 py-3 hover:bg-[var(--bg-surface)] transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-[var(--text-primary)] truncate group-hover:text-[var(--primary)] transition-colors">
                      {search.query}
                    </p>
                    <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{search.createdAt}</p>
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <span className="text-xs text-[var(--text-secondary)] font-medium">{search.results} results</span>
                    <span className={`px-2 py-0.5 text-[10px] font-medium rounded ${
                      search.status === 'completed'
                        ? 'bg-[var(--success-bg)] text-[var(--success-text)]'
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
          </div>

          {/* Top Candidates */}
          <div className="bg-[var(--bg-elevated)] rounded-lg border border-[var(--border-light)] overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-light)]">
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">Top Matches</h2>
            </div>
            <div className="divide-y divide-[var(--border-light)]">
              {topCandidates.map((candidate, i) => (
                <div key={i} className="px-4 py-3 hover:bg-[var(--bg-surface)] transition-colors cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md bg-[var(--primary)] flex items-center justify-center text-white text-xs font-medium">
                      {candidate.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-[var(--text-primary)] group-hover:text-[var(--primary)] transition-colors">
                        {candidate.name}
                      </p>
                      <p className="text-[10px] text-[var(--text-tertiary)]">
                        {candidate.position} at {candidate.company}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-[var(--success)]">{candidate.match}%</span>
                      <span className="material-icons-outlined text-sm text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity">open_in_new</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
