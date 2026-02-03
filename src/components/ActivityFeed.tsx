'use client';

import { useState, useEffect, useCallback } from 'react';
import { getSupabase, type Activity } from '@/lib/supabase';
import { useAuth } from '@/lib/hooks/useAuth';

interface ActivityFeedProps {
  limit?: number;
  candidateId?: string;
  searchId?: string;
  listId?: string;
  showHeader?: boolean;
}

const activityIcons: Record<string, string> = {
  'search_created': 'search',
  'search_completed': 'check_circle',
  'search_failed': 'error',
  'candidate_saved': 'bookmark',
  'candidate_updated': 'edit',
  'candidate_deleted': 'delete',
  'candidate_stage_changed': 'swap_horiz',
  'list_created': 'playlist_add',
  'list_updated': 'edit',
  'list_deleted': 'delete',
  'list_member_added': 'person_add',
  'list_member_removed': 'person_remove',
  'comment_added': 'comment',
  'export_completed': 'download',
  'default': 'radio_button_checked',
};

const activityColors: Record<string, string> = {
  'search_created': 'text-[var(--primary)]',
  'search_completed': 'text-[var(--success)]',
  'search_failed': 'text-[var(--error)]',
  'candidate_saved': 'text-[var(--primary)]',
  'candidate_deleted': 'text-[var(--error)]',
  'list_created': 'text-[var(--primary)]',
  'list_deleted': 'text-[var(--error)]',
  'default': 'text-[var(--text-muted)]',
};

export function ActivityFeed({ limit = 10, candidateId, searchId, listId, showHeader = true }: ActivityFeedProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isConfigured } = useAuth();
  const supabase = getSupabase();

  const fetchActivities = useCallback(async () => {
    if (!supabase || !user) {
      setActivities([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      let query = supabase
        .from('activity')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (candidateId) {
        query = query.eq('candidate_id', candidateId);
      }
      if (searchId) {
        query = query.eq('search_id', searchId);
      }
      if (listId) {
        query = query.eq('list_id', listId);
      }

      const { data, error } = await query;
      if (error) throw error;
      setActivities(data || []);
    } catch {
      setActivities([]);
    } finally {
      setIsLoading(false);
    }
  }, [supabase, user, limit, candidateId, searchId, listId]);

  useEffect(() => {
    if (isConfigured && user) {
      fetchActivities();
    } else {
      setActivities([]);
      setIsLoading(false);
    }
  }, [isConfigured, user, fetchActivities]);

  const formatTime = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getActivityMessage = (activity: Activity) => {
    // Use title and description from the activity if available
    if (activity.description) {
      return activity.description;
    }

    // Fallback to constructing message from activity_type and metadata
    const metadata = activity.metadata as Record<string, unknown> | null;
    switch (activity.activity_type) {
      case 'search_created':
        return `Started search: "${metadata?.query || activity.title}"`;
      case 'search_completed':
        return `Search completed: ${metadata?.results_count || 0} results found`;
      case 'search_failed':
        return `Search failed: ${metadata?.error || 'Unknown error'}`;
      case 'candidate_saved':
        return `Saved candidate: ${metadata?.name || activity.title}`;
      case 'candidate_updated':
        return `Updated candidate: ${metadata?.name || activity.title}`;
      case 'candidate_deleted':
        return `Deleted candidate: ${metadata?.name || activity.title}`;
      case 'candidate_stage_changed':
        return `Changed stage to "${metadata?.stage || 'Unknown'}" for ${metadata?.name || 'candidate'}`;
      case 'list_created':
        return `Created list: "${metadata?.name || activity.title}"`;
      case 'list_updated':
        return `Updated list: "${metadata?.name || activity.title}"`;
      case 'list_deleted':
        return `Deleted list: "${metadata?.name || activity.title}"`;
      case 'list_member_added':
        return `Added ${metadata?.candidate_name || 'candidate'} to "${metadata?.list_name || 'list'}"`;
      case 'list_member_removed':
        return `Removed ${metadata?.candidate_name || 'candidate'} from "${metadata?.list_name || 'list'}"`;
      case 'comment_added':
        return `Added note to ${metadata?.candidate_name || 'candidate'}`;
      case 'export_completed':
        return `Exported ${metadata?.count || 0} candidates`;
      default:
        return activity.title;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3 animate-pulse">
        {showHeader && (
          <div className="flex items-center justify-between">
            <div className="w-24 h-4 bg-[var(--bg-surface)] rounded" />
          </div>
        )}
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-start gap-3 p-2">
            <div className="w-6 h-6 bg-[var(--bg-surface)] rounded-full" />
            <div className="flex-1">
              <div className="w-3/4 h-3 bg-[var(--bg-surface)] rounded mb-1" />
              <div className="w-16 h-2 bg-[var(--bg-surface)] rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-6">
        <span className="material-icons-outlined text-3xl text-[var(--text-muted)] mb-2 block">history</span>
        <p className="text-xs text-[var(--text-muted)]">No activity yet</p>
      </div>
    );
  }

  return (
    <div>
      {showHeader && (
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-[var(--text-primary)]">Recent Activity</h3>
          <button
            onClick={fetchActivities}
            className="p-1 rounded hover:bg-[var(--bg-surface)] text-[var(--text-muted)]"
            title="Refresh"
          >
            <span className="material-icons-outlined text-sm">refresh</span>
          </button>
        </div>
      )}

      <div className="space-y-1">
        {activities.map((activity, index) => {
          const activityType = activity.activity_type || 'default';
          const icon = activityIcons[activityType] || activityIcons.default;
          const color = activityColors[activityType] || activityColors.default;

          return (
            <div
              key={activity.id}
              className="flex items-start gap-3 p-2 rounded hover:bg-[var(--bg-surface)] transition-colors group"
            >
              <div className="relative">
                <div className={`w-6 h-6 rounded-full bg-[var(--bg-surface)] flex items-center justify-center ${color}`}>
                  <span className="material-icons-outlined text-xs">{icon}</span>
                </div>
                {index < activities.length - 1 && (
                  <div className="absolute top-6 left-1/2 w-px h-4 bg-[var(--border-light)] -translate-x-1/2" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-[var(--text-primary)] leading-relaxed">
                  {getActivityMessage(activity)}
                </p>
                <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
                  {formatTime(activity.created_at)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Compact inline activity indicator
export function ActivityIndicator({ count = 0 }: { count?: number }) {
  if (count === 0) return null;

  return (
    <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-[var(--primary-light)] rounded-full">
      <span className="material-icons-outlined text-xs text-[var(--primary)]">notifications</span>
      <span className="text-[10px] font-medium text-[var(--primary)]">{count}</span>
    </div>
  );
}
