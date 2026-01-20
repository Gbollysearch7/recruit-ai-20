// Exa API Types for Talist
// Updated to match the actual API response structure

export type EntityType = 'person' | 'company' | 'research_paper' | 'article';

// Person properties - nested structure from API
export interface PersonData {
  name?: string;
  location?: string;
  position?: string;
  pictureUrl?: string;
  company?: {
    name?: string;
    location?: string;
    logo?: string;
  };
}

// Company properties
export interface CompanyData {
  name?: string;
  location?: string;
  description?: string;
  industry?: string;
  foundedYear?: number;
  employeeCount?: number;
  logo?: string;
}

// Item properties - matches actual API response
export interface ItemProperties {
  type: 'person' | 'company';
  url?: string;
  description?: string;
  // Person data is nested under 'person' key
  person?: PersonData;
  // Company data is nested under 'company' key
  company?: CompanyData;
}

// Evaluation result for each criterion
export interface Evaluation {
  criterion: string;
  reasoning: string;
  satisfied: 'yes' | 'no' | 'unclear';
  references: Array<{
    title: string;
    snippet: string;
    url: string;
  }>;
}

// Enrichment result
export interface EnrichmentResult {
  object: 'enrichment_result';
  status: 'pending' | 'running' | 'completed' | 'failed';
  format: 'text' | 'number' | 'boolean' | 'date' | 'list' | 'url';
  result?: string[];
  reasoning?: string;
  references?: Array<{
    title: string;
    snippet: string;
    url: string;
  }>;
  enrichmentId: string;
}

// Webset Item - matches actual API response
export interface WebsetItem {
  id: string;
  object: 'webset_item';
  source: 'search' | 'import';
  sourceId: string;
  websetId: string;
  properties: ItemProperties;
  evaluations?: Evaluation[];
  enrichments?: EnrichmentResult[];
  createdAt?: string;
  updatedAt?: string;
}

// Search progress
export interface SearchProgress {
  found: number;
  analyzed: number;
  completion: number; // 0-100
  timeLeft?: number; // seconds
}

// Criterion in search response (includes successRate)
export interface SearchCriterionResult {
  description: string;
  successRate?: number;
}

// Webset Search
export interface WebsetSearch {
  id: string;
  object: 'webset_search';
  status: 'created' | 'running' | 'completed' | 'failed' | 'canceled';
  websetId: string;
  query: string;
  count?: number;
  entity?: {
    type: EntityType;
  };
  criteria?: SearchCriterionResult[];
  progress?: SearchProgress;
  createdAt?: string;
  updatedAt?: string;
  canceledAt?: string;
  canceledReason?: string;
}

// Webset Enrichment definition
export interface WebsetEnrichment {
  id: string;
  object: 'webset_enrichment';
  status: 'pending' | 'running' | 'completed' | 'failed';
  websetId: string;
  title?: string;
  description: string;
  format: 'text' | 'number' | 'boolean' | 'date' | 'list' | 'url';
  createdAt?: string;
  updatedAt?: string;
}

// Webset
export interface Webset {
  id: string;
  object: 'webset';
  status: 'idle' | 'pending' | 'running' | 'paused';
  externalId?: string | null;
  title?: string | null;
  searches: WebsetSearch[];
  enrichments?: WebsetEnrichment[];
  createdAt?: string;
  updatedAt?: string;
}

// Request types
export interface CreateEnrichmentParameters {
  description: string;
  format?: 'text' | 'number' | 'boolean' | 'date' | 'list' | 'url';
}

export interface CreateSearchParameters {
  query: string;
  count?: number;
  entity?: {
    type: EntityType;
  };
  criteria?: Array<{ description: string }>;
}

export interface CreateWebsetRequest {
  search?: CreateSearchParameters;
  enrichments?: CreateEnrichmentParameters[];
  externalId?: string;
  title?: string;
}

// Response types
export interface ListItemsResponse {
  data: WebsetItem[];
  hasMore: boolean;
  nextCursor?: string | null;
}

export interface ListWebsetsResponse {
  data: Webset[];
  hasMore: boolean;
  nextCursor?: string | null;
}

// Helper function to extract person data from item
export function getPersonFromItem(item: WebsetItem): PersonData | null {
  if (item.properties.type === 'person' && item.properties.person) {
    return item.properties.person;
  }
  return null;
}

// Helper function to extract company data from item
export function getCompanyFromItem(item: WebsetItem): CompanyData | null {
  if (item.properties.type === 'company' && item.properties.company) {
    return item.properties.company;
  }
  return null;
}

// Helper function to get enrichment result by description keyword
// This matches against common patterns in enrichment results
export function getEnrichmentResult(item: WebsetItem, keyword: string): string | null {
  if (!item.enrichments) return null;

  const lowerKeyword = keyword.toLowerCase();

  // Search through all enrichments to find matching result
  for (const e of item.enrichments) {
    if (e.status === 'completed' && e.result?.length) {
      const result = e.result[0];
      if (!result) continue;

      // Match based on keyword patterns
      if (lowerKeyword.includes('linkedin') && result.includes('linkedin.com')) {
        return result;
      }
      if (lowerKeyword.includes('github') && result.includes('github.com')) {
        return result;
      }
      if (lowerKeyword.includes('email') && result.includes('@')) {
        return result;
      }
      if (lowerKeyword.includes('twitter') && (result.includes('twitter.com') || result.includes('x.com'))) {
        return result;
      }
      if (lowerKeyword.includes('website') && (result.startsWith('http://') || result.startsWith('https://'))) {
        return result;
      }
      if (lowerKeyword.includes('phone') && /[\d\s\-\+\(\)]{7,}/.test(result)) {
        return result;
      }
    }
  }

  return null;
}

// Helper function to get enrichment result by enrichment ID
// Use this when you have access to the webset's enrichment definitions
export function getEnrichmentResultById(item: WebsetItem, enrichmentId: string): string | null {
  if (!item.enrichments) return null;

  const enrichment = item.enrichments.find(e => e.enrichmentId === enrichmentId);
  if (enrichment?.status === 'completed' && enrichment.result?.length) {
    return enrichment.result[0];
  }

  return null;
}

// Helper function to get all completed enrichments for an item
export function getAllEnrichments(item: WebsetItem): Array<{
  enrichmentId: string;
  result: string | null;
  format: string;
  reasoning?: string;
}> {
  if (!item.enrichments) return [];

  return item.enrichments
    .filter(e => e.status === 'completed')
    .map(e => ({
      enrichmentId: e.enrichmentId,
      result: e.result?.[0] || null,
      format: e.format,
      reasoning: e.reasoning,
    }));
}
