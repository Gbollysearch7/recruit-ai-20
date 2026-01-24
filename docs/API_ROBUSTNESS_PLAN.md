# API Robustness Plan - talist.ai

## Current State Analysis

The API implementation is clean and functional but lacks production-grade resilience features. This document outlines the improvements needed to ensure the API works reliably at scale.

---

## Architecture Overview

```
FRONTEND                         API LAYER                      EXTERNAL
┌──────────────┐                ┌──────────────┐               ┌──────────────┐
│ SearchForm   │───────────────▶│ POST         │──────────────▶│ Exa AI API   │
│ useTalist    │                │ /api/websets │               │ websets/v0   │
└──────────────┘                └──────────────┘               └──────────────┘
       │                               │                              │
       │ polling                       │                              │
       ▼                               ▼                              │
┌──────────────┐                ┌──────────────┐                      │
│ GET status   │◀───────────────│ GET /[id]    │◀─────────────────────┘
│ GET items    │                │ GET /items   │
└──────────────┘                └──────────────┘
```

### Current API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/websets` | POST | Create new search |
| `/api/websets` | GET | List all searches |
| `/api/websets/[id]` | GET | Get search details |
| `/api/websets/[id]` | DELETE | Delete a search |
| `/api/websets/[id]/items` | GET | Get search results |

---

## Improvement Tasks

### 1. Request Validation & Sanitization

**Priority: High**

Add comprehensive input validation using Zod schemas:

```typescript
// Validation schema for create search
const createSearchSchema = z.object({
  query: z.string().min(1).max(1000),
  count: z.number().min(1).max(100).default(20),
  criteria: z.array(z.string().max(500)).max(10).optional(),
  enrichments: z.array(enrichmentSchema).max(5).optional(),
});
```

**Tasks:**
- [ ] Install Zod dependency
- [ ] Create validation schemas for all endpoints
- [ ] Add input sanitization (trim, escape special chars)
- [ ] Return detailed validation errors (400 responses)

---

### 2. Retry Logic with Exponential Backoff

**Priority: High**

Implement retry wrapper for transient failures:

```typescript
async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    baseDelay?: number;
    retryableStatuses?: number[];
  }
): Promise<T>
```

**Configuration:**
- Max retries: 3
- Base delay: 1000ms
- Backoff multiplier: 2x
- Retryable status codes: 429, 500, 502, 503, 504

**Tasks:**
- [ ] Create `withRetry` utility function
- [ ] Apply to all Exa API calls in ExaClient
- [ ] Add jitter to prevent thundering herd
- [ ] Log retry attempts

---

### 3. Typed Error Responses

**Priority: Medium**

Standardize error response format:

```typescript
interface ApiError {
  code: string;           // e.g., "VALIDATION_ERROR", "EXA_API_ERROR"
  message: string;        // Human-readable message
  details?: unknown;      // Additional context
  requestId?: string;     // For debugging/support
  timestamp: string;      // ISO timestamp
}
```

**Error Codes:**
| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid request parameters |
| `NOT_FOUND` | 404 | Resource not found |
| `RATE_LIMITED` | 429 | Too many requests |
| `EXA_API_ERROR` | 502 | Upstream Exa API error |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

**Tasks:**
- [ ] Create ApiError type and helper functions
- [ ] Update all route handlers to use typed errors
- [ ] Add request ID generation
- [ ] Update frontend to handle error codes

---

### 4. Request Timeout Handling

**Priority: High**

Add AbortController for request timeouts:

```typescript
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 30000);

try {
  const response = await fetch(url, {
    signal: controller.signal,
    ...options
  });
} finally {
  clearTimeout(timeout);
}
```

**Configuration:**
- Default timeout: 30 seconds
- Configurable per-request
- Clean abort on success

**Tasks:**
- [ ] Add timeout to ExaClient.request()
- [ ] Handle AbortError gracefully
- [ ] Make timeout configurable
- [ ] Add timeout to polling requests

---

### 5. Cancel Webset Endpoint

**Priority: Medium**

Expose the existing cancel functionality:

```typescript
// POST /api/websets/[id]/cancel
export async function POST(request: Request, { params }) {
  const { id } = await params;
  const client = getExaClient();
  const result = await client.cancelWebset(id);
  return NextResponse.json(result);
}
```

**Tasks:**
- [ ] Create `/api/websets/[id]/cancel/route.ts`
- [ ] Add cancel button to search UI
- [ ] Update useTalist hook to use new endpoint
- [ ] Handle cancel during polling

---

### 6. Rate Limiting Awareness

**Priority: Medium**

Handle Exa API rate limits gracefully:

```typescript
// Check for rate limit headers
const remaining = response.headers.get('x-ratelimit-remaining');
const resetTime = response.headers.get('x-ratelimit-reset');

if (response.status === 429) {
  const retryAfter = response.headers.get('retry-after');
  // Queue request for later
}
```

**Tasks:**
- [ ] Parse rate limit headers from Exa responses
- [ ] Implement request queuing when approaching limits
- [ ] Add rate limit info to API responses
- [ ] Show rate limit warnings in UI

---

### 7. Comprehensive API Logging

**Priority: Medium**

Add structured logging for debugging:

```typescript
interface RequestLog {
  requestId: string;
  method: string;
  path: string;
  duration: number;
  status: number;
  error?: string;
  userId?: string;
}
```

**Tasks:**
- [ ] Create logging utility
- [ ] Log all incoming requests
- [ ] Log all Exa API calls with timing
- [ ] Log errors with full context
- [ ] Add log aggregation (optional: integrate with service)

---

### 8. End-to-End Testing

**Priority: High**

Test complete API flows:

**Test Scenarios:**
1. **Happy Path**
   - Create search → Poll → Complete → Get items
   - Verify all data transforms correctly

2. **Error Handling**
   - Invalid query (empty, too long)
   - Invalid count (0, negative, >100)
   - Non-existent webset ID
   - Network failures during polling

3. **Edge Cases**
   - Empty search results
   - Very large result sets (pagination)
   - Concurrent searches
   - Cancel during search

**Tasks:**
- [ ] Set up test environment with mock Exa API
- [ ] Write integration tests for all endpoints
- [ ] Write unit tests for ExaClient
- [ ] Add CI/CD pipeline for tests

---

## Implementation Priority

| Phase | Tasks | Timeline |
|-------|-------|----------|
| **Phase 1** | Validation, Timeouts, Retry Logic | Week 1 |
| **Phase 2** | Error Types, Cancel Endpoint | Week 2 |
| **Phase 3** | Rate Limiting, Logging | Week 3 |
| **Phase 4** | Testing, Documentation | Week 4 |

---

## File Structure (After Implementation)

```
src/
├── lib/
│   ├── exa.ts                    # ExaClient (updated)
│   ├── api/
│   │   ├── errors.ts             # ApiError types & helpers
│   │   ├── validation.ts         # Zod schemas
│   │   ├── retry.ts              # Retry utility
│   │   ├── logger.ts             # Logging utility
│   │   └── rate-limit.ts         # Rate limit handling
│   └── hooks/
│       └── useTalist.ts          # Updated with cancel
├── app/
│   └── api/
│       └── websets/
│           ├── route.ts          # Updated with validation
│           └── [id]/
│               ├── route.ts      # Updated with validation
│               ├── items/
│               │   └── route.ts  # Updated with validation
│               └── cancel/
│                   └── route.ts  # NEW: Cancel endpoint
└── tests/
    ├── api/
    │   ├── websets.test.ts
    │   └── exa-client.test.ts
    └── mocks/
        └── exa-api.ts
```

---

## Success Metrics

- **Reliability**: 99.9% success rate for API calls
- **Latency**: P95 response time < 500ms (excluding Exa API time)
- **Error Handling**: 100% of errors return typed responses
- **Test Coverage**: >80% for API routes and ExaClient

---

## Notes

- All changes should be backward compatible
- Frontend error handling should be updated alongside API changes
- Consider adding health check endpoint (`/api/health`)
- Monitor Exa API status for upstream issues
