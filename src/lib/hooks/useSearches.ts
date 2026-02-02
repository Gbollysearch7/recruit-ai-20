'use client';

import { useState, useCallback, useEffect } from 'react';
import { getSupabase, type ExaSearch } from '@/lib/supabase';
import { useAuth } from './useAuth';

interface CreateSearchParams {
  name: string;
  query: string;
  count?: number;
  criteria?: string[];
  enrichments?: Array<{ description: string; format: string }>;
  exaWebsetId?: string;
}

interface UpdateSearchParams {
  id: string;
  status?: 'running' | 'completed' | 'failed' | 'cancelled';
  results?: unknown[];
  resultsCount?: number;
  errorMessage?: string;
  completedAt?: string;
}

export function useSearches() {
  const [searches, setSearches] = useState<ExaSearch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isConfigured } = useAuth();
  const supabase = getSupabase();

  // Fetch user's searches
  const fetchSearches = useCallback(async () => {
    if (!supabase || !user) {
      setSearches([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('exa_searches')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSearches(data || []);
    } catch (err) {
      console.error('Failed to fetch searches:', err);
      setSearches([]);
    } finally {
      setIsLoading(false);
    }
  }, [supabase, user]);

  // Create a new search
  const createSearch = useCallback(async (params: CreateSearchParams): Promise<ExaSearch | null> => {
    if (!supabase || !user) return null;

    try {
      const { data, error } = await supabase
        .from('exa_searches')
        .insert({
          user_id: user.id,
          name: params.name,
          query: params.query,
          count: params.count || 20,
          criteria: params.criteria || [],
          enrichments: params.enrichments || [],
          exa_webset_id: params.exaWebsetId,
          status: 'running',
        })
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setSearches(prev => [data, ...prev]);
      return data;
    } catch (err) {
      console.error('Failed to create search:', err);
      return null;
    }
  }, [supabase, user]);

  // Update a search
  const updateSearch = useCallback(async (params: UpdateSearchParams): Promise<ExaSearch | null> => {
    if (!supabase || !user) return null;

    try {
      const updateData: Record<string, unknown> = {};
      if (params.status !== undefined) updateData.status = params.status;
      if (params.results !== undefined) updateData.results = params.results;
      if (params.resultsCount !== undefined) updateData.results_count = params.resultsCount;
      if (params.errorMessage !== undefined) updateData.error_message = params.errorMessage;
      if (params.completedAt !== undefined) updateData.completed_at = params.completedAt;

      const { data, error } = await supabase
        .from('exa_searches')
        .update(updateData)
        .eq('id', params.id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setSearches(prev => prev.map(s => s.id === params.id ? data : s));
      return data;
    } catch (err) {
      console.error('Failed to update search:', err);
      return null;
    }
  }, [supabase, user]);

  // Delete a search
  const deleteSearch = useCallback(async (id: string): Promise<boolean> => {
    if (!supabase || !user) return false;

    try {
      const { error } = await supabase
        .from('exa_searches')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      // Update local state
      setSearches(prev => prev.filter(s => s.id !== id));
      return true;
    } catch (err) {
      console.error('Failed to delete search:', err);
      return false;
    }
  }, [supabase, user]);

  // Get a single search by ID (supports both internal id and exa_webset_id)
  const getSearch = useCallback(async (id: string): Promise<ExaSearch | null> => {
    if (!supabase) return null;

    try {
      // First try by exa_webset_id (most common when coming from search URLs)
      const { data: dataByWebsetId, error: websetError } = await supabase
        .from('exa_searches')
        .select('*')
        .eq('exa_webset_id', id)
        .maybeSingle();

      if (!websetError && dataByWebsetId) {
        return dataByWebsetId;
      }

      // Fall back to internal id
      const { data, error } = await supabase
        .from('exa_searches')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Failed to get search:', err);
      return null;
    }
  }, [supabase]);

  // Get a search by share ID (for shared searches)
  const getSearchByShareId = useCallback(async (shareId: string): Promise<ExaSearch | null> => {
    if (!supabase) return null;

    try {
      const { data, error } = await supabase
        .from('exa_searches')
        .select('*')
        .eq('share_id', shareId)
        .eq('is_public', true)
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Failed to get search by share ID:', err);
      return null;
    }
  }, [supabase]);

  // Generate a share link for a search
  const shareSearch = useCallback(async (id: string): Promise<string | null> => {
    if (!supabase || !user) return null;

    try {
      // Generate a share ID using the database function
      const { data: shareIdData, error: shareIdError } = await supabase
        .rpc('generate_share_id');

      if (shareIdError) throw shareIdError;

      const { data, error } = await supabase
        .from('exa_searches')
        .update({ share_id: shareIdData, is_public: true })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setSearches(prev => prev.map(s => s.id === id ? data : s));

      // Return the share URL
      const baseUrl = typeof window !== 'undefined'
        ? window.location.origin
        : process.env.NEXT_PUBLIC_APP_URL || '';
      return `${baseUrl}/shared/${shareIdData}`;
    } catch (err) {
      console.error('Failed to share search:', err);
      return null;
    }
  }, [supabase, user]);

  // Unshare a search
  const unshareSearch = useCallback(async (id: string): Promise<boolean> => {
    if (!supabase || !user) return false;

    try {
      const { data, error } = await supabase
        .from('exa_searches')
        .update({ share_id: null, is_public: false })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setSearches(prev => prev.map(s => s.id === id ? data : s));
      return true;
    } catch (err) {
      console.error('Failed to unshare search:', err);
      return false;
    }
  }, [supabase, user]);

  // Fetch searches on mount and when user changes
  useEffect(() => {
    if (isConfigured && user) {
      fetchSearches();
    } else {
      setSearches([]);
      setIsLoading(false);
    }
  }, [isConfigured, user, fetchSearches]);

  return {
    searches,
    isLoading,
    fetchSearches,
    createSearch,
    updateSearch,
    deleteSearch,
    getSearch,
    getSearchByShareId,
    shareSearch,
    unshareSearch,
  };
}
