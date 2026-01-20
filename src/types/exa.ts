// Exa Websets API Types

export type EntityType = 'person' | 'company' | 'research_paper' | 'article';

export interface PersonProperties {
  type: 'person';
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

export interface CompanyProperties {
  type: 'company';
  name?: string;
  location?: string;
  description?: string;
  industry?: string;
  foundedYear?: number;
  employeeCount?: number;
}

export type ItemProperties = PersonProperties | CompanyProperties;

export interface WebsetItem {
  id: string;
  object: 'webset_item';
  source: 'search' | 'import';
  sourceId: string;
  websetId: string;
  properties: ItemProperties;
  url?: string;
  description?: string;
  enrichments?: Record<string, unknown>;
  createdAt?: string;
}

export interface WebsetSearch {
  id: string;
  object: 'webset_search';
  status: 'created' | 'running' | 'completed' | 'failed';
  websetId: string;
  query: string;
  count?: number;
  entity?: {
    type: EntityType;
  };
  criteria?: SearchCriteria[];
}

// Criteria can be a simple string or an object with description
export type SearchCriteria = string | {
  description: string;
  required?: boolean;
};

export interface Webset {
  id: string;
  object: 'webset';
  status: 'idle' | 'running' | 'completed' | 'failed';
  externalId?: string;
  title?: string;
  searches: WebsetSearch[];
  createdAt?: string;
}

export interface CreateWebsetRequest {
  search?: {
    query: string;
    count?: number;
    entity?: {
      type: EntityType;
    };
    criteria?: SearchCriteria[];
  };
  enrichments?: CreateEnrichmentParameters[];
  externalId?: string;
}

export interface CreateEnrichmentParameters {
  description: string;
  format?: 'text' | 'number' | 'boolean' | 'date' | 'list' | 'url';
}

export interface ListItemsResponse {
  data: WebsetItem[];
  hasMore: boolean;
  cursor?: string;
}

export interface ListWebsetsResponse {
  data: Webset[];
  hasMore: boolean;
  cursor?: string;
}

// Candidate type for the UI (flattened from WebsetItem)
export interface Candidate {
  id: string;
  name: string;
  position: string;
  company: string;
  location: string;
  url: string;
  pictureUrl?: string;
  description?: string;
  enrichments?: Record<string, unknown>;
}
