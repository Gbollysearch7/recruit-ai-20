import {
  CreateEnrichmentParameters,
  Webset,
  ListItemsResponse,
  ListWebsetsResponse,
} from '@/types/exa';

const EXA_API_BASE = 'https://api.exa.ai/websets/v0';

class ExaClient {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${EXA_API_BASE}${endpoint}`;
    console.log('Exa API Request:', url);

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json',
        'x-api-key': this.apiKey,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Exa API Error:', response.status, error);
      throw new Error(`Exa API Error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  // Create a new Webset with a search
  async createWebset(params: {
    query: string;
    count?: number;
    criteria?: string[];
    enrichments?: CreateEnrichmentParameters[];
  }): Promise<Webset> {
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
      body.search.criteria = params.criteria.map(c => ({ description: c }));
    }

    // Only add enrichments if provided
    if (params.enrichments && params.enrichments.length > 0) {
      body.enrichments = params.enrichments;
    }

    console.log('Creating webset with:', JSON.stringify(body, null, 2));

    return this.request<Webset>('/websets/', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  // Get a specific Webset
  async getWebset(websetId: string): Promise<Webset> {
    return this.request<Webset>(`/websets/${websetId}`);
  }

  // List all Websets
  async listWebsets(limit?: number, cursor?: string): Promise<ListWebsetsResponse> {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (cursor) params.append('cursor', cursor);

    const query = params.toString();
    return this.request<ListWebsetsResponse>(`/websets/${query ? `?${query}` : ''}`);
  }

  // Get items from a Webset
  async getWebsetItems(
    websetId: string,
    options?: { limit?: number; cursor?: string }
  ): Promise<ListItemsResponse> {
    const params = new URLSearchParams();
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.cursor) params.append('cursor', options.cursor);

    const query = params.toString();
    return this.request<ListItemsResponse>(
      `/websets/${websetId}/items${query ? `?${query}` : ''}`
    );
  }

  // Delete a Webset
  async deleteWebset(websetId: string): Promise<void> {
    await this.request(`/websets/${websetId}`, {
      method: 'DELETE',
    });
  }

  // Cancel a running Webset
  async cancelWebset(websetId: string): Promise<Webset> {
    return this.request<Webset>(`/websets/${websetId}/cancel`, {
      method: 'POST',
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
