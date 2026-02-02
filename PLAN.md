# Command Center - Project Plan

## Overview
A unified dashboard for all Jack & Clack operations. One place to check trading, study progress, ideas, and costs.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Command Center (Next.js)                  │
├─────────────────────────────────────────────────────────────┤
│  Frontend (React + Tailwind)                                │
│  ├── /                 Dashboard overview                   │
│  ├── /trading          Trading bot stats                    │
│  ├── /study            Study plan + quiz                    │
│  ├── /ideas            Active tracks + backlog              │
│  └── /costs            API cost tracking                    │
├─────────────────────────────────────────────────────────────┤
│  API Routes (Next.js API)                                   │
│  ├── /api/trading      Fetch from Helius + positions.json   │
│  ├── /api/study        Parse STUDY-PLAN.md + notes          │
│  ├── /api/ideas        Read from Obsidian vault             │
│  └── /api/costs        Parse api-cost-tracker output        │
├─────────────────────────────────────────────────────────────┤
│  Data Sources                                               │
│  ├── Helius API        Chain data, balances, transactions   │
│  ├── Local files       STUDY-PLAN.md, positions.json        │
│  ├── Obsidian vault    Jack & Clack/ folder                 │
│  └── Cost tracker      costs/api-cost-tracker.js output     │
└─────────────────────────────────────────────────────────────┘
```

## Modules

### 1. Dashboard (/)
**Purpose:** Quick overview of all modules

**Components:**
- `DashboardCard` - Clickable card linking to each module
- `TodaysFocus` - Checklist from study plan + daily tasks
- `QuickStats` - Interview target, TC goal, potential raise

**Data needed:**
- Trading: current P&L (from /api/trading)
- Study: current week/day (from /api/study)
- Ideas: count of active tracks (static for now)
- Costs: MTD spend (from /api/costs)

### 2. Trading (/trading)
**Purpose:** Monitor trading bot performance

**Components:**
- `BalanceCard` - SOL balance + USD value
- `PnLCard` - All-time and today's P&L
- `PositionsTable` - Open positions with price, P&L, liquidity
- `TradesTable` - Recent trades with outcomes

**API Endpoints:**
- `GET /api/trading/balance` - Wallet SOL balance
- `GET /api/trading/positions` - Open positions from chain
- `GET /api/trading/pnl` - P&L from chain-pnl.js logic
- `GET /api/trading/trades` - Recent trades

**Data sources:**
- Helius RPC for balance + transactions
- DexScreener for token prices
- Chain analysis for P&L (reuse chain-pnl.js logic)

### 3. Study Plan (/study)
**Purpose:** Track interview prep progress

**Components:**
- `TodaysFocus` - Current topic with action buttons
- `WeeklySchedule` - 4-week plan with day-by-day topics
- `StudyNotes` - Text area for notes (saves to file)
- `QuizSection` - Interactive quiz on current topic

**API Endpoints:**
- `GET /api/study/plan` - Parse STUDY-PLAN.md
- `GET /api/study/progress` - Which days completed
- `POST /api/study/notes` - Save study notes
- `GET /api/study/quiz` - Get quiz questions for topic

**Data sources:**
- `/Users/jacma/.openclaw/workspace/study/STUDY-PLAN.md`
- `/Users/jacma/.openclaw/workspace/study/notes/` (per-day notes)
- Quiz questions from AI generation or static file

### 4. Ideas (/ideas)
**Purpose:** Track active tracks and backlog

**Components:**
- `TrackCard` - Active track with progress bar
- `BacklogList` - Future ideas
- `MissionStatement` - Philosophy reminder

**API Endpoints:**
- `GET /api/ideas/tracks` - Active tracks with status
- `POST /api/ideas/tracks` - Update track progress/notes

**Data sources:**
- Obsidian vault: `/Users/jacma/Documents/remote-vault/Jack & Clack/`
- Or local file: `/Users/jacma/.openclaw/workspace/ideas/tracks.json`

### 5. API Costs (/costs)
**Purpose:** Track monthly API spend

**Components:**
- `SummaryCards` - MTD, projected, daily avg, remaining
- `BudgetProgress` - Visual progress bar
- `ProviderTable` - Breakdown by provider
- `OptimizationTips` - Cost-saving suggestions

**API Endpoints:**
- `GET /api/costs/summary` - MTD costs by provider
- `GET /api/costs/daily` - Daily breakdown

**Data sources:**
- Run `costs/api-cost-tracker.js` and parse output
- Or read from cached results file

## Tech Stack
- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS (dark theme)
- **State:** React hooks (no external state library needed)
- **Data fetching:** Next.js API routes + fetch
- **Testing:** Jest + React Testing Library

## File Structure
```
command-center/
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Root layout with sidebar
│   │   ├── page.tsx           # Dashboard
│   │   ├── trading/page.tsx   # Trading module
│   │   ├── study/page.tsx     # Study module
│   │   ├── ideas/page.tsx     # Ideas module
│   │   ├── costs/page.tsx     # Costs module
│   │   └── api/               # API routes
│   │       ├── trading/
│   │       ├── study/
│   │       ├── ideas/
│   │       └── costs/
│   ├── components/
│   │   ├── Sidebar.tsx
│   │   ├── DashboardCard.tsx
│   │   ├── BalanceCard.tsx
│   │   └── ...
│   └── lib/
│       ├── helius.ts          # Helius API client
│       ├── study-parser.ts    # Parse STUDY-PLAN.md
│       └── cost-tracker.ts    # Cost tracking logic
├── __tests__/
│   ├── components/
│   ├── api/
│   └── lib/
├── PLAN.md                    # This file
└── package.json
```

## Implementation Phases

### Phase 1: Core Structure ✓ (done)
- [x] Create Next.js project
- [x] Set up Tailwind dark theme
- [x] Create layout with sidebar
- [x] Create static pages for all modules

### Phase 2: API Routes (next)
- [ ] `/api/trading/*` - Wire up Helius
- [ ] `/api/study/*` - Parse markdown files
- [ ] `/api/costs/*` - Run cost tracker
- [ ] Unit tests for all API routes

### Phase 3: Live Data
- [ ] Connect frontend to API routes
- [ ] Add loading states
- [ ] Add error handling
- [ ] Refresh intervals for trading data

### Phase 4: Interactive Features
- [ ] Study notes saving
- [ ] Quiz functionality
- [ ] Track progress updates
- [ ] Today's focus checkboxes (persist)

### Phase 5: Deployment
- [ ] Railway setup
- [ ] Environment variables
- [ ] Production build
- [ ] Custom domain (optional)

## Environment Variables
```
HELIUS_API_KEY=158c8bc9-72a0-4cf6-92ed-f66548704bf0
WALLET_ADDRESS=5myqu8hG5KCsX1QZxtasKQgJ4548ZEHNoef65UGe7wPc
STUDY_PLAN_PATH=/Users/jacma/.openclaw/workspace/study/STUDY-PLAN.md
OBSIDIAN_VAULT_PATH=/Users/jacma/Documents/remote-vault
COST_TRACKER_PATH=/Users/jacma/.openclaw/workspace/costs
```

## Questions for Jack
1. Should study notes persist locally or sync somewhere?
2. Quiz: AI-generated questions or pre-written?
3. Ideas: Pull from Obsidian or separate JSON file?
4. Costs: Real-time API calls or cached data (updated by cron)?
5. Any other modules you want to add?
