'use client';

import { useState, useCallback, useEffect } from 'react';
import { getSupabase, type List, type Candidate, type ListMember } from '@/lib/supabase';
import { useAuth } from './useAuth';

interface CreateListParams {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
}

interface ListMemberWithCandidate extends ListMember {
  candidate?: Candidate | null;
}

interface ListWithMembers extends List {
  members?: ListMemberWithCandidate[];
  candidateCount?: number;
}

export function useLists() {
  const [lists, setLists] = useState<ListWithMembers[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isConfigured } = useAuth();
  const supabase = getSupabase();

  // Fetch user's lists with member counts
  const fetchLists = useCallback(async () => {
    if (!supabase || !user) {
      setLists([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('lists')
        .select(`
          *,
          list_candidates(count)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform the data to include candidate count
      const listsWithCounts = (data || []).map(list => ({
        ...list,
        candidateCount: (list.list_candidates as { count: number }[] | null)?.[0]?.count || 0,
      }));

      setLists(listsWithCounts);
    } catch (err) {
      console.error('Failed to fetch lists:', err);
      setLists([]);
    } finally {
      setIsLoading(false);
    }
  }, [supabase, user]);

  // Create a new list
  const createList = useCallback(async (params: CreateListParams): Promise<List | null> => {
    if (!supabase || !user) return null;

    try {
      const { data, error } = await supabase
        .from('lists')
        .insert({
          user_id: user.id,
          name: params.name,
          description: params.description,
          color: params.color || '#6366f1',
          icon: params.icon || 'folder',
        })
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setLists(prev => [{ ...data, candidateCount: 0 }, ...prev]);
      return data;
    } catch (err) {
      console.error('Failed to create list:', err);
      return null;
    }
  }, [supabase, user]);

  // Update a list
  const updateList = useCallback(async (id: string, params: Partial<CreateListParams>): Promise<List | null> => {
    if (!supabase || !user) return null;

    try {
      const { data, error } = await supabase
        .from('lists')
        .update(params)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setLists(prev => prev.map(l => l.id === id ? { ...l, ...data } : l));
      return data;
    } catch (err) {
      console.error('Failed to update list:', err);
      return null;
    }
  }, [supabase, user]);

  // Delete a list
  const deleteList = useCallback(async (id: string): Promise<boolean> => {
    if (!supabase || !user) return false;

    try {
      const { error } = await supabase
        .from('lists')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      // Update local state
      setLists(prev => prev.filter(l => l.id !== id));
      return true;
    } catch (err) {
      console.error('Failed to delete list:', err);
      return false;
    }
  }, [supabase, user]);

  // Get list with candidates
  const getListWithCandidates = useCallback(async (listId: string): Promise<ListWithMembers | null> => {
    if (!supabase || !user) return null;

    try {
      const { data: list, error: listError } = await supabase
        .from('lists')
        .select('*')
        .eq('id', listId)
        .eq('user_id', user.id)
        .single();

      if (listError) throw listError;

      const { data: members, error: membersError } = await supabase
        .from('list_candidates')
        .select(`
          *,
          candidate:candidates(*)
        `)
        .eq('list_id', listId);

      if (membersError) throw membersError;

      return {
        ...list,
        members: members || [],
        candidateCount: members?.length || 0,
      };
    } catch (err) {
      console.error('Failed to get list with candidates:', err);
      return null;
    }
  }, [supabase, user]);

  // Add candidate to list
  const addCandidateToList = useCallback(async (listId: string, candidateId: string): Promise<boolean> => {
    if (!supabase || !user) return false;

    try {
      const { error } = await supabase
        .from('list_candidates')
        .insert({
          list_id: listId,
          candidate_id: candidateId,
        });

      if (error) throw error;

      // Update local state
      setLists(prev => prev.map(l =>
        l.id === listId
          ? { ...l, candidateCount: (l.candidateCount || 0) + 1 }
          : l
      ));
      return true;
    } catch (err) {
      console.error('Failed to add candidate to list:', err);
      return false;
    }
  }, [supabase, user]);

  // Remove candidate from list
  const removeCandidateFromList = useCallback(async (listId: string, candidateId: string): Promise<boolean> => {
    if (!supabase || !user) return false;

    try {
      const { error } = await supabase
        .from('list_candidates')
        .delete()
        .eq('list_id', listId)
        .eq('candidate_id', candidateId);

      if (error) throw error;

      // Update local state
      setLists(prev => prev.map(l =>
        l.id === listId
          ? { ...l, candidateCount: Math.max((l.candidateCount || 0) - 1, 0) }
          : l
      ));
      return true;
    } catch (err) {
      console.error('Failed to remove candidate from list:', err);
      return false;
    }
  }, [supabase, user]);

  // Add multiple candidates to list (bulk)
  const addCandidatesToList = useCallback(async (listId: string, candidateIds: string[]): Promise<boolean> => {
    if (!supabase || !user || candidateIds.length === 0) return false;

    try {
      const inserts = candidateIds.map(candidateId => ({
        list_id: listId,
        candidate_id: candidateId,
      }));

      const { error } = await supabase
        .from('list_candidates')
        .upsert(inserts, { onConflict: 'list_id,candidate_id' });

      if (error) throw error;

      // Refresh lists to get accurate count
      await fetchLists();
      return true;
    } catch (err) {
      console.error('Failed to add candidates to list:', err);
      return false;
    }
  }, [supabase, user, fetchLists]);

  // Check if candidate is in a list
  const isCandidateInList = useCallback(async (listId: string, candidateId: string): Promise<boolean> => {
    if (!supabase) return false;

    try {
      const { data, error } = await supabase
        .from('list_candidates')
        .select('id')
        .eq('list_id', listId)
        .eq('candidate_id', candidateId)
        .single();

      if (error) return false;
      return !!data;
    } catch (err) {
      console.error('Failed to check if candidate is in list:', err);
      return false;
    }
  }, [supabase]);

  // Get lists that contain a specific candidate
  const getListsForCandidate = useCallback(async (candidateId: string): Promise<string[]> => {
    if (!supabase || !user) return [];

    try {
      const { data, error } = await supabase
        .from('list_candidates')
        .select('list_id')
        .eq('candidate_id', candidateId);

      if (error) throw error;
      return (data || []).map(m => m.list_id).filter((id): id is string => id !== null);
    } catch (err) {
      console.error('Failed to get lists for candidate:', err);
      return [];
    }
  }, [supabase, user]);

  // Share a list (generate public link)
  const shareList = useCallback(async (id: string): Promise<string | null> => {
    if (!supabase || !user) return null;

    try {
      const { data: shareIdData, error: shareIdError } = await supabase
        .rpc('generate_share_id');

      if (shareIdError) throw shareIdError;

      const { data, error } = await supabase
        .from('lists')
        .update({ share_id: shareIdData, is_public: true })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setLists(prev => prev.map(l => l.id === id ? { ...l, ...data } : l));

      const baseUrl = typeof window !== 'undefined'
        ? window.location.origin
        : process.env.NEXT_PUBLIC_APP_URL || '';
      return `${baseUrl}/shared/list/${shareIdData}`;
    } catch (err) {
      console.error('Failed to share list:', err);
      return null;
    }
  }, [supabase, user]);

  // Unshare a list
  const unshareList = useCallback(async (id: string): Promise<boolean> => {
    if (!supabase || !user) return false;

    try {
      const { data, error } = await supabase
        .from('lists')
        .update({ share_id: null, is_public: false })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setLists(prev => prev.map(l => l.id === id ? { ...l, ...data } : l));
      return true;
    } catch (err) {
      console.error('Failed to unshare list:', err);
      return false;
    }
  }, [supabase, user]);

  // Get a list by share ID (public access, no auth required)
  const getListByShareId = useCallback(async (shareId: string): Promise<ListWithMembers | null> => {
    if (!supabase) return null;

    try {
      const { data: list, error: listError } = await supabase
        .from('lists')
        .select('*')
        .eq('share_id', shareId)
        .eq('is_public', true)
        .single();

      if (listError) throw listError;

      const { data: members, error: membersError } = await supabase
        .from('list_candidates')
        .select(`
          *,
          candidate:candidates(*)
        `)
        .eq('list_id', list.id);

      if (membersError) throw membersError;

      return {
        ...list,
        members: members || [],
        candidateCount: members?.length || 0,
      };
    } catch (err) {
      console.error('Failed to get list by share ID:', err);
      return null;
    }
  }, [supabase]);

  // Fetch lists on mount and when user changes
  useEffect(() => {
    if (isConfigured && user) {
      fetchLists();
    } else {
      setLists([]);
      setIsLoading(false);
    }
  }, [isConfigured, user, fetchLists]);

  return {
    lists,
    isLoading,
    fetchLists,
    createList,
    updateList,
    deleteList,
    getListWithCandidates,
    addCandidateToList,
    removeCandidateFromList,
    addCandidatesToList,
    isCandidateInList,
    getListsForCandidate,
    shareList,
    unshareList,
    getListByShareId,
  };
}
