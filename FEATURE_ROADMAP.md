# talist.ai Feature Roadmap

> A comprehensive plan to elevate talist.ai into a production-grade recruitment SaaS platform.

---

## Table of Contents

1. [High-Impact Features (Phase 1)](#high-impact-features-phase-1)
2. [Competitive Differentiators (Phase 2)](#competitive-differentiators-phase-2)
3. [Nice-to-Have Enhancements (Phase 3)](#nice-to-have-enhancements-phase-3)
4. [Technical Infrastructure](#technical-infrastructure)
5. [Database Schema Changes](#database-schema-changes)
6. [Implementation Priority Matrix](#implementation-priority-matrix)

---

## High-Impact Features (Phase 1)

### 1. Candidate Pipeline/Stages

**Overview:** Enable users to track candidates through a hiring workflow with visual pipeline management.

**Features:**
- Predefined stages: `New` → `Contacted` → `Interviewing` → `Offer` → `Hired` → `Rejected`
- Custom stage creation
- Kanban board view for visual drag-and-drop management
- Stage transition history with timestamps
- Conversion rate analytics at each stage
- Bulk stage updates

**User Stories:**
- As a recruiter, I want to move candidates through stages so I can track their progress
- As a hiring manager, I want to see a Kanban view of all candidates so I can visualize my pipeline
- As a team lead, I want to see conversion rates so I can identify bottlenecks

**UI Components Needed:**
- `PipelineBoard.tsx` - Kanban board component
- `StageColumn.tsx` - Individual stage column
- `CandidateCard.tsx` - Draggable candidate card
- `StageSelector.tsx` - Dropdown for stage selection
- `PipelineAnalytics.tsx` - Conversion funnel visualization

**Database Changes:**
```sql
-- Candidate stages table
CREATE TABLE candidate_stages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  color VARCHAR(7) DEFAULT '#6366f1',
  position INTEGER NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Candidate pipeline entries
CREATE TABLE pipeline_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id UUID NOT NULL,
  search_id UUID REFERENCES exa_searches(id) ON DELETE CASCADE,
  stage_id UUID REFERENCES candidate_stages(id),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  notes TEXT,
  moved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stage transition history
CREATE TABLE stage_transitions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pipeline_entry_id UUID REFERENCES pipeline_entries(id) ON DELETE CASCADE,
  from_stage_id UUID REFERENCES candidate_stages(id),
  to_stage_id UUID REFERENCES candidate_stages(id),
  transitioned_by UUID REFERENCES auth.users(id),
  transitioned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

### 2. Bulk Actions & Outreach

**Overview:** Enable efficient multi-candidate operations and outreach tracking.

**Features:**
- Multi-select candidates across searches
- Bulk export to CSV/Excel
- Bulk add to lists
- Bulk stage changes
- Email sequence templates
- Outreach tracking (sent, opened, replied)
- Integration with email providers

**User Stories:**
- As a recruiter, I want to select multiple candidates and export them so I can share with hiring managers
- As a sourcer, I want to track my outreach so I can follow up appropriately
- As a team member, I want to use email templates so I can maintain consistent messaging

**UI Components Needed:**
- `BulkActionBar.tsx` - Floating action bar for bulk operations (already exists, enhance)
- `EmailTemplateEditor.tsx` - Rich text template editor
- `OutreachTracker.tsx` - Track email status
- `SequenceBuilder.tsx` - Multi-step email sequence creator
- `BulkExportDialog.tsx` - Export configuration modal

**Database Changes:**
```sql
-- Email templates
CREATE TABLE email_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  subject VARCHAR(500) NOT NULL,
  body TEXT NOT NULL,
  variables JSONB DEFAULT '[]',
  is_shared BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Outreach records
CREATE TABLE outreach_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL,
  template_id UUID REFERENCES email_templates(id),
  channel VARCHAR(50) DEFAULT 'email', -- email, linkedin, phone
  status VARCHAR(50) DEFAULT 'pending', -- pending, sent, opened, clicked, replied, bounced
  sent_at TIMESTAMP WITH TIME ZONE,
  opened_at TIMESTAMP WITH TIME ZONE,
  replied_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email sequences
CREATE TABLE email_sequences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  steps JSONB NOT NULL, -- Array of {delay_days, template_id, condition}
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

### 3. Team Collaboration

**Overview:** Enable teams to work together on recruitment with shared resources and activity tracking.

**Features:**
- Workspace/Organization creation
- Team member invitations (email-based)
- Role-based permissions (Admin, Member, Viewer)
- Shared searches and lists
- Candidate notes visible to team
- Real-time activity feed
- @mentions in notes
- Team-wide analytics

**User Stories:**
- As a team admin, I want to invite colleagues so we can collaborate on hiring
- As a team member, I want to see what my colleagues are doing so we don't duplicate efforts
- As a recruiter, I want to leave notes on candidates that my team can see

**UI Components Needed:**
- `TeamSettings.tsx` - Team management page
- `InviteModal.tsx` - Invite team members
- `ActivityFeed.tsx` - Real-time activity stream (already exists, enhance)
- `TeamMemberList.tsx` - List of team members
- `PermissionSelector.tsx` - Role assignment dropdown
- `SharedBadge.tsx` - Indicator for shared resources

**Database Changes:**
```sql
-- Organizations/Workspaces
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Organization members
CREATE TABLE organization_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'member', -- owner, admin, member, viewer
  invited_by UUID REFERENCES auth.users(id),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(organization_id, user_id)
);

-- Invitations
CREATE TABLE invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'member',
  invited_by UUID REFERENCES auth.users(id),
  token VARCHAR(100) UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activity log
CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL, -- candidate_added, note_created, stage_changed, etc.
  entity_type VARCHAR(50) NOT NULL, -- candidate, search, list, etc.
  entity_id UUID NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Candidate notes (team-visible)
CREATE TABLE candidate_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id UUID NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_private BOOLEAN DEFAULT false,
  mentions UUID[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

### 4. Smart Filters & Saved Views

**Overview:** Enable advanced filtering with the ability to save and reuse filter combinations.

**Features:**
- Multi-criteria filtering
- Boolean operators (AND, OR, NOT)
- Filter by enrichment data availability
- Filter by candidate score/match quality
- Save filter combinations as "Views"
- Quick filter presets
- Search within results

**User Stories:**
- As a recruiter, I want to filter candidates with verified emails so I can focus on contactable people
- As a hiring manager, I want to save my filter preferences so I don't have to recreate them
- As a sourcer, I want to use boolean search so I can create complex queries

**UI Components Needed:**
- `AdvancedFilterPanel.tsx` - Comprehensive filter interface
- `FilterChip.tsx` - Visual filter tag
- `SavedViewsDropdown.tsx` - Quick access to saved views
- `BooleanQueryBuilder.tsx` - Visual boolean query builder
- `FilterPresets.tsx` - Common filter shortcuts

**Database Changes:**
```sql
-- Saved views/filters
CREATE TABLE saved_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  filters JSONB NOT NULL, -- {field, operator, value}[]
  sort_by VARCHAR(100),
  sort_order VARCHAR(10) DEFAULT 'desc',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

### 5. Candidate Scoring/Ranking

**Overview:** AI-powered scoring system to rank candidates based on match quality.

**Features:**
- Automatic match scoring (0-100)
- Criteria-based scoring breakdown
- Custom weighting for criteria
- Visual score indicators (badges, progress bars)
- Sort by best match
- Score explanations
- Threshold alerts

**User Stories:**
- As a recruiter, I want to see candidate scores so I can prioritize my outreach
- As a hiring manager, I want to understand why a candidate scored high/low
- As a team lead, I want to set minimum score thresholds for my team

**UI Components Needed:**
- `ScoreBadge.tsx` - Visual score indicator
- `ScoreBreakdown.tsx` - Detailed scoring explanation
- `CriteriaWeightEditor.tsx` - Adjust criteria importance
- `ScoreThresholdSetter.tsx` - Set minimum acceptable scores

**Database Changes:**
```sql
-- Scoring configurations
CREATE TABLE scoring_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  search_id UUID REFERENCES exa_searches(id) ON DELETE CASCADE,
  weights JSONB NOT NULL, -- {criterion: weight}
  threshold INTEGER DEFAULT 70,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Candidate scores (cached)
CREATE TABLE candidate_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id UUID NOT NULL,
  search_id UUID REFERENCES exa_searches(id) ON DELETE CASCADE,
  overall_score INTEGER NOT NULL,
  breakdown JSONB NOT NULL, -- {criterion: {score, reason}}
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## Competitive Differentiators (Phase 2)

### 6. Chrome Extension

**Overview:** Browser extension to source candidates directly from LinkedIn and other platforms.

**Features:**
- One-click profile capture from LinkedIn
- Add candidates to lists while browsing
- Quick search from any webpage
- Profile auto-enrichment
- Duplicate detection
- Offline queue for adding candidates

**Technical Requirements:**
- Chrome Extension (Manifest V3)
- Firefox Add-on support
- Content scripts for LinkedIn integration
- Background service worker for API calls
- Popup UI for quick actions

**Extension Structure:**
```
extension/
├── manifest.json
├── background/
│   └── service-worker.js
├── content/
│   ├── linkedin.js
│   └── styles.css
├── popup/
│   ├── popup.html
│   ├── popup.js
│   └── popup.css
├── options/
│   ├── options.html
│   └── options.js
└── assets/
    └── icons/
```

---

### 7. AI-Powered Insights

**Overview:** Leverage AI to provide actionable insights and recommendations.

**Features:**
- "Similar candidates" recommendations
- Skill gap analysis for roles
- Market insights (salary ranges, availability trends)
- Search query suggestions
- Auto-generated candidate summaries
- Ideal candidate profile generation
- Competitive talent mapping

**User Stories:**
- As a recruiter, I want to find similar candidates to my best hires
- As a hiring manager, I want to understand market salary ranges
- As a sourcer, I want AI to suggest better search queries

**API Endpoints Needed:**
```
POST /api/insights/similar-candidates
POST /api/insights/skill-gap
GET  /api/insights/market-data
POST /api/insights/suggest-queries
POST /api/insights/summarize-candidate
```

---

### 8. Integrations

**Overview:** Connect talist.ai with popular ATS, calendar, and productivity tools.

**Supported Integrations:**

| Integration | Type | Priority |
|-------------|------|----------|
| Greenhouse | ATS | High |
| Lever | ATS | High |
| Workday | ATS | Medium |
| Ashby | ATS | Medium |
| Google Calendar | Calendar | High |
| Outlook Calendar | Calendar | Medium |
| Slack | Notifications | High |
| Zapier | Automation | High |
| Webhooks | Custom | High |

**Database Changes:**
```sql
-- Integration connections
CREATE TABLE integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL, -- greenhouse, lever, slack, etc.
  credentials JSONB NOT NULL, -- Encrypted tokens
  settings JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  last_synced_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Webhook endpoints
CREATE TABLE webhooks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  url VARCHAR(500) NOT NULL,
  events VARCHAR(100)[] NOT NULL, -- candidate.added, search.completed, etc.
  secret VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  last_triggered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## Nice-to-Have Enhancements (Phase 3)

### 9. Analytics Dashboard

**Overview:** Comprehensive analytics to track recruitment performance.

**Metrics to Track:**
- Search performance (results count, quality scores)
- Pipeline velocity (time in each stage)
- Source effectiveness (which searches yield best candidates)
- Team productivity (actions per user)
- Conversion rates (contacted → hired)
- Time-to-hire trends
- Response rates by outreach channel

**UI Components Needed:**
- `AnalyticsDashboard.tsx` - Main analytics page
- `MetricCard.tsx` - Individual metric display
- `FunnelChart.tsx` - Conversion funnel
- `TrendChart.tsx` - Time-series visualization
- `ComparisonTable.tsx` - Period-over-period comparison
- `ExportReport.tsx` - PDF/CSV report generation

---

### 10. Enhanced Candidate Profiles

**Overview:** Unified candidate view with comprehensive data and interaction history.

**Features:**
- Unified profile page with all data
- Interaction timeline (emails, notes, stage changes)
- Document attachments (resumes, cover letters)
- Custom fields and tags
- Social profile aggregation
- Work history visualization
- Skills matrix

**UI Components Needed:**
- `CandidateProfile.tsx` - Full profile page
- `InteractionTimeline.tsx` - Activity history
- `DocumentUploader.tsx` - File attachment
- `TagManager.tsx` - Custom tags
- `SkillsMatrix.tsx` - Skills visualization
- `WorkHistory.tsx` - Career timeline

**Database Changes:**
```sql
-- Candidate documents
CREATE TABLE candidate_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id UUID NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL, -- resume, cover_letter, portfolio, other
  file_url VARCHAR(500) NOT NULL,
  file_size INTEGER,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Custom fields
CREATE TABLE custom_fields (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL, -- text, number, date, select, multiselect
  options JSONB, -- For select/multiselect types
  is_required BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Custom field values
CREATE TABLE custom_field_values (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id UUID NOT NULL,
  field_id UUID REFERENCES custom_fields(id) ON DELETE CASCADE,
  value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(candidate_id, field_id)
);

-- Candidate tags
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  color VARCHAR(7) DEFAULT '#6366f1',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(organization_id, name)
);

CREATE TABLE candidate_tags (
  candidate_id UUID NOT NULL,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY(candidate_id, tag_id)
);
```

---

## Technical Infrastructure

### Required Infrastructure Updates

1. **Background Job Processing**
   - Implement job queue (Bull/BullMQ with Redis)
   - Handle email sending, webhook delivery, score calculation
   - Scheduled tasks for monitoring and alerts

2. **Real-time Updates**
   - Implement WebSocket connections (Socket.io or Supabase Realtime)
   - Live activity feed updates
   - Collaborative editing notifications

3. **File Storage**
   - Supabase Storage for documents
   - Image optimization pipeline
   - Secure URL generation

4. **Search Infrastructure**
   - Full-text search with PostgreSQL
   - Consider Elasticsearch for advanced queries
   - Search result caching

5. **Analytics Pipeline**
   - Event tracking implementation
   - Data aggregation jobs
   - Time-series data storage

### API Rate Limiting & Quotas

```typescript
// Usage limits by plan
const PLAN_LIMITS = {
  free: {
    searchesPerMonth: 10,
    candidatesPerSearch: 20,
    teamMembers: 1,
    storage: '100MB',
  },
  pro: {
    searchesPerMonth: 100,
    candidatesPerSearch: 100,
    teamMembers: 5,
    storage: '5GB',
  },
  enterprise: {
    searchesPerMonth: -1, // Unlimited
    candidatesPerSearch: 500,
    teamMembers: -1,
    storage: '50GB',
  },
};
```

---

## Implementation Priority Matrix

| Feature | Impact | Effort | Priority | Phase |
|---------|--------|--------|----------|-------|
| Candidate Pipeline | High | Medium | P0 | 1 |
| Bulk Actions | High | Low | P0 | 1 |
| Team Collaboration | High | High | P1 | 1 |
| Smart Filters | Medium | Low | P1 | 1 |
| Candidate Scoring | High | Medium | P1 | 1 |
| Chrome Extension | High | High | P2 | 2 |
| AI Insights | Medium | High | P2 | 2 |
| Integrations | High | High | P2 | 2 |
| Analytics Dashboard | Medium | Medium | P3 | 3 |
| Enhanced Profiles | Medium | Medium | P3 | 3 |

---

## Suggested Implementation Order

### Sprint 1-2: Foundation
- [ ] Candidate Pipeline/Stages
- [ ] Basic Kanban board
- [ ] Stage management

### Sprint 3-4: Collaboration
- [ ] Bulk Actions enhancement
- [ ] Team workspace setup
- [ ] Activity feed

### Sprint 5-6: Intelligence
- [ ] Smart Filters
- [ ] Saved Views
- [ ] Candidate Scoring

### Sprint 7-8: Extensions
- [ ] Chrome Extension MVP
- [ ] Basic integrations (Slack, Webhooks)

### Sprint 9-10: Analytics
- [ ] Analytics Dashboard
- [ ] Enhanced Profiles
- [ ] AI Insights MVP

---

## Success Metrics

| Feature | KPI | Target |
|---------|-----|--------|
| Pipeline | Stage adoption rate | >80% of users |
| Bulk Actions | Actions per session | +50% |
| Team Collaboration | Multi-user orgs | 30% of accounts |
| Smart Filters | Filter usage rate | >60% of searches |
| Scoring | Scored candidates | >90% |
| Chrome Extension | Weekly active installs | 1000+ |
| Integrations | Connected accounts | 40% |
| Analytics | Dashboard views | 2x/week per user |

---

## Next Steps

1. **Review this roadmap** with stakeholders
2. **Prioritize features** based on user feedback
3. **Create detailed specs** for Phase 1 features
4. **Set up project tracking** (Linear, Jira, etc.)
5. **Begin Sprint 1** implementation

---

*Last Updated: January 2026*
*Version: 1.0*
