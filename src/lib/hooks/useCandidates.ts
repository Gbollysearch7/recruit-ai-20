'use client';

import { useState, useCallback, useEffect } from 'react';
import { getSupabase, type Candidate, type CandidateComment } from '@/lib/supabase';
import { useAuth } from './useAuth';

interface SaveCandidateParams {
  name: string;
  email?: string;
  title?: string;
  company?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  avatar?: string;
  summary?: string;
  skills?: string[];
  matchScore?: number;
  source?: string;
  tags?: string[];
}

export function useCandidates() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isConfigured } = useAuth();
  const supabase = getSupabase();

  // Fetch user's saved candidates
  const fetchCandidates = useCallback(async () => {
    if (!supabase || !user) {
      setCandidates([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('candidates')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCandidates(data || []);
    } catch (err) {
      console.error('Failed to fetch candidates:', err);
      setCandidates([]);
    } finally {
      setIsLoading(false);
    }
  }, [supabase, user]);

  // Save a candidate
  const saveCandidate = useCallback(async (params: SaveCandidateParams): Promise<Candidate | null> => {
    if (!supabase || !user) return null;

    try {
      const { data, error } = await supabase
        .from('candidates')
        .insert({
          user_id: user.id,
          name: params.name,
          email: params.email,
          title: params.title,
          company: params.company,
          location: params.location,
          linkedin: params.linkedin,
          github: params.github,
          avatar: params.avatar,
          summary: params.summary,
          skills: params.skills || [],
          match_score: params.matchScore,
          source: params.source || 'exa_search',
          tags: params.tags || [],
        })
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setCandidates(prev => [data, ...prev]);
      return data;
    } catch (err) {
      console.error('Failed to save candidate:', err);
      return null;
    }
  }, [supabase, user]);

  // Save multiple candidates (bulk)
  const saveCandidates = useCallback(async (paramsArray: SaveCandidateParams[]): Promise<Candidate[]> => {
    if (!supabase || !user || paramsArray.length === 0) return [];

    try {
      const inserts = paramsArray.map(params => ({
        user_id: user.id,
        name: params.name,
        email: params.email,
        title: params.title,
        company: params.company,
        location: params.location,
        linkedin: params.linkedin,
        github: params.github,
        avatar: params.avatar,
        summary: params.summary,
        skills: params.skills || [],
        match_score: params.matchScore,
        source: params.source || 'exa_search',
        tags: params.tags || [],
      }));

      const { data, error } = await supabase
        .from('candidates')
        .insert(inserts)
        .select();

      if (error) throw error;

      // Update local state
      setCandidates(prev => [...(data || []), ...prev]);
      return data || [];
    } catch (err) {
      console.error('Failed to save candidates in bulk:', err);
      return [];
    }
  }, [supabase, user]);

  // Update a candidate
  const updateCandidate = useCallback(async (id: string, params: Partial<SaveCandidateParams>): Promise<Candidate | null> => {
    if (!supabase || !user) return null;

    try {
      const updateData: Record<string, unknown> = {};
      if (params.name !== undefined) updateData.name = params.name;
      if (params.email !== undefined) updateData.email = params.email;
      if (params.title !== undefined) updateData.title = params.title;
      if (params.company !== undefined) updateData.company = params.company;
      if (params.location !== undefined) updateData.location = params.location;
      if (params.linkedin !== undefined) updateData.linkedin = params.linkedin;
      if (params.github !== undefined) updateData.github = params.github;
      if (params.avatar !== undefined) updateData.avatar = params.avatar;
      if (params.summary !== undefined) updateData.summary = params.summary;
      if (params.skills !== undefined) updateData.skills = params.skills;
      if (params.matchScore !== undefined) updateData.match_score = params.matchScore;
      if (params.tags !== undefined) updateData.tags = params.tags;

      const { data, error } = await supabase
        .from('candidates')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setCandidates(prev => prev.map(c => c.id === id ? data : c));
      return data;
    } catch (err) {
      console.error('Failed to update candidate:', err);
      return null;
    }
  }, [supabase, user]);

  // Delete a candidate
  const deleteCandidate = useCallback(async (id: string): Promise<boolean> => {
    if (!supabase || !user) return false;

    try {
      const { error } = await supabase
        .from('candidates')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      // Update local state
      setCandidates(prev => prev.filter(c => c.id !== id));
      return true;
    } catch (err) {
      console.error('Failed to delete candidate:', err);
      return false;
    }
  }, [supabase, user]);

  // Get a single candidate
  const getCandidate = useCallback(async (id: string): Promise<Candidate | null> => {
    if (!supabase || !user) return null;

    try {
      const { data, error } = await supabase
        .from('candidates')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Failed to get candidate:', err);
      return null;
    }
  }, [supabase, user]);

  // Search candidates
  const searchCandidates = useCallback(async (query: string): Promise<Candidate[]> => {
    if (!supabase || !user || !query.trim()) return candidates;

    try {
      const { data, error } = await supabase
        .from('candidates')
        .select('*')
        .eq('user_id', user.id)
        .or(`name.ilike.%${query}%,email.ilike.%${query}%,title.ilike.%${query}%,company.ilike.%${query}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Failed to search candidates:', err);
      return [];
    }
  }, [supabase, user, candidates]);

  // Get candidate comments/notes
  const getCandidateComments = useCallback(async (candidateId: string): Promise<CandidateComment[]> => {
    if (!supabase || !user) return [];

    try {
      const { data, error } = await supabase
        .from('candidate_comments')
        .select('*')
        .eq('candidate_id', candidateId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Failed to get candidate comments:', err);
      return [];
    }
  }, [supabase, user]);

  // Add a comment/note to a candidate
  const addCandidateComment = useCallback(async (candidateId: string, content: string): Promise<CandidateComment | null> => {
    if (!supabase || !user) return null;

    try {
      const { data, error } = await supabase
        .from('candidate_comments')
        .insert({
          candidate_id: candidateId,
          user_id: user.id,
          content,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Failed to add candidate comment:', err);
      return null;
    }
  }, [supabase, user]);

  // Update a comment
  const updateCandidateComment = useCallback(async (commentId: string, content: string): Promise<CandidateComment | null> => {
    if (!supabase || !user) return null;

    try {
      const { data, error } = await supabase
        .from('candidate_comments')
        .update({ content })
        .eq('id', commentId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Failed to update candidate comment:', err);
      return null;
    }
  }, [supabase, user]);

  // Delete a comment
  const deleteCandidateComment = useCallback(async (commentId: string): Promise<boolean> => {
    if (!supabase || !user) return false;

    try {
      const { error } = await supabase
        .from('candidate_comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', user.id);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Failed to delete candidate comment:', err);
      return false;
    }
  }, [supabase, user]);

  // Update candidate stage
  const updateCandidateStage = useCallback(async (id: string, stage: string): Promise<Candidate | null> => {
    if (!supabase || !user) return null;

    try {
      const { data, error } = await supabase
        .from('candidates')
        .update({ stage })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setCandidates(prev => prev.map(c => c.id === id ? data : c));
      return data;
    } catch (err) {
      console.error('Failed to update candidate stage:', err);
      return null;
    }
  }, [supabase, user]);

  // Fetch candidates on mount and when user changes
  useEffect(() => {
    if (isConfigured && user) {
      fetchCandidates();
    } else {
      setCandidates([]);
      setIsLoading(false);
    }
  }, [isConfigured, user, fetchCandidates]);

  return {
    candidates,
    isLoading,
    fetchCandidates,
    saveCandidate,
    saveCandidates,
    updateCandidate,
    deleteCandidate,
    getCandidate,
    searchCandidates,
    getCandidateComments,
    addCandidateComment,
    updateCandidateComment,
    deleteCandidateComment,
    updateCandidateStage,
  };
}
