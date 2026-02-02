'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Webset, WebsetItem, CreateEnrichmentParameters } from '@/types/exa';

interface UseTalistOptions {
  pollingInterval?: number;
  onItemsUpdate?: (items: WebsetItem[]) => void;
  onComplete?: (webset: Webset, items: WebsetItem[]) => void;
  onError?: (error: Error) => void;
}

interface UseTalistReturn {
  webset: Webset | null;
  items: WebsetItem[];
  isSearching: boolean;
  isLoadingItems: boolean;
  error: string | null;
  progress: {
    found: number;
    completion: number;
    searchStatus: string;
  };
  startSearch: (
    query: string,
    count: number,
    criteria: string[],
    enrichments: CreateEnrichmentParameters[]
  ) => Promise<void>;
  resumeSearch: (websetId: string) => Promise<void>;
  cancelSearch: () => Promise<void>;
  reset: () => void;
}

export function useTalist(options: UseTalistOptions = {}): UseTalistReturn {
  const {
    pollingInterval = 2000,
    onItemsUpdate,
    onComplete,
    onError,
  } = options;

  const [webset, setWebset] = useState<Webset | null>(null);
  const [items, setItems] = useState<WebsetItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingItems, setIsLoadingItems] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState({
    found: 0,
    completion: 0,
    searchStatus: 'idle',
  });

  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const websetIdRef = useRef<string | null>(null);

  const clearPolling = useCallback(() => {
    if (pollingRef.current) {
      clearTimeout(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  const fetchItems = useCallback(async (websetId: string): Promise<WebsetItem[]> => {
    setIsLoadingItems(true);
    try {
      const response = await fetch(`/api/websets/${websetId}/items?limit=100`);
      if (!response.ok) throw new Error('Failed to fetch items');
      const data = await response.json();
      const fetchedItems = data.data || [];
      setItems(fetchedItems);
      onItemsUpdate?.(fetchedItems);
      return fetchedItems;
    } catch (err) {
      console.error('Failed to fetch items:', err);
      return [];
    } finally {
      setIsLoadingItems(false);
    }
  }, [onItemsUpdate]);

  const pollWebset = useCallback(async (websetId: string) => {
    if (websetIdRef.current !== websetId) return;

    try {
      const response = await fetch(`/api/websets/${websetId}`);
      if (!response.ok) throw new Error('Failed to fetch webset');
      const data: Webset = await response.json();
      setWebset(data);

      // Get search status and progress from the first search
      const search = data.searches?.[0];
      const searchStatus = search?.status || 'unknown';
      const searchProgress = search?.progress;

      setProgress({
        found: searchProgress?.found || 0,
        completion: searchProgress?.completion || 0,
        searchStatus,
      });

      // Determine if search is still active
      // Webset status can be: 'idle' | 'pending' | 'running' | 'paused'
      // Search status can be: 'created' | 'running' | 'completed' | 'failed' | 'canceled'
      const isSearchActive =
        data.status === 'running' ||
        data.status === 'pending' ||
        searchStatus === 'running' ||
        searchStatus === 'created';

      if (isSearchActive) {
        // Fetch items while search is running
        await fetchItems(websetId);
        // Continue polling
        pollingRef.current = setTimeout(() => pollWebset(websetId), pollingInterval);
      } else if (searchStatus === 'completed' || data.status === 'idle') {
        // Search completed - fetch final items
        const finalItems = await fetchItems(websetId);
        setIsSearching(false);
        setProgress(prev => ({ ...prev, completion: 100, searchStatus: 'completed' }));
        onComplete?.(data, finalItems);
      } else if (searchStatus === 'failed' || searchStatus === 'canceled') {
        // Search failed or was canceled
        setError(searchStatus === 'failed' ? 'Search failed. Please try again.' : 'Search was canceled.');
        setIsSearching(false);
        onError?.(new Error(searchStatus === 'failed' ? 'Search failed' : 'Search canceled'));
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An error occurred');
      setError(error.message);
      setIsSearching(false);
      onError?.(error);
    }
  }, [pollingInterval, fetchItems, onComplete, onError]);

  const startSearch = useCallback(async (
    query: string,
    count: number,
    criteria: string[],
    enrichments: CreateEnrichmentParameters[]
  ) => {
    clearPolling();
    setIsSearching(true);
    setError(null);
    setItems([]);
    setWebset(null);
    setProgress({ found: 0, completion: 0, searchStatus: 'created' });

    try {
      const requestBody = {
        query,
        count,
        criteria,
        enrichments,
      };

      const response = await fetch('/api/websets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        // Handle both old format (error) and new format (message)
        throw new Error(errorData.message || errorData.error || 'Failed to create search');
      }

      const data: Webset = await response.json();
      setWebset(data);
      websetIdRef.current = data.id;

      // Dispatch event to notify sidebar of new search
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('talist:search-created', { detail: { websetId: data.id } }));
      }

      // Start polling
      pollingRef.current = setTimeout(() => pollWebset(data.id), pollingInterval);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An error occurred');
      setError(error.message);
      setIsSearching(false);
      onError?.(error);
    }
  }, [clearPolling, pollingInterval, pollWebset, onError]);

  const resumeSearch = useCallback(async (websetId: string) => {
    clearPolling();
    setIsSearching(true);
    setError(null);
    setItems([]);
    setProgress({ found: 0, completion: 0, searchStatus: 'running' });
    websetIdRef.current = websetId;

    // Start polling the existing webset
    pollingRef.current = setTimeout(() => pollWebset(websetId), 0);
  }, [clearPolling, pollWebset]);

  const cancelSearch = useCallback(async () => {
    clearPolling();

    if (websetIdRef.current) {
      try {
        await fetch(`/api/websets/${websetIdRef.current}/cancel`, {
          method: 'POST',
        });
      } catch {
        // Silently fail - user initiated cancel, UI will update regardless
      }
    }

    setIsSearching(false);
  }, [clearPolling]);

  const reset = useCallback(() => {
    clearPolling();
    setWebset(null);
    setItems([]);
    setIsSearching(false);
    setIsLoadingItems(false);
    setError(null);
    setProgress({ found: 0, completion: 0, searchStatus: 'idle' });
    websetIdRef.current = null;
  }, [clearPolling]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearPolling();
    };
  }, [clearPolling]);

  return {
    webset,
    items,
    isSearching,
    isLoadingItems,
    error,
    progress,
    startSearch,
    resumeSearch,
    cancelSearch,
    reset,
  };
}
