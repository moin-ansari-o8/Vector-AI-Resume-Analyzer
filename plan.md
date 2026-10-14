# VECTOR — AI Resume Intelligence

## Frontend Implementation Plan v1.0

> **Governing document:** [`.github/skills/website_constitution.md`](file:///o:/ME/VIT/projects/python_fds/AI-Resume-Analyzer/.github/skills/website_constitution.md)
> **Design specification:** [`designer.md`](file:///o:/ME/VIT/projects/python_fds/AI-Resume-Analyzer/designer.md)
> **Backend reference:** [`backend/app/main.py`](file:///o:/ME/VIT/projects/python_fds/AI-Resume-Analyzer/backend/app/main.py)

---

## ⚠️ CONTINUATION PROTOCOL — READ THIS FIRST

This plan is designed so that **any AI model or developer** can continue building
the frontend without breaking established patterns. If you are a new agent
picking up this work:

1. **Read this entire file** before writing any code.
2. **Read** [`designer.md`](file:///o:/ME/VIT/projects/python_fds/AI-Resume-Analyzer/designer.md) for the full visual/UX specification.
3. **Read** [`.github/skills/website_constitution.md`](file:///o:/ME/VIT/projects/python_fds/AI-Resume-Analyzer/.github/skills/website_constitution.md) — all code must comply with USECS v2.0.
4. **Check the progress tracker** at the bottom of this file to see what is done and what remains.
5. **Never deviate** from the folder structure, naming conventions, design tokens, component API patterns, or architectural decisions locked in this plan.
6. **Update the progress tracker** at the bottom as you complete phases.

> If you are uncertain about a pattern, **look at existing code first** before inventing new patterns. Consistency > creativity.

---

## 1. PROJECT IDENTITY

| Property | Value |
|---|---|
| Product name | VECTOR — AI Resume Intelligence |
| Type | Professional analytical web application |
| Framework | React 19 + TypeScript + Vite |
| Styling | Tailwind CSS v4 |
| State | Zustand |
| Server state | TanStack Query v5 |
| Routing | React Router v7 |
| Motion | Framer Motion |
| Icons | Lucide React |
| Charts | Recharts |
| HTTP | Axios |
| Backend | FastAPI (separate server, CORS enabled) |
| AI model layer | Ollama (local) via backend |
| Vector DB | ChromaDB via backend |

---

## 2. DESIGN SYSTEM — LOCKED TOKENS

All values below are **final**. Do not change them without updating this document first.

### 2.1 Color Palette

Define these in `tailwind.config.ts` under `theme.extend.colors` and as CSS custom properties in `src/styles/globals.css`.

```
Token name           Hex         Tailwind alias       Usage
─────────────────────────────────────────────────────────────────
--bg-primary         #0B0C0C     bg-primary           Main page background
--bg-secondary       #111313     bg-secondary         Secondary surfaces, sidebar
--bg-elevated        #171919     bg-elevated          Elevated panels, cards, modals
--bg-hover           #1E2020     bg-hover             Hover states on surfaces

--text-primary       #E9E7DF     text-primary         Main body text, headings
--text-secondary     #959992     text-secondary       Labels, metadata, captions
--text-muted         #6B6F69     text-muted           Disabled text, placeholders

--accent-primary     #C7FF4A     accent-primary       Primary CTA, active states, key indicators
--accent-warning     #D99A3D     accent-warning       Warnings, attention states
--accent-negative    #E66A55     accent-negative      Missing skills, errors, destructive
--accent-positive    #7FD6A1     accent-positive      Matched skills, success states

--border-default     #1E2020     border-default       Default borders (very subtle)
--border-hover       #2A2D2A     border-hover         Hover state borders
--border-active      #C7FF4A33   border-active        Active/focus borders (accent at 20% opacity)
```

### 2.2 Typography

```
Font stack:
  Primary:   "Inter", system-ui, -apple-system, sans-serif
  Mono:      "JetBrains Mono", "Fira Code", monospace

Scale:
  display    — 48px / 700 / -0.02em / leading-tight     (dashboard hero numbers)
  h1         — 32px / 700 / -0.015em / leading-tight    (page titles)
  h2         — 24px / 600 / -0.01em / leading-snug      (section headings)
  h3         — 18px / 600 / normal / leading-normal      (card titles)
  body       — 14px / 400 / normal / leading-relaxed     (default body)
  body-sm    — 13px / 400 / normal / leading-relaxed     (secondary text)
  caption    — 11px / 500 / 0.04em / uppercase           (eyebrow labels, metadata)
  mono       — 12px / 400 / normal                       (technical data, timestamps)
```

### 2.3 Spacing Scale

Follow Tailwind defaults mapped to this system:

```
4px  (1)    — micro gap, icon-text
8px  (2)    — tight interior padding
12px (3)    — compact component padding
16px (4)    — standard padding
24px (6)    — section padding
32px (8)    — between sections
48px (12)   — major section breaks
64px (16)   — page-level spacing
```

### 2.4 Geometry

```
radius-sm    — 4px   (tags, small chips)
radius-md    — 6px   (buttons, inputs)
radius-lg    — 8px   (cards, panels)
radius-xl    — 12px  (modals)

shadow-sm    — 0 1px 2px rgba(0,0,0,0.3)
shadow-md    — 0 4px 12px rgba(0,0,0,0.25)
shadow-lg    — 0 8px 24px rgba(0,0,0,0.3)
```

### 2.5 Motion Standards

```
duration-fast     — 120ms   (hover, micro-interactions)
duration-normal   — 200ms   (expand/collapse, page transitions)
duration-slow     — 350ms   (score animations, chart reveals)
easing            — cubic-bezier(0.16, 1, 0.3, 1)   (smooth deceleration)
```

---

## 3. ARCHITECTURE — LOCKED FOLDER STRUCTURE

```
frontend/
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── tailwind.config.ts
├── postcss.config.js
├── vite.config.ts
├── .env
├── .env.example
│
└── src/
    ├── main.tsx                          — App entry point
    ├── App.tsx                           — Root component, router mount
    ├── vite-env.d.ts
    │
    ├── api/                              — Axios instance & endpoint definitions
    │   ├── client.ts                     — Axios instance with baseURL, interceptors
    │   ├── resume.api.ts                 — Resume endpoint calls
    │   ├── job.api.ts                    — Job endpoint calls
    │   ├── matching.api.ts               — Matching endpoint calls
    │   ├── skillGap.api.ts               — Skill gap endpoint calls
    │   ├── chat.api.ts                   — Chat endpoint calls
    │   ├── explainability.api.ts         — Explainability endpoint calls
    │   ├── recommendation.api.ts         — Recommendation endpoint calls
    │   ├── resumeImprovement.api.ts      — Resume improvement endpoint calls
    │   └── ingestion.api.ts              — Ingestion endpoint calls
    │
    ├── assets/                           — Static assets (SVGs, images)
    │   └── logo.svg
    │
    ├── components/                       — All React components
    │   ├── shared/                       — Reusable across pages
    │   │   ├── AppShell.tsx              — Sidebar + TopBar + content wrapper
    │   │   ├── Sidebar.tsx
    │   │   ├── TopBar.tsx
    │   │   ├── Search.tsx                — Global search component
    │   │   ├── StatReadout.tsx           — Single stat display (number + label)
    │   │   ├── MatchRing.tsx             — Circular score indicator
    │   │   ├── SkillTag.tsx              — Skill chip with matched/missing state
    │   │   ├── DataTable.tsx             — Generic sortable table
    │   │   ├── UploadZone.tsx            — Document drag-and-drop uploader
    │   │   ├── ParsingStatus.tsx         — Multi-step parsing progress
    │   │   ├── Toast.tsx                 — Toast notification component
    │   │   ├── Modal.tsx                 — Accessible modal dialog
    │   │   ├── Dropdown.tsx              — Dropdown menu component
    │   │   ├── Tabs.tsx                  — Tab navigation component
    │   │   ├── EmptyState.tsx            — Empty state placeholder
    │   │   ├── SkeletonLoader.tsx        — Loading skeleton components
    │   │   └── Button.tsx                — Button with variant system
    │   │
    │   ├── dashboard/                    — Dashboard-specific components
    │   │   ├── StatsRow.tsx
    │   │   ├── RecentMatchesTable.tsx
    │   │   └── SignalFeed.tsx
    │   │
    │   ├── resume/                       — Resume page components
    │   │   ├── ResumeRow.tsx
    │   │   ├── ResumeTable.tsx
    │   │   └── DocumentViewer.tsx
    │   │
    │   ├── job/                          — Job page components
    │   │   ├── JobRow.tsx
    │   │   ├── JobTable.tsx
    │   │   └── JobInputForm.tsx
    │   │
    │   ├── analysis/                     — Analysis Studio components
    │   │   ├── AnalysisPanel.tsx
    │   │   ├── ScoreBreakdown.tsx
    │   │   ├── SkillSignals.tsx
    │   │   ├── ExplainabilityPanel.tsx
    │   │   └── AnalysisActionBar.tsx
    │   │
    │   ├── improvement/                  — Resume improvement components
    │   │   ├── SuggestionCard.tsx
    │   │   ├── OriginalResume.tsx
    │   │   └── ImprovementWorkspace.tsx
    │   │
    │   └── chat/                         — AI assistant components
    │       ├── AIChat.tsx                — Floating chat panel
    │       ├── ChatMessage.tsx
    │       └── SuggestedPrompts.tsx
    │
    ├── config/                           — App-wide configuration
    │   └── app.config.ts                 — API base URL, feature flags
    │
    ├── constants/                        — Named constants
    │   ├── routes.ts                     — Route path constants
    │   ├── navigation.ts                 — Sidebar nav items
    │   └── skills.ts                     — Skill normalization map
    │
    ├── hooks/                            — Custom React hooks
    │   ├── useResumeUpload.ts
    │   ├── useMatching.ts
    │   ├── useSkillGap.ts
    │   ├── useChat.ts
    │   └── useDebounce.ts
    │
    ├── layouts/                          — Layout wrappers
    │   └── DashboardLayout.tsx           — AppShell wrapper for all pages
    │
    ├── mocks/                            — Mock data for development
    │   ├── resumes.mock.ts
    │   ├── jobs.mock.ts
    │   ├── matches.mock.ts
    │   ├── analysis.mock.ts
    │   └── signals.mock.ts
    │
    ├── pages/                            — Route-level page components
    │   ├── DashboardPage.tsx             — /
    │   ├── ResumesPage.tsx               — /resumes
    │   ├── ResumeDetailPage.tsx          — /resumes/:id
    │   ├── JobsPage.tsx                  — /jobs
    │   ├── MatchResultsPage.tsx          — /jobs/:id/matches
    │   ├── AnalysisStudioPage.tsx        — /analysis
    │   ├── ResumeImprovementPage.tsx     — /improvement
    │   ├── SettingsPage.tsx              — /settings
    │   └── NotFoundPage.tsx              — 404
    │
    ├── routes/                           — Route definitions
    │   └── AppRouter.tsx                 — React Router configuration
    │
    ├── services/                         — Business logic, mock toggle
    │   ├── resume.service.ts             — Calls api/ or returns mock
    │   ├── job.service.ts
    │   ├── matching.service.ts
    │   ├── chat.service.ts
    │   ├── analysis.service.ts
    │   └── improvement.service.ts
    │
    ├── store/                            — Zustand global state
    │   ├── useAppStore.ts                — Theme, sidebar collapsed, notifications
    │   ├── useResumeStore.ts             — Active resume, resume list
    │   ├── useJobStore.ts                — Active job, job list
    │   └── useAnalysisStore.ts           — Active analysis state
    │
    ├── styles/                           — Global styles
    │   └── globals.css                   — Tailwind directives, CSS custom properties, font imports
    │
    ├── types/                            — TypeScript types & interfaces
    │   ├── resume.types.ts
    │   ├── job.types.ts
    │   ├── analysis.types.ts
    │   ├── chat.types.ts
    │   └── common.types.ts
    │
    └── utils/                            — Pure utility functions
        ├── formatters.ts                 — Number, date, percentage formatters
        ├── validators.ts                 — Input validation helpers
        └── cn.ts                         — Tailwind class merge utility (clsx + twMerge)
```

---

## 4. ROUTE MAP — LOCKED

| Route | Page Component | Layout | Description |
|---|---|---|---|
| `/` | `DashboardPage` | `DashboardLayout` | Overview dashboard with stats and recent matches |
| `/resumes` | `ResumesPage` | `DashboardLayout` | Resume upload zone + resume library table |
| `/resumes/:id` | `ResumeDetailPage` | `DashboardLayout` | Document viewer + AI extraction panel |
| `/jobs` | `JobsPage` | `DashboardLayout` | Job input + job library table |
| `/jobs/:id/matches` | `MatchResultsPage` | `DashboardLayout` | Ranked candidate matches for a job |
| `/analysis` | `AnalysisStudioPage` | `DashboardLayout` | Core analysis workspace (score, skills, explainability) |
| `/improvement` | `ResumeImprovementPage` | `DashboardLayout` | Side-by-side resume improvement workspace |
| `/settings` | `SettingsPage` | `DashboardLayout` | App configuration |
| `*` | `NotFoundPage` | `DashboardLayout` | 404 fallback |

---

## 5. BACKEND API MAP — VERIFIED ENDPOINTS

These are the **real** backend endpoints from [`backend/app/main.py`](file:///o:/ME/VIT/projects/python_fds/AI-Resume-Analyzer/backend/app/main.py). All API calls must match these exactly.

```
Method   Path                          Request Body                                                                                            Response Shape

POST     /resume/upload                FormData { file: PDF }                                                                                  { filename, message, raw_text, sections, structured_data }
POST     /jobs/process                 { title, company, location, description }                                                               { title, company, location, description, required_skills[], experience_required }
POST     /matching/resume-jobs         { resume_text, top_k }                                                                                  { matches[] }
POST     /skill-gap/analyze            { candidate_skills[], required_skills[] }                                                               { matched_skills[], missing_skills[], ... }
POST     /chat/career                  { session_id, question, resume_text, resume_skills[], resume_experience }                               { session_id, question, answer }
DELETE   /chat/career/{session_id}                                                                                                             { message, session_id }
POST     /explain/job                  { candidate_skills[], candidate_experience, job: {} }                                                   { explanation }
POST     /recommendations/resume       { resume_text, resume_skills[], resume_experience, top_k }                                              { recommendations[] }
POST     /resume/improve               { resume_text, job_title, job_description, candidate_skills[], missing_skills[] }                        { job_title, suggestions }
POST     /embeddings/generate          { text }                                                                                                { dimension, embedding[] }
POST     /vector/jobs/add              { job_id, title, company, location, description, required_skills[], experience_required }                { message, job_id }
POST     /vector/jobs/search           { text, top_k }                                                                                         { results }
POST     /ingestion/jobs                                                                                                                       { message, jobs_added }
```

> **CRITICAL:** The `services/` layer must abstract these. Pages and components NEVER call `api/` directly.
>
> **Call chain:** `Component → Hook → Service → API layer → Backend`

---

## 6. STATE MANAGEMENT — LOCKED PATTERN

### 6.1 Call chain (never skip a layer)

```
Component → Hook → Service → API layer → Backend
                  ↕
              Zustand Store (for cross-component shared state)
              TanStack Query (for server state caching)
```

### 6.2 Zustand stores — scope

| Store | Manages |
|---|---|
| `useAppStore` | sidebar collapse state, notification queue, theme |
| `useResumeStore` | active resume data, parsed resume list (client cache) |
| `useJobStore` | active job data, job list (client cache) |
| `useAnalysisStore` | selected resume+job pairing, analysis results, score |

### 6.3 TanStack Query — usage

- All data-fetching hooks (`useMatching`, `useSkillGap`, etc.) use TanStack Query for caching, refetching, loading/error states.
- Mutations (upload, improve) use `useMutation`.
- Mock mode: services return static data instead of calling API.

---

## 7. MOCK DATA STRATEGY

Until the backend is connected, all `services/` files must check a feature flag:

```typescript
// config/app.config.ts
export const APP_CONFIG = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  USE_MOCKS: import.meta.env.VITE_USE_MOCKS === 'true',
} as const;
```

```typescript
// services/resume.service.ts — PATTERN (follow this for ALL services)
import { APP_CONFIG } from '@/config/app.config';
import { resumeApi } from '@/api/resume.api';
import { mockResumes } from '@/mocks/resumes.mock';

export const resumeService = {
  async getAll() {
    if (APP_CONFIG.USE_MOCKS) return mockResumes;
    return resumeApi.getAll();
  },
  // ...
};
```

**`.env` file:**

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_USE_MOCKS=true
```

**Every service file follows this pattern. No exceptions.**

---

## 8. COMPONENT DESIGN RULES — LOCKED

### 8.1 Shared component API conventions

Every shared component must:

- Accept `className?: string` for external styling overrides.
- Use the `cn()` utility for class merging (clsx + tailwind-merge).
- Be fully typed with explicit prop interfaces.
- Export both the component and its prop type.

```typescript
// PATTERN — follow this for ALL shared components
interface StatReadoutProps {
  label: string;
  value: string | number;
  change?: string;
  className?: string;
}

export function StatReadout({ label, value, change, className }: StatReadoutProps) {
  return (
    <div className={cn("...", className)}>
      {/* ... */}
    </div>
  );
}
```

### 8.2 Button variant system

```typescript
type ButtonVariant = 'primary' | 'secondary' | 'destructive' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

// Primary     → bg-accent-primary text-bg-primary font-semibold
// Secondary   → border border-border-default text-text-primary bg-transparent
// Destructive → bg-accent-negative text-white
// Ghost       → bg-transparent text-text-secondary hover:bg-bg-hover
```

All buttons support: hover, active, disabled, loading (spinner + double-click prevention), focus-visible.

### 8.3 MatchRing specification

- Thin SVG ring (`stroke-width: 3–4px`).
- Score number centered inside, `display` typography.
- Color by score: `accent-positive` (≥80), `accent-warning` (60–79), `accent-negative` (<60).
- Animate on mount: Framer Motion `pathLength` transition, `duration-slow`.

### 8.4 SkillTag specification

- Compact pill: `radius-sm`, `body-sm` text.
- Variant `matched`: subtle green bg `accent-positive/10`, green text.
- Variant `missing`: subtle red bg `accent-negative/10`, red/orange text.
- On hover: tooltip with experience years + source section.
- NOT large colorful badges. Restrained, analytical appearance.

---

## 9. LAYOUT SPECIFICATION — LOCKED

### 9.1 DashboardLayout structure

```
┌──────────────────────────────────────────────────────────────────┐
│ ┌──────────┐ ┌──────────────────────────────────────────────────┐│
│ │          │ │ TopBar (breadcrumb, search, notifications, user) ││
│ │ Sidebar  │ ├──────────────────────────────────────────────────┤│
│ │ 240px    │ │                                                  ││
│ │          │ │  <Outlet />                                      ││
│ │ Logo     │ │  (Page content)                                  ││
│ │ Nav      │ │                                                  ││
│ │ Divider  │ │                                                  ││
│ │ Activity │ │                                                  ││
│ │ Settings │ │                                                  ││
│ │          │ │                                                  ││
│ │ ──────── │ │                                                  ││
│ │ Profile  │ │                                                  ││
│ └──────────┘ └──────────────────────────────────────────────────┘│
│                                            ┌───────────────┐    │
│                                            │ "Ask VECTOR"  │    │
│                                            └───────────────┘    │
└──────────────────────────────────────────────────────────────────┘
```

### 9.2 Sidebar navigation items

```
PRIMARY:
  Overview         /            LucideIcon: LayoutDashboard
  Resumes          /resumes     LucideIcon: FileText
  Jobs             /jobs        LucideIcon: Briefcase
  Analysis Studio  /analysis    LucideIcon: FlaskConical
  Recommendations  /improvement LucideIcon: Sparkles

DIVIDER

SECONDARY:
  Activity         (panel)      LucideIcon: Activity
  Settings         /settings    LucideIcon: Settings
```

Active state: subtle `bg-bg-hover` background + thin 2px left accent bar (`accent-primary`) + brighter text (`text-primary`).

### 9.3 Responsive breakpoints

| Breakpoint | Sidebar | Behavior |
|---|---|---|
| Desktop (≥1280px) | Full 240px sidebar | Full analytical workspace |
| Tablet (768–1279px) | Icon-only rail (64px) | Collapsible sidebar |
| Mobile (<768px) | Hidden | Bottom navigation bar or compact drawer |

---

## 10. PAGE-BY-PAGE COMPONENT MAP

### 10.1 DashboardPage (`/`)

```
Shared:   AppShell, StatReadout, MatchRing, DataTable, SkillTag
Page:     StatsRow, RecentMatchesTable, SignalFeed

Layout:
  Eyebrow: "OVERVIEW" (caption style)
  Heading: "Resume intelligence, at a glance." (h1)
  StatsRow: 4x StatReadout
    - Resumes Analyzed: 128 (+14 this month)
    - Average Match: 78.4%
    - Jobs Tracked: 34
    - High-Confidence: 19
  Main: RecentMatchesTable
    Columns: Candidate, Role, Company, Score (MatchRing), Top Strengths, Missing, Timestamp
    Click row → navigate to /analysis with pairing
  Right: SignalFeed
    Live signal events with Framer Motion entrance
    Types: positive (green), negative (red), neutral (gray), info (accent)
```

### 10.2 ResumesPage (`/resumes`)

```
Shared:   UploadZone, ParsingStatus, DataTable, Button
Page:     ResumeTable, ResumeRow

Layout:
  Heading: "Resumes" (h1)
  Subheading: "Your indexed candidate documents." (text-secondary)
  UploadZone:
    Sophisticated intake area (NOT generic dashed rectangle)
    "DROP RESUME HERE" + "PDF only" + "Browse files"
  ParsingStatus states:
    Uploading → Parsing document → Extracting experience → Indexing skills → Ready
    Thin progress line + document scanning animation
  ResumeTable:
    Columns: Candidate, Role, Experience, Skills (SkillTags), Uploaded, Status, Actions
    Actions: View, Analyze, Improve, Delete
    Click row → /resumes/:id
```

### 10.3 ResumeDetailPage (`/resumes/:id`)

```
Shared:   SkillTag, Tabs
Page:     DocumentViewer

Layout (split view):
  Left: Resume document preview (rendered text by section)
  Right: AI extraction panel
    Candidate name
    Detected role
    Years of experience
    Education
    Top skills (SkillTags with years)
    Technologies
    Confidence score
  "AI extracted signals" section:
    Python — 5 yrs
    FastAPI — 3 yrs
    PostgreSQL — 4 yrs
    (etc.)
```

### 10.4 JobsPage (`/jobs`)

```
Shared:   DataTable, Button, Tabs
Page:     JobInputForm, JobTable, JobRow

Layout:
  Heading: "Job Intelligence" (h1)
  Subheading: "Roles indexed for matching." (text-secondary)
  Tabs: "Paste Description" | "Job URL"
  JobInputForm:
    Text mode: large textarea
    URL mode: URL input + "Scrape Job" button
  Processing states: Extracting → Identifying skills → Normalizing → Ready
  JobTable:
    Columns: Role, Company, Required Skills, Experience, Added, Matches count, Actions
    Action: "Find matching resumes" button
    Click → /jobs/:id/matches
```

### 10.5 MatchResultsPage (`/jobs/:id/matches`)

```
Shared:   MatchRing, SkillTag, DataTable
Page:     (inline)

Layout:
  Job summary header card
  Ranked candidate list:
    #1 — Candidate Name — 86% (MatchRing) — Strong: [Python, FastAPI] — Missing: [Kubernetes]
    #2 — ...
  Click candidate → /analysis (pre-selected pairing)
```

### 10.6 AnalysisStudioPage (`/analysis`) — **VISUAL CENTERPIECE**

```
Shared:   MatchRing, SkillTag, Dropdown, Button
Page:     AnalysisPanel, ScoreBreakdown, SkillSignals, ExplainabilityPanel, AnalysisActionBar

Layout:
  Header:
    Eyebrow: "ANALYSIS STUDIO" (caption)
    Resume selector dropdown
    Job selector dropdown

  Center:
    Large MatchRing (animated on load)
    Score: e.g. "74 MATCH"
    One-line AI summary below

  ScoreBreakdown:
    Technical skills — 91% (thin bar)
    Experience — 83% (thin bar)
    Responsibilities — 78% (thin bar)
    Infrastructure — 54% (thin bar)
    USE THIN HORIZONTAL BARS — not rounded progress bars

  SkillSignals:
    MATCHED section: green SkillTags (Python, FastAPI, PostgreSQL, REST APIs, Docker)
    MISSING section: red/orange SkillTags (Kubernetes, Terraform, AWS EKS)
    Hover → tooltip: experience years + detection source + job requirement

  ExplainabilityPanel:
    "Why this score?"
    STRONG SIGNAL → structured paragraph
    WEAK SIGNAL → structured paragraph
    IMPACT → "Infrastructure mismatch reduces score by ~14 points"
    NOT a chatbot. NOT a single paragraph. Structured analytical sections.

  AnalysisActionBar:
    [Generate Improvement Plan] (primary/accent)
    [Prepare Interview] (secondary)
    [Ask VECTOR] (ghost)
    [Save Analysis] (secondary)
```

### 10.7 ResumeImprovementPage (`/improvement`)

```
Shared:   Button, Tabs, SkillTag
Page:     ImprovementWorkspace, SuggestionCard, OriginalResume

Layout:
  Heading: "Resume Improvement" (h1)
  Subheading: "Turn analysis signals into actionable changes."
  Tabs: Original | Draft | Changes: N

  Split view:
    Left (OriginalResume):
      Rendered resume content by section (Experience, Projects, Skills, Education)

    Right (SuggestionCards):
      Each card:
        Section label (e.g. "EXPERIENCE — BULLET 02")
        Current text (muted)
        Suggested text (highlighted)
        Buttons: Accept | Reject | Edit
      Accept → animate suggestion into draft
      Reject → collapse card gracefully
```

---

## 11. FLOATING AI CHAT — SPECIFICATION

### Collapsed state

- Fixed `bottom-4 right-4`.
- Small pill button: "Ask VECTOR" + subtle animated dot (`accent-primary` pulse).
- On hover: slight scale (1.02) + subtle border glow.

### Expanded state

- 380–420px wide panel, max-height 600px.
- Header: "VECTOR Intelligence" + context line (e.g. "Context: Sarah Chen — Senior Backend Engineer").
- Message list with role-based alignment (user → right, AI → left).
- Suggested prompts: compact text pills at bottom of panel.
- AI generating state: subtle 3-dot pulse animation. NOT typewriter effect.
- Input: single-line text input + send button.

### API integration

- Uses `POST /chat/career` endpoint.
- `session_id` generated client-side (UUID), stored in `useAppStore`.
- Passes active resume context from `useResumeStore`.

---

## 12. INTERACTION & ANIMATION RULES — LOCKED

| Interaction | Specification |
|---|---|
| Hover on surface | `bg-bg-hover`, `duration-fast` (120ms), no scale |
| Hover on interactive | subtle border illumination (`border-hover`), `duration-fast` |
| Score ring mount | Framer Motion `pathLength` animation, `duration-slow` (350ms), ease-out |
| Page transition | Framer Motion `opacity` + `y` (8px shift), `duration-normal` (200ms) |
| Upload parsing | Sequential status steps with thin progress line |
| Skill tag hover | Expand tooltip below, `duration-fast` |
| Toast notification | Slide in from top-right, auto-dismiss 4s, manual dismiss |
| Modal open/close | Opacity + scale (0.97 → 1), `duration-normal` |
| Sidebar collapse | Width 240px → 64px, `duration-normal` |
| Empty state | Fade in, `duration-normal` |
| Skeleton loader | Shimmer animation (subtle gradient sweep) |

**Rule: Motion must be fast and restrained. Do NOT over-animate.**

---

## 13. ACCESSIBILITY — MANDATORY (USECS CRITICAL)

Per [Article IV, Section 2](file:///o:/ME/VIT/projects/python_fds/AI-Resume-Analyzer/.github/skills/website_constitution.md) of the constitution:

- All interactive elements: keyboard navigable (`tabIndex`, `onKeyDown`).
- All modals: focus trap, ESC to close, outside-click dismiss.
- All buttons: `aria-label` where icon-only.
- All inputs: associated `<label>`.
- All images/icons: `alt` text or `aria-hidden="true"` if decorative.
- Color contrast: WCAG AA minimum (4.5:1 body, 3:1 large text).
- Focus visible: `ring-2 ring-accent-primary ring-offset-2 ring-offset-bg-primary`.
- Semantic HTML: proper heading hierarchy (single `<h1>` per page).

---

## 14. ERROR, EMPTY & LOADING STATES — MANDATORY

Per [Article VI](file:///o:/ME/VIT/projects/python_fds/AI-Resume-Analyzer/.github/skills/website_constitution.md) of the constitution:

### Loading

- Page-level: skeleton loaders matching actual content shape.
- Component-level: shimmer on individual cards/rows.
- API calls: loading state via TanStack Query `isLoading`.

### Empty

- Every list/table must have a styled `EmptyState` component.
- Include explanation + next-action CTA.
- Example: "No resumes yet. Upload your first resume to get started." + Upload button.

### Error

- User-friendly messages. Never expose raw error codes or stack traces.
- Include retry action where appropriate.
- Toast for transient errors, inline for persistent errors.

```
BAD:  "500 Internal Server Error"
GOOD: "Unable to analyze this resume. Please try again."
```

---

## 15. IMPLEMENTATION PHASES — PROGRESS TRACKER

Update this section as phases are completed.

### Phase 1 — Foundation

- [x] Initialize Vite + React 19 + TypeScript project in `frontend/`
- [x] Install dependencies: tailwindcss, react-router, zustand, @tanstack/react-query, framer-motion, lucide-react, recharts, axios, clsx, tailwind-merge
- [x] Configure `tailwind.config.ts` with all design tokens from Section 2
- [x] Create `src/styles/globals.css` with CSS custom properties + Inter font import
- [x] Create `src/utils/cn.ts` (clsx + tailwind-merge)
- [x] Create `src/config/app.config.ts`
- [x] Create `src/constants/routes.ts`
- [x] Create all TypeScript type definitions in `src/types/`
- [x] Create `src/routes/AppRouter.tsx` with all routes from Section 4
- [x] Configure path alias `@/` → `src/` in `vite.config.ts` and `tsconfig.json`

### Phase 2 — Shell & Navigation

- [x] Build `DashboardLayout.tsx`
- [x] Build `Sidebar.tsx` with nav items, active state, collapse behavior
- [x] Build `TopBar.tsx` with breadcrumb, search placeholder, notifications, profile
- [x] Build `AppShell.tsx` composing Sidebar + TopBar + content area
- [x] Implement sidebar collapse animation (240px → 64px icon rail)
- [x] Implement responsive breakpoints (tablet rail, mobile bottom nav)

### Phase 3 — Shared Components

- [x] Build `Button.tsx` with 4 variants × 3 sizes + all states
- [x] Build `StatReadout.tsx`
- [x] Build `MatchRing.tsx` (SVG ring + Framer Motion + color by score)
- [x] Build `SkillTag.tsx` (matched/missing variants + hover tooltip)
- [x] Build `DataTable.tsx` (generic, sortable, typed)
- [x] Build `UploadZone.tsx` (drag-and-drop PDF)
- [x] Build `ParsingStatus.tsx` (multi-step progress)
- [x] Build `Toast.tsx` + notification system
- [x] Build `Modal.tsx` (accessible, focus trap, ESC close)
- [x] Build `Dropdown.tsx`
- [x] Build `Tabs.tsx`
- [x] Build `EmptyState.tsx`
- [x] Build `SkeletonLoader.tsx`
- [x] Build `Search.tsx`

### Phase 4 — Mock Data

- [x] Create `resumes.mock.ts` — 6–8 realistic candidates
- [x] Create `jobs.mock.ts` — 8–10 realistic roles (base from existing `data/jobs/jobs.json`)
- [x] Create `matches.mock.ts` — pre-computed resume↔job match results
- [x] Create `analysis.mock.ts` — score breakdowns, skill signals, explainability text
- [x] Create `signals.mock.ts` — dashboard signal feed events

### Phase 5 — Service & Store Layer

- [x] Create `src/api/client.ts` (Axios instance, baseURL, interceptors)
- [x] Create all `src/api/*.api.ts` files matching Section 5 endpoints
- [x] Create all `src/services/*.service.ts` files with mock toggle pattern
- [x] Create Zustand stores: `useAppStore`, `useResumeStore`, `useJobStore`, `useAnalysisStore`
- [x] Create TanStack Query hooks: `useResumeUpload`, `useMatching`, `useSkillGap`, `useChat`, `useDebounce`

### Phase 6 — Dashboard Page

- [x] Build `StatsRow.tsx` (4x StatReadout)
- [x] Build `RecentMatchesTable.tsx` (with MatchRing per row)
- [x] Build `SignalFeed.tsx` (with Framer Motion entrance)
- [x] Compose `DashboardPage.tsx`

### Phase 7 — Resume Pages

- [x] Build `ResumeTable.tsx` + `ResumeRow.tsx`
- [x] Compose `ResumesPage.tsx` (upload zone + table)
- [x] Build `DocumentViewer.tsx` (split: document + AI extraction panel)
- [x] Compose `ResumeDetailPage.tsx`

### Phase 8 — Job Pages

- [x] Build `JobInputForm.tsx` (text + URL tabs)
- [x] Build `JobTable.tsx` + `JobRow.tsx`
- [x] Compose `JobsPage.tsx`
- [x] Compose `MatchResultsPage.tsx` (ranked candidates)

### Phase 9 — Analysis Studio

- [x] Build `AnalysisPanel.tsx` (resume + job selector dropdowns)
- [x] Build large center `MatchRing` with animation
- [x] Build `ScoreBreakdown.tsx` (thin horizontal bars)
- [x] Build `SkillSignals.tsx` (matched + missing sections with tooltips)
- [x] Build `ExplainabilityPanel.tsx` (STRONG SIGNAL / WEAK SIGNAL / IMPACT)
- [x] Build `AnalysisActionBar.tsx` (4 action buttons)
- [x] Compose `AnalysisStudioPage.tsx`

### Phase 10 — Resume Improvement

- [x] Build `OriginalResume.tsx` (rendered resume sections)
- [x] Build `SuggestionCard.tsx` (current vs suggested + accept/reject/edit)
- [x] Build `ImprovementWorkspace.tsx` (split view + tab switching)
- [x] Compose `ResumeImprovementPage.tsx`

### Phase 11 — AI Chat

- [x] Build `ChatMessage.tsx` (user/AI message bubbles)
- [x] Build `SuggestedPrompts.tsx` (compact prompt pills)
- [x] Build `AIChat.tsx` (collapsed pill + expanded panel)
- [x] Wire chat to `useChat` hook → chat service → API

### Phase 12 — Polish & Verify

- [x] Audit all pages: no hardcoded colors/spacing/fonts outside design tokens
- [x] Verify keyboard navigation on all interactive elements
- [x] Verify empty/loading/error states on every page
- [x] Verify responsive behavior at desktop, tablet, mobile breakpoints
- [x] Test all Framer Motion animations (performance, smoothness)
- [x] Run `npm run build` — zero errors, zero warnings
- [x] Cross-reference all API calls against backend endpoint map (Section 5)
- [ ] Build `SettingsPage.tsx` and `NotFoundPage.tsx`

---

## 16. VERIFICATION CHECKLIST — RUN BEFORE DECLARING DONE

```
[ ] npm run build — compiles with zero errors and zero warnings
[ ] All 9 routes render correctly
[ ] Sidebar navigation works, active states display correctly
[ ] All mock data renders on every page
[ ] MatchRing animates on mount
[ ] Upload zone accepts PDF drag-and-drop
[ ] Parsing status steps through all 5 states
[ ] Analysis Studio loads with mock data, score animates
[ ] Skill tags show correct variants (matched = green, missing = red)
[ ] Explainability panel renders 3 structured sections
[ ] Resume improvement shows side-by-side with suggestion cards
[ ] AI chat expands/collapses, sends mock messages
[ ] Toast notifications appear and auto-dismiss
[ ] Modal opens/closes with focus trap and ESC
[ ] Keyboard navigation works on sidebar, tables, buttons, modals
[ ] Responsive: sidebar collapses at tablet, bottom nav at mobile
[ ] No hardcoded colors, spacing, or font sizes
[ ] All empty states display correctly
[ ] All skeleton loaders display during loading states
```

---

## 17. NON-NEGOTIABLE RULES FOR CONTINUING AGENTS

> **Any AI model or developer continuing this project MUST follow these rules.**

1. **Read this plan first.** Do not start coding without understanding the full architecture.
2. **Follow the folder structure exactly.** Do not create new folders or rename existing ones without updating this plan.
3. **Follow naming conventions.** `PascalCase` components, `camelCase` functions, `UPPER_SNAKE_CASE` constants.
4. **Use design tokens.** Never hardcode hex colors, pixel values, or font names directly in components. Use Tailwind aliases defined in Section 2.
5. **Follow the call chain.** `Component → Hook → Service → API`. Never skip layers. Components never import from `api/`.
6. **Check the mock toggle.** Every service must support `USE_MOCKS` flag. Follow the pattern in Section 7.
7. **Update the progress tracker** (Section 15) when completing phases.
8. **Do not introduce new dependencies** without documenting them in Section 1 first.
9. **Do not change the color palette, typography scale, or spacing system.**
10. **Do not create unnecessary abstractions.** Follow existing patterns. Consistency > creativity.
11. **Comply with USECS v2.0** — the [website constitution](file:///o:/ME/VIT/projects/python_fds/AI-Resume-Analyzer/.github/skills/website_constitution.md) governs all engineering decisions.
12. **When uncertain, look at existing code first.** Match the patterns already established by previous phases.

---

> *"A website is not merely a collection of pages. It is a scalable system of consistent experiences, predictable behaviors, maintainable architecture, and reliable interactions."*
> — USECS v2.0, Final Universal Principle
