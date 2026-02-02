'use client';

import { useState, useCallback, useEffect } from 'react';
import { getSupabase, type SearchTemplate } from '@/lib/supabase';
import { useAuth } from './useAuth';

interface CreateTemplateParams {
  name: string;
  description?: string;
  query: string;
  count?: number;
  criteria?: string[];
  enrichments?: Array<{ description: string; format: string }>;
  isPublic?: boolean;
}

export function useTemplates() {
  const [templates, setTemplates] = useState<SearchTemplate[]>([]);
  const [publicTemplates, setPublicTemplates] = useState<SearchTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isConfigured } = useAuth();
  const supabase = getSupabase();

  // Fetch user's templates
  const fetchTemplates = useCallback(async () => {
    if (!supabase || !user) {
      setTemplates([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('search_templates')
        .select('*')
        .eq('user_id', user.id)
        .order('usage_count', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (err) {
      console.error('Failed to fetch templates:', err);
      setTemplates([]);
    } finally {
      setIsLoading(false);
    }
  }, [supabase, user]);

  // Fetch public templates
  const fetchPublicTemplates = useCallback(async () => {
    if (!supabase) return;

    try {
      const { data, error } = await supabase
        .from('search_templates')
        .select('*')
        .eq('is_public', true)
        .order('usage_count', { ascending: false })
        .limit(20);

      if (error) throw error;
      setPublicTemplates(data || []);
    } catch (err) {
      console.error('Failed to fetch public templates:', err);
      setPublicTemplates([]);
    }
  }, [supabase]);

  // Create a new template
  const createTemplate = useCallback(async (params: CreateTemplateParams): Promise<SearchTemplate | null> => {
    if (!supabase || !user) return null;

    try {
      const { data, error } = await supabase
        .from('search_templates')
        .insert({
          user_id: user.id,
          name: params.name,
          description: params.description,
          query: params.query,
          count: params.count || 20,
          criteria: params.criteria || [],
          enrichments: params.enrichments || [],
          is_public: params.isPublic || false,
        })
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setTemplates(prev => [data, ...prev]);
      return data;
    } catch (err) {
      console.error('Failed to create template:', err);
      return null;
    }
  }, [supabase, user]);

  // Update a template
  const updateTemplate = useCallback(async (id: string, params: Partial<CreateTemplateParams>): Promise<SearchTemplate | null> => {
    if (!supabase || !user) return null;

    try {
      const updateData: Record<string, unknown> = {};
      if (params.name !== undefined) updateData.name = params.name;
      if (params.description !== undefined) updateData.description = params.description;
      if (params.query !== undefined) updateData.query = params.query;
      if (params.count !== undefined) updateData.count = params.count;
      if (params.criteria !== undefined) updateData.criteria = params.criteria;
      if (params.enrichments !== undefined) updateData.enrichments = params.enrichments;
      if (params.isPublic !== undefined) updateData.is_public = params.isPublic;

      const { data, error } = await supabase
        .from('search_templates')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setTemplates(prev => prev.map(t => t.id === id ? data : t));
      return data;
    } catch (err) {
      console.error('Failed to update template:', err);
      return null;
    }
  }, [supabase, user]);

  // Delete a template
  const deleteTemplate = useCallback(async (id: string): Promise<boolean> => {
    if (!supabase || !user) return false;

    try {
      const { error } = await supabase
        .from('search_templates')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      // Update local state
      setTemplates(prev => prev.filter(t => t.id !== id));
      return true;
    } catch (err) {
      console.error('Failed to delete template:', err);
      return false;
    }
  }, [supabase, user]);

  // Use a template (increment usage count)
  const useTemplate = useCallback(async (id: string): Promise<SearchTemplate | null> => {
    if (!supabase) return null;

    try {
      // Get the current template first
      const { data: template, error: fetchError } = await supabase
        .from('search_templates')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      // Increment usage count
      const { data, error } = await supabase
        .from('search_templates')
        .update({ usage_count: (template.usage_count || 0) + 1 })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Update local state if it's the user's template
      if (user && data.user_id === user.id) {
        setTemplates(prev => prev.map(t => t.id === id ? data : t));
      }

      return data;
    } catch (err) {
      console.error('Failed to use template:', err);
      return null;
    }
  }, [supabase, user]);

  // Get a single template
  const getTemplate = useCallback(async (id: string): Promise<SearchTemplate | null> => {
    if (!supabase) return null;

    try {
      const { data, error } = await supabase
        .from('search_templates')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Failed to get template:', err);
      return null;
    }
  }, [supabase]);

  // Save current search as template
  const saveAsTemplate = useCallback(async (
    name: string,
    query: string,
    options?: {
      description?: string;
      count?: number;
      criteria?: string[];
      enrichments?: Array<{ description: string; format: string }>;
    }
  ): Promise<SearchTemplate | null> => {
    return createTemplate({
      name,
      query,
      description: options?.description,
      count: options?.count,
      criteria: options?.criteria,
      enrichments: options?.enrichments,
    });
  }, [createTemplate]);

  // Fetch templates on mount and when user changes
  useEffect(() => {
    if (isConfigured) {
      if (user) {
        fetchTemplates();
      } else {
        setTemplates([]);
        setIsLoading(false);
      }
      fetchPublicTemplates();
    } else {
      setTemplates([]);
      setPublicTemplates([]);
      setIsLoading(false);
    }
  }, [isConfigured, user, fetchTemplates, fetchPublicTemplates]);

  return {
    templates,
    publicTemplates,
    isLoading,
    fetchTemplates,
    fetchPublicTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    useTemplate,
    getTemplate,
    saveAsTemplate,
  };
}
