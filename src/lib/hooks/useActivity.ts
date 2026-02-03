'use client';

import { useCallback } from 'react';
import { getSupabase } from '@/lib/supabase';
import { useAuth } from './useAuth';

export type ActivityType =
  | 'search_created'
  | 'search_completed'
  | 'search_failed'
  | 'candidate_saved'
  | 'candidate_updated'
  | 'candidate_deleted'
  | 'candidate_stage_changed'
  | 'list_created'
  | 'list_updated'
  | 'list_deleted'
  | 'list_member_added'
  | 'list_member_removed'
  | 'comment_added'
  | 'export_completed';

// Activity metadata type that's compatible with Supabase Json
type ActivityMetadata = { [key: string]: string | number | boolean | null | undefined | string[] };

interface LogActivityParams {
  activityType: ActivityType;
  title: string;
  description?: string;
  candidateId?: string;
  metadata?: ActivityMetadata;
}

export function useActivity() {
  const { user } = useAuth();
  const supabase = getSupabase();

  const logActivity = useCallback(async (params: LogActivityParams): Promise<boolean> => {
    if (!supabase || !user) return false;

    try {
      // Convert metadata to a JSON-compatible format
      const metadata = params.metadata
        ? JSON.parse(JSON.stringify(params.metadata))
        : null;

      // Derive entity_type from activity_type
      const entityType = params.activityType.startsWith('search_') ? 'search' :
                        params.activityType.startsWith('candidate_') ? 'candidate' :
                        params.activityType.startsWith('list_') ? 'list' :
                        params.activityType.startsWith('comment_') ? 'comment' : 'other';

      const { error } = await supabase
        .from('activity')
        .insert({
          user_id: user.id,
          action: params.activityType,
          entity_type: entityType,
          activity_type: params.activityType,
          title: params.title,
          description: params.description || null,
          candidate_id: params.candidateId || null,
          metadata,
        });

      if (error) {
        console.error('Failed to log activity:', error);
        return false;
      }

      return true;
    } catch (err) {
      console.error('Error logging activity:', err);
      return false;
    }
  }, [supabase, user]);

  // Convenience methods for common activities
  const logSearchCreated = useCallback((query: string, count: number) => {
    return logActivity({
      activityType: 'search_created',
      title: query,
      description: `Started search for "${query}"`,
      metadata: { query, count },
    });
  }, [logActivity]);

  const logSearchCompleted = useCallback((query: string, resultsCount: number) => {
    return logActivity({
      activityType: 'search_completed',
      title: query,
      description: `Search completed with ${resultsCount} results`,
      metadata: { query, results_count: resultsCount },
    });
  }, [logActivity]);

  const logSearchFailed = useCallback((query: string, error: string) => {
    return logActivity({
      activityType: 'search_failed',
      title: query,
      description: `Search failed: ${error}`,
      metadata: { query, error },
    });
  }, [logActivity]);

  const logCandidateSaved = useCallback((name: string, candidateId: string) => {
    return logActivity({
      activityType: 'candidate_saved',
      title: name,
      description: `Saved candidate: ${name}`,
      candidateId,
      metadata: { name },
    });
  }, [logActivity]);

  const logCandidateUpdated = useCallback((name: string, candidateId: string, changes?: string[]) => {
    return logActivity({
      activityType: 'candidate_updated',
      title: name,
      description: `Updated candidate: ${name}`,
      candidateId,
      metadata: { name, changes },
    });
  }, [logActivity]);

  const logCandidateDeleted = useCallback((name: string, candidateId?: string) => {
    return logActivity({
      activityType: 'candidate_deleted',
      title: name,
      description: `Deleted candidate: ${name}`,
      candidateId,
      metadata: { name },
    });
  }, [logActivity]);

  const logCandidateStageChanged = useCallback((name: string, stage: string, candidateId: string) => {
    return logActivity({
      activityType: 'candidate_stage_changed',
      title: name,
      description: `Changed ${name} to "${stage}" stage`,
      candidateId,
      metadata: { name, stage },
    });
  }, [logActivity]);

  const logListCreated = useCallback((name: string) => {
    return logActivity({
      activityType: 'list_created',
      title: name,
      description: `Created list: "${name}"`,
      metadata: { name },
    });
  }, [logActivity]);

  const logListUpdated = useCallback((name: string) => {
    return logActivity({
      activityType: 'list_updated',
      title: name,
      description: `Updated list: "${name}"`,
      metadata: { name },
    });
  }, [logActivity]);

  const logListDeleted = useCallback((name: string) => {
    return logActivity({
      activityType: 'list_deleted',
      title: name,
      description: `Deleted list: "${name}"`,
      metadata: { name },
    });
  }, [logActivity]);

  const logListMemberAdded = useCallback((candidateName: string, listName: string, candidateId?: string) => {
    return logActivity({
      activityType: 'list_member_added',
      title: candidateName,
      description: `Added ${candidateName} to "${listName}"`,
      candidateId,
      metadata: { candidate_name: candidateName, list_name: listName },
    });
  }, [logActivity]);

  const logListMemberRemoved = useCallback((candidateName: string, listName: string, candidateId?: string) => {
    return logActivity({
      activityType: 'list_member_removed',
      title: candidateName,
      description: `Removed ${candidateName} from "${listName}"`,
      candidateId,
      metadata: { candidate_name: candidateName, list_name: listName },
    });
  }, [logActivity]);

  const logCommentAdded = useCallback((candidateName: string, candidateId: string) => {
    return logActivity({
      activityType: 'comment_added',
      title: candidateName,
      description: `Added note to ${candidateName}`,
      candidateId,
      metadata: { candidate_name: candidateName },
    });
  }, [logActivity]);

  const logExportCompleted = useCallback((count: number, format: string) => {
    return logActivity({
      activityType: 'export_completed',
      title: `Export ${count} candidates`,
      description: `Exported ${count} candidates as ${format.toUpperCase()}`,
      metadata: { count, format },
    });
  }, [logActivity]);

  return {
    logActivity,
    logSearchCreated,
    logSearchCompleted,
    logSearchFailed,
    logCandidateSaved,
    logCandidateUpdated,
    logCandidateDeleted,
    logCandidateStageChanged,
    logListCreated,
    logListUpdated,
    logListDeleted,
    logListMemberAdded,
    logListMemberRemoved,
    logCommentAdded,
    logExportCompleted,
  };
}
