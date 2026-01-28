'use client';

import { useState, useCallback, useEffect } from 'react';
import { getSupabase, type Candidate } from '@/lib/supabase';
import { useAuth } from './useAuth';

export interface PipelineStage {
  id: string;
  name: string;
  color: string;
  stage_order: number;
  user_id: string | null;
  created_at: string | null;
}

export interface PipelineCandidate extends Candidate {
  stage: string | null;
}

// Default stages for new users
const DEFAULT_STAGES: Omit<PipelineStage, 'id' | 'user_id' | 'created_at'>[] = [
  { name: 'New', color: '#6366f1', stage_order: 0 },
  { name: 'Contacted', color: '#f59e0b', stage_order: 1 },
  { name: 'Interviewing', color: '#8b5cf6', stage_order: 2 },
  { name: 'Offer', color: '#22c55e', stage_order: 3 },
  { name: 'Hired', color: '#10b981', stage_order: 4 },
  { name: 'Rejected', color: '#ef4444', stage_order: 5 },
];

export function usePipeline() {
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [candidates, setCandidates] = useState<PipelineCandidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingCandidates, setIsLoadingCandidates] = useState(true);
  const { user, isConfigured } = useAuth();
  const supabase = getSupabase();

  // Fetch pipeline stages
  const fetchStages = useCallback(async () => {
    if (!supabase || !user) {
      setStages([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('pipeline_stages')
        .select('*')
        .eq('user_id', user.id)
        .order('stage_order', { ascending: true });

      if (error) throw error;

      // If no stages exist, create default stages
      if (!data || data.length === 0) {
        await createDefaultStages();
        return;
      }

      // Map data to ensure non-null values for required fields
      const mappedStages: PipelineStage[] = data.map(stage => ({
        ...stage,
        color: stage.color || '#6366f1', // Default color if null
      }));

      setStages(mappedStages);
    } catch (err) {
      console.error('Error fetching stages:', err);
      setStages([]);
    } finally {
      setIsLoading(false);
    }
  }, [supabase, user]);

  // Create default stages for new users
  const createDefaultStages = useCallback(async () => {
    if (!supabase || !user) return;

    try {
      const stagesToInsert = DEFAULT_STAGES.map(stage => ({
        ...stage,
        user_id: user.id,
      }));

      const { data, error } = await supabase
        .from('pipeline_stages')
        .insert(stagesToInsert)
        .select();

      if (error) throw error;

      // Map data to ensure non-null values for required fields
      const mappedStages: PipelineStage[] = (data || []).map(stage => ({
        ...stage,
        color: stage.color || '#6366f1',
      }));
      setStages(mappedStages);
    } catch (err) {
      console.error('Error creating default stages:', err);
    }
  }, [supabase, user]);

  // Fetch candidates for pipeline
  const fetchCandidates = useCallback(async () => {
    if (!supabase || !user) {
      setCandidates([]);
      setIsLoadingCandidates(false);
      return;
    }

    setIsLoadingCandidates(true);
    try {
      const { data, error } = await supabase
        .from('candidates')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCandidates(data || []);
    } catch (err) {
      console.error('Error fetching candidates:', err);
      setCandidates([]);
    } finally {
      setIsLoadingCandidates(false);
    }
  }, [supabase, user]);

  // Move candidate to a different stage
  const moveCandidate = useCallback(async (candidateId: string, newStage: string): Promise<boolean> => {
    if (!supabase || !user) return false;

    try {
      const { error } = await supabase
        .from('candidates')
        .update({ stage: newStage, updated_at: new Date().toISOString() })
        .eq('id', candidateId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Update local state
      setCandidates(prev =>
        prev.map(c => c.id === candidateId ? { ...c, stage: newStage } : c)
      );

      // Log activity
      await supabase.from('activities').insert({
        user_id: user.id,
        candidate_id: candidateId,
        activity_type: 'stage_change',
        title: `Moved to ${newStage}`,
        description: `Candidate moved to ${newStage} stage`,
        metadata: { new_stage: newStage },
      });

      return true;
    } catch (err) {
      console.error('Error moving candidate:', err);
      return false;
    }
  }, [supabase, user]);

  // Add a new stage
  const addStage = useCallback(async (name: string, color: string): Promise<PipelineStage | null> => {
    if (!supabase || !user) return null;

    try {
      const maxOrder = stages.length > 0 ? Math.max(...stages.map(s => s.stage_order)) : -1;

      const { data, error } = await supabase
        .from('pipeline_stages')
        .insert({
          name,
          color,
          stage_order: maxOrder + 1,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      const mappedStage: PipelineStage = {
        ...data,
        color: data.color || color,
      };
      setStages(prev => [...prev, mappedStage]);
      return mappedStage;
    } catch (err) {
      console.error('Error adding stage:', err);
      return null;
    }
  }, [supabase, user, stages]);

  // Update a stage
  const updateStage = useCallback(async (stageId: string, updates: { name?: string; color?: string }): Promise<boolean> => {
    if (!supabase || !user) return false;

    try {
      const { error } = await supabase
        .from('pipeline_stages')
        .update(updates)
        .eq('id', stageId)
        .eq('user_id', user.id);

      if (error) throw error;

      setStages(prev => prev.map(s => s.id === stageId ? { ...s, ...updates } : s));
      return true;
    } catch (err) {
      console.error('Error updating stage:', err);
      return false;
    }
  }, [supabase, user]);

  // Delete a stage
  const deleteStage = useCallback(async (stageId: string): Promise<boolean> => {
    if (!supabase || !user) return false;

    try {
      // First, move all candidates in this stage to "New" or first stage
      const stageToDelete = stages.find(s => s.id === stageId);
      if (stageToDelete) {
        const firstStage = stages.find(s => s.stage_order === 0) || stages[0];
        if (firstStage && firstStage.id !== stageId) {
          await supabase
            .from('candidates')
            .update({ stage: firstStage.name })
            .eq('stage', stageToDelete.name)
            .eq('user_id', user.id);
        }
      }

      const { error } = await supabase
        .from('pipeline_stages')
        .delete()
        .eq('id', stageId)
        .eq('user_id', user.id);

      if (error) throw error;

      setStages(prev => prev.filter(s => s.id !== stageId));
      return true;
    } catch (err) {
      console.error('Error deleting stage:', err);
      return false;
    }
  }, [supabase, user, stages]);

  // Reorder stages
  const reorderStages = useCallback(async (reorderedStages: PipelineStage[]): Promise<boolean> => {
    if (!supabase || !user) return false;

    try {
      const updates = reorderedStages.map((stage, index) => ({
        id: stage.id,
        stage_order: index,
      }));

      for (const update of updates) {
        await supabase
          .from('pipeline_stages')
          .update({ stage_order: update.stage_order })
          .eq('id', update.id)
          .eq('user_id', user.id);
      }

      setStages(reorderedStages.map((s, i) => ({ ...s, stage_order: i })));
      return true;
    } catch (err) {
      console.error('Error reordering stages:', err);
      return false;
    }
  }, [supabase, user]);

  // Get candidates by stage
  const getCandidatesByStage = useCallback((stageName: string) => {
    return candidates.filter(c => c.stage === stageName || (!c.stage && stageName === 'New'));
  }, [candidates]);

  // Get pipeline stats
  const getPipelineStats = useCallback(() => {
    const stats = stages.map(stage => {
      const count = candidates.filter(c =>
        c.stage === stage.name || (!c.stage && stage.name === 'New')
      ).length;
      return {
        ...stage,
        count,
        percentage: candidates.length > 0 ? (count / candidates.length) * 100 : 0,
      };
    });

    // Calculate conversion rates
    const conversions = stats.map((stage, index) => {
      if (index === 0) return { ...stage, conversionRate: 100 };
      const prevCount = stats[index - 1].count;
      const conversionRate = prevCount > 0 ? (stage.count / prevCount) * 100 : 0;
      return { ...stage, conversionRate };
    });

    return conversions;
  }, [stages, candidates]);

  // Add candidate to pipeline
  const addCandidateToPipeline = useCallback(async (candidate: {
    name: string;
    email?: string;
    title?: string;
    company?: string;
    linkedin?: string;
    source?: string;
    stage?: string;
  }): Promise<PipelineCandidate | null> => {
    if (!supabase || !user) return null;

    try {
      const { data, error } = await supabase
        .from('candidates')
        .insert({
          ...candidate,
          user_id: user.id,
          stage: candidate.stage || 'New',
        })
        .select()
        .single();

      if (error) throw error;

      setCandidates(prev => [data, ...prev]);

      // Log activity
      await supabase.from('activities').insert({
        user_id: user.id,
        candidate_id: data.id,
        activity_type: 'candidate_added',
        title: 'Added to pipeline',
        description: `${candidate.name} added to pipeline`,
      });

      return data;
    } catch (err) {
      console.error('Error adding candidate:', err);
      return null;
    }
  }, [supabase, user]);

  // Initialize
  useEffect(() => {
    if (isConfigured && user) {
      fetchStages();
      fetchCandidates();
    } else {
      setStages([]);
      setCandidates([]);
      setIsLoading(false);
      setIsLoadingCandidates(false);
    }
  }, [isConfigured, user, fetchStages, fetchCandidates]);

  return {
    stages,
    candidates,
    isLoading,
    isLoadingCandidates,
    fetchStages,
    fetchCandidates,
    moveCandidate,
    addStage,
    updateStage,
    deleteStage,
    reorderStages,
    getCandidatesByStage,
    getPipelineStats,
    addCandidateToPipeline,
  };
}
