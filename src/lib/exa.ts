import {
  CreateEnrichmentParameters,
  Webset,
  ListItemsResponse,
  ListWebsetsResponse,
} from '@/types/exa';
import { withRetry, RetryOptions } from './api/retry';
import { logger } from './api/logger';

const EXA_API_BASE = 'https://api.exa.ai/websets/v0';
const DEFAULT_TIMEOUT = 30000; // 30 seconds

interface RequestOptions extends RequestInit {
  timeout?: number;
  requestId?: string;
  skipRetry?: boolean;
}

class ExaClient {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const {
      timeout = DEFAULT_TIMEOUT,
      requestId = `exa_${Date.now()}`,
      skipRetry = false,
      ...fetchOptions
    } = options;

    const url = `${EXA_API_BASE}${endpoint}`;

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const fetchFn = async (): Promise<T> => {
      const logComplete = logger.logExternalCall({
        requestId,
        service: 'Exa',
        method: fetchOptions.method || 'GET',
        endpoint,
      });

      try {
        const response = await fetch(url, {
          ...fetchOptions,
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
            accept: 'application/json',
            'x-api-key': this.apiKey,
            ...fetchOptions.headers,
          },
        });

        // Log rate limit headers if present
        const remaining = response.headers.get('x-ratelimit-remaining');
        const resetTime = response.headers.get('x-ratelimit-reset');
        if (remaining) {
          logger.debug(`Rate limit remaining: ${remaining}`, { requestId, resetTime });
        }

        if (!response.ok) {
          const errorText = await response.text();
          logger.logExternalError({
            requestId,
            service: 'Exa',
            method: fetchOptions.method || 'GET',
            endpoint,
            status: response.status,
            error: errorText,
          });
          throw new Error(`Exa API Error: ${response.status} - ${errorText}`);
        }

        logComplete();
        return response.json();
      } finally {
        clearTimeout(timeoutId);
      }
    };

    // Apply retry logic unless skipped
    if (skipRetry) {
      return fetchFn();
    }

    const retryOptions: RetryOptions = {
      maxRetries: 3,
      baseDelay: 1000,
      retryableStatuses: [429, 500, 502, 503, 504],
      onRetry: (attempt, error, delay) => {
        logger.logRetry(requestId, attempt, 3, delay, error.message);
      },
    };

    return withRetry(fetchFn, retryOptions);
  }

  // Create a new Webset with a search
  async createWebset(
    params: {
      query: string;
      count?: number;
      criteria?: string[];
      enrichments?: CreateEnrichmentParameters[];
    },
    requestId?: string
  ): Promise<Webset> {
    // Build the request body matching the exact API format
    const body: {
      search: {
        query: string;
        count: number;
        criteria?: { description: string }[];
      };
      enrichments?: CreateEnrichmentParameters[];
    } = {
      search: {
        query: params.query,
        count: params.count || 20,
      },
    };

    // Only add criteria if provided - convert strings to objects with description
    if (params.criteria && params.criteria.length > 0) {
      body.search.criteria = params.criteria.map((c) => ({ description: c }));
    }

    // Only add enrichments if provided
    if (params.enrichments && params.enrichments.length > 0) {
      body.enrichments = params.enrichments;
    }

    logger.debug('Creating webset with body:', body);

    return this.request<Webset>('/websets/', {
      method: 'POST',
      body: JSON.stringify(body),
      requestId,
    });
  }

  // Get a specific Webset
  async getWebset(websetId: string, requestId?: string): Promise<Webset> {
    return this.request<Webset>(`/websets/${websetId}`, { requestId });
  }

  // List all Websets
  async listWebsets(
    limit?: number,
    cursor?: string,
    requestId?: string
  ): Promise<ListWebsetsResponse> {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (cursor) params.append('cursor', cursor);

    const query = params.toString();
    return this.request<ListWebsetsResponse>(
      `/websets/${query ? `?${query}` : ''}`,
      { requestId }
    );
  }

  // Get items from a Webset
  async getWebsetItems(
    websetId: string,
    options?: { limit?: number; cursor?: string },
    requestId?: string
  ): Promise<ListItemsResponse> {
    const params = new URLSearchParams();
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.cursor) params.append('cursor', options.cursor);

    const query = params.toString();
    return this.request<ListItemsResponse>(
      `/websets/${websetId}/items${query ? `?${query}` : ''}`,
      { requestId }
    );
  }

  // Delete a Webset
  async deleteWebset(websetId: string, requestId?: string): Promise<void> {
    await this.request(`/websets/${websetId}`, {
      method: 'DELETE',
      requestId,
    });
  }

  // Cancel a running Webset
  async cancelWebset(websetId: string, requestId?: string): Promise<Webset> {
    return this.request<Webset>(`/websets/${websetId}/cancel`, {
      method: 'POST',
      requestId,
    });
  }
}

// Singleton instance
let exaClient: ExaClient | null = null;

export function getExaClient(): ExaClient {
  const apiKey = process.env.EXA_API_KEY;

  if (!apiKey) {
    throw new Error('EXA_API_KEY environment variable is not set');
  }

  if (!exaClient) {
    exaClient = new ExaClient(apiKey);
  }

  return exaClient;
}

export { ExaClient };
