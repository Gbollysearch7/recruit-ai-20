# Recruit.ai - Exa Websets API Integration Plan

## Executive Summary

This document outlines the complete integration strategy for the Exa Websets API into Recruit.ai. The goal is to create a seamless candidate search experience that mirrors the Exa Websets dashboard while providing a recruiter-focused interface.

---

## 1. Understanding the Exa Websets API

### 1.1 Core Concepts

The Exa Websets API is an **asynchronous search system** with four core objects:

| Object | Description |
|--------|-------------|
| **Webset** | Container that organizes your collection of web content and searches |
| **Search** | An agent that searches the web to find entities matching your criteria |
| **Item** | A structured result with source content, verification, and type-specific fields |
| **Enrichment** | An agent that extracts additional structured data from items |

### 1.2 API Base URL
```
https://api.exa.ai/websets/v0
```

### 1.3 Authentication
```
Header: x-api-key: YOUR_API_KEY
```

### 1.4 Key API Characteristics

1. **Asynchronous**: Searches can take seconds to minutes
2. **Structured**: Every result includes structured properties and verification
3. **Event-Driven**: Webhooks notify when items are found/enriched
4. **Stateful**: Websets persist and can be queried later

---

## 2. API Endpoints Required

### 2.1 Webset Management

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/websets/` | POST | Create a new Webset with search |
| `/websets/{id}` | GET | Get Webset status and details |
| `/websets/{id}` | DELETE | Delete a Webset |
| `/websets/{id}/cancel` | POST | Cancel a running Webset |
| `/websets/` | GET | List all Websets |

### 2.2 Item Management

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/websets/{id}/items` | GET | List items (with pagination) |
| `/websets/{id}/items/{itemId}` | GET | Get single item |
| `/websets/{id}/items/{itemId}` | DELETE | Delete an item |

### 2.3 Search Management

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/websets/{id}/searches` | POST | Add new search to existing Webset |
| `/websets/{id}/searches/{searchId}/cancel` | POST | Cancel specific search |

### 2.4 Enrichment Management

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/websets/{id}/enrichments` | POST | Add enrichment to Webset |
| `/websets/{id}/enrichments/{enrichmentId}` | DELETE | Remove enrichment |

---

## 3. Data Models

### 3.1 Create Webset Request
```typescript
interface CreateWebsetRequest {
  search: {
    query: string;                    // Natural language search query
    count: number;                    // Number of results (1-100)
    entity?: {
      type: 'person' | 'company' | 'research_paper' | 'article';
    };
    criteria?: Array<{                // Verification criteria
      description: string;            // MUST be object, not string!
    }>;
  };
  enrichments?: Array<{               // Data to extract
    description: string;
    format: 'text' | 'number' | 'boolean' | 'date' | 'list' | 'url';
  }>;
  title?: string;                     // Optional Webset title
  externalId?: string;                // Your internal reference ID
}
```

### 3.2 Webset Response
```typescript
interface Webset {
  id: string;
  object: 'webset';
  status: 'idle' | 'pending' | 'running' | 'paused';
  title: string | null;
  externalId: string | null;
  searches: WebsetSearch[];
  enrichments: WebsetEnrichment[];
  createdAt: string;
  updatedAt: string;
}
```

### 3.3 Webset Search
```typescript
interface WebsetSearch {
  id: string;
  object: 'webset_search';
  status: 'created' | 'running' | 'completed' | 'failed';
  websetId: string;
  query: string;
  count: number;
  entity?: { type: string };
  criteria?: Array<{ description: string; successRate?: number }>;
  progress?: {
    found: number;
    analyzed: number;
    completion: number;  // 0-100
    timeLeft: number;    // seconds
  };
  createdAt: string;
  updatedAt: string;
}
```

### 3.4 Webset Item (Person)
```typescript
interface WebsetItem {
  id: string;
  object: 'webset_item';
  source: 'search' | 'import';
  sourceId: string;
  websetId: string;
  properties: {
    type: 'person';
    url: string;
    description: string;
    person: {
      name: string;
      location: string;
      position: string;
      company: {
        name: string;
        location: string;
      };
      pictureUrl: string;
    };
  };
  evaluations: Array<{              // Criteria verification results
    criterion: string;
    reasoning: string;
    satisfied: 'yes' | 'no' | 'unclear';
    references: Array<{ title: string; snippet: string; url: string }>;
  }>;
  enrichments: Array<{              // Extracted data
    object: 'enrichment_result';
    status: 'pending' | 'completed' | 'failed';
    format: string;
    result: string[];
    reasoning: string;
    references: Array<{ title: string; snippet: string; url: string }>;
    enrichmentId: string;
  }>;
  createdAt: string;
  updatedAt: string;
}
```

---

## 4. Integration Architecture

### 4.1 Current File Structure
```
src/
├── app/
│   ├── api/
│   │   └── websets/
│   │       ├── route.ts              # POST (create), GET (list)
│   │       └── [id]/
│   │           ├── route.ts          # GET, DELETE
│   │           └── items/
│   │               └── route.ts      # GET items
│   ├── search/
│   │   └── page.tsx                  # Search UI
│   ├── searches/
│   │   ├── page.tsx                  # Saved searches list
│   │   └── [id]/
│   │       └── page.tsx              # Search detail view
│   └── dashboard/
│       └── page.tsx                  # Dashboard
├── components/
│   ├── SearchForm.tsx                # Search input form
│   ├── CandidateTable.tsx            # Results table
│   ├── WebsetStatus.tsx              # Status display
│   └── ...
├── lib/
│   └── exa.ts                        # Exa API client
└── types/
    └── exa.ts                        # TypeScript types
```

### 4.2 Proposed Enhanced Structure
```
src/
├── app/
│   ├── api/
│   │   └── websets/
│   │       ├── route.ts              # POST, GET
│   │       └── [id]/
│   │           ├── route.ts          # GET, DELETE, PATCH
│   │           ├── cancel/
│   │           │   └── route.ts      # POST - cancel webset
│   │           ├── items/
│   │           │   └── route.ts      # GET items
│   │           ├── searches/
│   │           │   └── route.ts      # POST - add search
│   │           └── enrichments/
│   │               └── route.ts      # POST - add enrichment
│   ├── search/
│   │   └── page.tsx
│   ├── searches/
│   │   ├── page.tsx
│   │   └── [id]/
│   │       └── page.tsx
│   └── candidate/
│       └── [id]/
│           └── page.tsx              # NEW: Individual candidate view
├── components/
│   ├── search/
│   │   ├── SearchForm.tsx
│   │   ├── SearchResults.tsx
│   │   └── SearchStatus.tsx
│   ├── candidate/
│   │   ├── CandidateTable.tsx
│   │   ├── CandidateCard.tsx
│   │   ├── CandidateDetail.tsx
│   │   └── CriteriaEvaluation.tsx    # NEW: Show match/miss/unclear
│   ├── enrichment/
│   │   ├── EnrichmentBadge.tsx
│   │   └── EnrichmentDetail.tsx
│   └── common/
│       ├── StatusBadge.tsx
│       └── ProgressBar.tsx
├── lib/
│   ├── exa.ts                        # Enhanced Exa client
│   └── hooks/
│       ├── useWebset.ts              # Webset polling hook
│       ├── useItems.ts               # Items pagination hook
│       └── useSearch.ts              # Search state management
└── types/
    └── exa.ts                        # Updated types
```

---

## 5. Implementation Steps

### Phase 1: Fix Current Issues (Priority: HIGH)

#### Step 1.1: Update TypeScript Types
**File:** `src/types/exa.ts`

Current types are incomplete. Need to add:
- `evaluations` array to WebsetItem
- `progress` object to WebsetSearch
- Proper `enrichments` structure with `status`, `result`, `reasoning`
- `properties.person` nested structure

```typescript
// Key changes needed:
interface WebsetItem {
  // ... existing fields
  properties: {
    type: 'person' | 'company';
    url: string;
    description: string;
    person?: {
      name: string;
      location: string;
      position: string;
      company: { name: string; location: string };
      pictureUrl: string;
    };
  };
  evaluations: Evaluation[];
  enrichments: EnrichmentResult[];
}
```

#### Step 1.2: Fix Data Mapping in Components
**File:** `src/components/CandidateTable.tsx`

The table shows "-" for all fields because the data mapping doesn't match the actual API response structure. Need to map:
- `item.properties.person.name` → Name
- `item.properties.person.position` → Position
- `item.properties.person.company.name` → Company
- `item.properties.person.location` → Location
- `item.properties.url` → Profile URL

#### Step 1.3: Add Criteria as Objects
**File:** `src/lib/exa.ts` ✅ DONE

Already fixed - criteria now maps to `{ description: string }` format.

---

### Phase 2: Core Search Flow (Priority: HIGH)

#### Step 2.1: Implement Proper Polling
**Current:** Basic setTimeout polling
**Needed:** Robust polling with progress tracking

```typescript
// src/lib/hooks/useWebset.ts
export function useWebset(websetId: string | null) {
  const [webset, setWebset] = useState<Webset | null>(null);
  const [items, setItems] = useState<WebsetItem[]>([]);
  const [isPolling, setIsPolling] = useState(false);

  useEffect(() => {
    if (!websetId) return;

    const poll = async () => {
      const res = await fetch(`/api/websets/${websetId}`);
      const data = await res.json();
      setWebset(data);

      // Fetch items
      const itemsRes = await fetch(`/api/websets/${websetId}/items?limit=100`);
      const itemsData = await itemsRes.json();
      setItems(itemsData.data);

      // Continue polling if running
      if (data.status === 'running' || data.status === 'pending') {
        setTimeout(poll, 3000);
      }
    };

    poll();
  }, [websetId]);

  return { webset, items, isPolling };
}
```

#### Step 2.2: Show Real-time Progress
Display from `webset.searches[0].progress`:
- Found count
- Analyzed count
- Completion percentage
- Estimated time remaining

#### Step 2.3: Handle Search States
```
created → running → completed
                 ↘ failed
```

Show appropriate UI for each state.

---

### Phase 3: Enhanced Results Display (Priority: MEDIUM)

#### Step 3.1: Criteria Evaluation Display
Show match/miss/unclear badges with reasoning:

```tsx
// src/components/candidate/CriteriaEvaluation.tsx
function CriteriaEvaluation({ evaluations }) {
  return (
    <div className="space-y-2">
      {evaluations.map((eval, i) => (
        <div key={i} className="flex items-start gap-2">
          <span className={`match-badge match-badge-${eval.satisfied}`}>
            {eval.satisfied}
          </span>
          <div>
            <p className="text-xs font-medium">{eval.criterion}</p>
            <p className="text-xs text-muted">{eval.reasoning}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
```

#### Step 3.2: Enrichment Results Display
Show extracted data with sources:

```tsx
function EnrichmentResult({ enrichment }) {
  return (
    <div className="border rounded p-2">
      <div className="flex items-center gap-2">
        <StatusBadge status={enrichment.status} />
        <span className="text-xs font-medium">{enrichment.description}</span>
      </div>
      {enrichment.result && (
        <div className="mt-1">
          <p className="text-sm">{enrichment.result.join(', ')}</p>
          {enrichment.references?.map((ref, i) => (
            <a key={i} href={ref.url} className="text-xs text-primary">
              {ref.title}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
```

#### Step 3.3: Candidate Detail View
Create `/candidate/[id]/page.tsx` for full candidate profile:
- Photo (if available)
- Name, position, company, location
- All criteria evaluations with reasoning
- All enrichment results with sources
- Original source URL

---

### Phase 4: Search Management (Priority: MEDIUM)

#### Step 4.1: Save Searches (Websets)
Websets persist automatically. Need UI to:
- List all saved websets (`GET /websets/`)
- View past search results
- Delete old searches

#### Step 4.2: Cancel Running Searches
Add cancel button that calls:
```
POST /api/websets/{id}/cancel
```

#### Step 4.3: Re-run Searches
Add new search to existing webset:
```
POST /api/websets/{id}/searches
{
  "query": "...",
  "count": 20,
  "criteria": [...]
}
```

---

### Phase 5: Advanced Features (Priority: LOW)

#### Step 5.1: Export Functionality
- Export to CSV
- Export to JSON
- Copy to clipboard

#### Step 5.2: Pagination
Handle large result sets with cursor-based pagination:
```typescript
async function fetchAllItems(websetId: string) {
  let items = [];
  let cursor = null;

  do {
    const res = await fetch(
      `/api/websets/${websetId}/items?limit=100${cursor ? `&cursor=${cursor}` : ''}`
    );
    const data = await res.json();
    items = [...items, ...data.data];
    cursor = data.hasMore ? data.nextCursor : null;
  } while (cursor);

  return items;
}
```

#### Step 5.3: Filters and Sorting
- Filter by criteria match status
- Sort by name, company, location
- Search within results

#### Step 5.4: Monitors (Scheduled Searches)
For pro users - automatic recurring searches:
```typescript
// POST /websets/{id}/monitors
{
  "cadence": {
    "cron": "0 9 * * 1",  // Every Monday at 9am
    "timezone": "America/New_York"
  },
  "behavior": {
    "type": "search",
    "config": {
      "query": "...",
      "count": 10,
      "criteria": [...]
    }
  }
}
```

---

## 6. Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐       │
│  │ SearchForm   │───▶│ SearchResults│───▶│CandidateTable│       │
│  │              │    │              │    │              │       │
│  │ - query      │    │ - status     │    │ - items[]    │       │
│  │ - count      │    │ - progress   │    │ - evaluations│       │
│  │ - criteria   │    │ - itemCount  │    │ - enrichments│       │
│  │ - enrichments│    └──────────────┘    └──────────────┘       │
│  └──────────────┘                                                │
│         │                     ▲                    ▲             │
└─────────┼─────────────────────┼────────────────────┼─────────────┘
          │                     │                    │
          ▼                     │                    │
┌─────────────────────────────────────────────────────────────────┐
│                       NEXT.JS API ROUTES                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  POST /api/websets          GET /api/websets/{id}               │
│  ────────────────           ──────────────────────              │
│  Create new search          Poll status & progress               │
│         │                          │                             │
│         │                          │                             │
│         ▼                          ▼                             │
│  GET /api/websets/{id}/items                                    │
│  ────────────────────────────                                   │
│  Fetch candidate results (paginated)                            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
          │                     ▲                    ▲
          │                     │                    │
          ▼                     │                    │
┌─────────────────────────────────────────────────────────────────┐
│                       EXA API CLIENT                             │
├─────────────────────────────────────────────────────────────────┤
│  src/lib/exa.ts                                                 │
│                                                                  │
│  - createWebset(params)     → POST /websets/                    │
│  - getWebset(id)            → GET /websets/{id}                 │
│  - getWebsetItems(id)       → GET /websets/{id}/items           │
│  - deleteWebset(id)         → DELETE /websets/{id}              │
│  - cancelWebset(id)         → POST /websets/{id}/cancel         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                       EXA WEBSETS API                            │
│                  https://api.exa.ai/websets/v0                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. Receives search request                                     │
│  2. Creates Webset (status: running)                            │
│  3. Search agent crawls web                                     │
│  4. Verifies each result against criteria                       │
│  5. Runs enrichments on matched items                           │
│  6. Returns structured results                                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 7. Implementation Checklist

### Week 1: Core Fixes
- [ ] Update TypeScript types to match actual API response
- [ ] Fix CandidateTable data mapping
- [ ] Add proper error handling for API calls
- [ ] Implement robust polling with useWebset hook
- [ ] Show search progress (found, analyzed, completion %)

### Week 2: Enhanced Display
- [ ] Create CriteriaEvaluation component
- [ ] Create EnrichmentResult component
- [ ] Build CandidateDetail page
- [ ] Add profile photos to table
- [ ] Implement criteria match badges

### Week 3: Search Management
- [ ] List all saved websets/searches
- [ ] View historical search results
- [ ] Delete websets
- [ ] Cancel running searches
- [ ] Add search to existing webset

### Week 4: Polish & Advanced
- [ ] Export to CSV/JSON
- [ ] Pagination for large results
- [ ] Filter by criteria match status
- [ ] Sort results
- [ ] Search within results
- [ ] Mobile responsive design

---

## 8. Testing Strategy

### 8.1 API Integration Tests
```typescript
// Test create webset
const webset = await createWebset({
  search: {
    query: "Senior Software Engineers in San Francisco",
    count: 5,
  },
  criteria: [{ description: "Must have 5+ years experience" }],
});
expect(webset.id).toBeDefined();
expect(webset.status).toBe('running');
```

### 8.2 Polling Tests
- Test status transitions
- Test timeout handling
- Test error recovery

### 8.3 UI Tests
- Test loading states
- Test empty states
- Test error states
- Test data display accuracy

---

## 9. Error Handling

### 9.1 API Errors
| Status | Meaning | Action |
|--------|---------|--------|
| 400 | Bad Request (invalid params) | Show validation error |
| 401 | Unauthorized (bad API key) | Check API key config |
| 404 | Webset not found | Show "not found" message |
| 429 | Rate limited | Implement backoff |
| 500 | Server error | Retry with backoff |

### 9.2 Client Errors
- Network errors: Show retry button
- Timeout: Increase timeout, show message
- JSON parse errors: Log and show generic error

---

## 10. Success Metrics

1. **Search completes successfully** - Webset reaches 'idle' status
2. **Items are displayed** - Table shows real candidate data
3. **Criteria visible** - Match/miss/unclear badges work
4. **Enrichments visible** - LinkedIn, GitHub, email displayed
5. **Polling works** - UI updates as results come in
6. **No console errors** - Clean browser console

---

## Appendix A: Example API Responses

### Create Webset Response
```json
{
  "id": "ws_abc123",
  "object": "webset",
  "status": "running",
  "title": null,
  "searches": [
    {
      "id": "search_xyz",
      "object": "webset_search",
      "status": "running",
      "query": "Senior Software Engineers",
      "count": 20,
      "progress": {
        "found": 5,
        "analyzed": 12,
        "completion": 25,
        "timeLeft": 45
      }
    }
  ],
  "enrichments": [],
  "createdAt": "2026-01-20T12:00:00Z"
}
```

### List Items Response
```json
{
  "data": [
    {
      "id": "item_123",
      "object": "webset_item",
      "source": "search",
      "sourceId": "search_xyz",
      "websetId": "ws_abc123",
      "properties": {
        "type": "person",
        "url": "https://linkedin.com/in/johndoe",
        "description": "Senior Software Engineer at Google",
        "person": {
          "name": "John Doe",
          "location": "San Francisco, CA",
          "position": "Senior Software Engineer",
          "company": {
            "name": "Google",
            "location": "Mountain View, CA"
          },
          "pictureUrl": "https://..."
        }
      },
      "evaluations": [
        {
          "criterion": "Must have 5+ years experience",
          "satisfied": "yes",
          "reasoning": "Profile indicates 8 years of software engineering experience",
          "references": [
            {
              "title": "LinkedIn Profile",
              "snippet": "8 years experience...",
              "url": "https://linkedin.com/in/johndoe"
            }
          ]
        }
      ],
      "enrichments": [
        {
          "object": "enrichment_result",
          "status": "completed",
          "format": "url",
          "result": ["https://github.com/johndoe"],
          "reasoning": "Found GitHub profile linked from LinkedIn",
          "references": [...],
          "enrichmentId": "enrich_github"
        }
      ]
    }
  ],
  "hasMore": true,
  "nextCursor": "cursor_abc"
}
```

---

## Appendix B: Quick Reference

### Create a Search
```bash
curl -X POST https://api.exa.ai/websets/v0/websets \
  -H "x-api-key: YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "search": {
      "query": "Senior Software Engineers with Python",
      "count": 20,
      "criteria": [
        { "description": "Must have Python experience" },
        { "description": "Must have professional LinkedIn profile" }
      ]
    },
    "enrichments": [
      { "description": "LinkedIn URL", "format": "url" },
      { "description": "GitHub Profile", "format": "url" },
      { "description": "Work Email", "format": "text" }
    ]
  }'
```

### Check Status
```bash
curl https://api.exa.ai/websets/v0/websets/{WEBSET_ID} \
  -H "x-api-key: YOUR_KEY"
```

### Get Results
```bash
curl "https://api.exa.ai/websets/v0/websets/{WEBSET_ID}/items?limit=100" \
  -H "x-api-key: YOUR_KEY"
```
