# KRAFTWERK AI — Multi-Agent Website Builder
## Startup Plan & Bootstrap Prompt for New Claude Code Session

---

## CONCEPT

**KRAFTWERK AI** (working name) — platforma gdzie user opisuje strone jaka chce, a nastepnie 5 AI agentow w real-time dyskutuje, planuje, pisze kod, nadpisuje pliki, reviewuje i testuje — user ogląda caly proces na zywo w pięknym dark UI. Jak oglądanie zespolu senior devow przy pracy.

**Kluczowa roznica vs zwykly AI builder:** Tu NIE dostajesz gotowy wynik. Widzisz PROCES — agenci sie kłócą, proponują zmiany, jeden pisze CSS a drugi mówi "to gówno, przerabiam", reviewer łapie bugi, QA testuje. Real-time tok myśli i pracy.

---

## TECH STACK (identyczny z DMA)

```
Frontend:  React 18 + Vite 5 + Framer Motion + Lucide Icons + Sonner
Backend:   Node.js + Express + WebSocket (ws) + DeepSeek API (OpenAI SDK)
Styling:   Pure CSS with CSS Variables (premium dark theme)
Font:      DM Sans + DM Mono
```

---

## ARCHITECTURE

```
kraftwerk-ai/
├── frontend/
│   ├── src/
│   │   ├── App.jsx                    # Main — phase state machine
│   │   ├── main.jsx                   # Entry point
│   │   ├── index.css                  # Full design system
│   │   ├── hooks/
│   │   │   ├── useBuilderSocket.jsx   # WebSocket connection (like useDebateSocket)
│   │   │   └── useFileSystem.jsx      # Virtual file tree state
│   │   ├── components/
│   │   │   ├── AgentFeed.jsx          # Real-time agent activity feed (main view)
│   │   │   ├── AgentMessage.jsx       # Single agent message/action bubble
│   │   │   ├── AgentAvatar.jsx        # Agent avatars with role badges
│   │   │   ├── FileTree.jsx           # Virtual file explorer (sidebar)
│   │   │   ├── CodePreview.jsx        # Live code viewer with syntax highlighting
│   │   │   ├── LivePreview.jsx        # iframe with hot-reload preview of built site
│   │   │   ├── DiffViewer.jsx         # Shows file changes (before/after)
│   │   │   ├── AgentProfileCard.jsx   # Agent bio/stats modal
│   │   │   ├── BuildProgress.jsx      # Overall build progress bar + milestones
│   │   │   ├── ConflictResolver.jsx   # When agents disagree — user can vote
│   │   │   └── SettingsPanel.jsx      # Pre-build configuration panel
│   │   └── screens/
│   │       ├── WelcomeScreen.jsx      # Landing with concept explanation
│   │       ├── BriefScreen.jsx        # User describes their website (THE prompt)
│   │       ├── ConfigScreen.jsx       # Agent settings, style preferences
│   │       ├── BuildScreen.jsx        # MAIN — split view: feed + preview + files
│   │       ├── ReviewScreen.jsx       # Final summary, download, deploy options
│   │       └── GalleryScreen.jsx      # Previous builds history
│   ├── package.json
│   └── vite.config.js
├── backend/
│   ├── server.js                      # Express + WS + DeepSeek orchestration
│   ├── agents/                        # Agent personality/prompt definitions
│   │   ├── architect.js
│   │   ├── frontend-dev.js
│   │   ├── stylist.js
│   │   ├── reviewer.js
│   │   └── qa-tester.js
│   ├── builder/                       # File generation & management
│   │   ├── fileManager.js             # Virtual file system operations
│   │   ├── templateEngine.js          # Base templates for different site types
│   │   └── bundler.js                 # Combine files for preview/download
│   ├── package.json
│   └── .env
├── CLAUDE.md                          # Instructions for Claude Code sessions
└── README.md
```

---

## 5 AGENTS — ROLE DEFINITIONS

### 1. ARCHITECT (Kuba) — `#3b82f6` Blue
```
Role: Lead planner, structure designer, file organization
Personality: Confident tech lead, thinks big picture, sometimes argues with Stylist about structure
Actions: Creates file tree, defines component hierarchy, plans data flow, sets up routing
First to act: Analyzes user brief → creates project plan → defines file structure
Emoji: 🏗️
```

### 2. FRONTEND DEV (Maja) — `#22c55e` Green
```
Role: Writes actual HTML/JSX/JS code, implements functionality
Personality: Fast coder, pragmatic, sometimes cuts corners (Reviewer catches this)
Actions: Writes components, implements interactivity, handles state, builds forms
Follows Architect's plan but sometimes pushes back on overcomplicated designs
Emoji: ⚡
```

### 3. CSS STYLIST (Leo) — `#a855f7` Purple
```
Role: All visual design — CSS, animations, responsive, colors, typography
Personality: Opinionated designer, aesthetic perfectionist, clashes with Frontend Dev over "ugly hacks"
Actions: Writes CSS, creates animations, handles responsive breakpoints, picks color palettes
Can override Frontend Dev's inline styles, argues about design decisions
Emoji: 🎨
```

### 4. CODE REVIEWER (Nova) — `#ef4444` Red
```
Role: Reviews all code, catches bugs, suggests improvements, enforces quality
Personality: Critical but fair, slightly sarcastic, "well actually..." energy
Actions: Reviews commits, flags issues, requests changes, checks accessibility, validates HTML
Can REJECT and REQUEST REWRITE of any agent's code with explanation
Emoji: 🔍
```

### 5. QA TESTER (Rex) — `#eab308` Gold
```
Role: Tests the built site, checks responsiveness, validates UX, finds edge cases
Personality: Methodical, finds the weirdest bugs, slightly chaotic energy
Actions: Tests on different viewports, checks links, validates forms, stress-tests interactions
Reports bugs back to Frontend Dev and Stylist to fix
Emoji: 🧪
```

---

## BUILD PHASES (State Machine)

```
WELCOME → BRIEF → CONFIG → BUILDING → REVIEW → DONE

BUILDING sub-phases:
  PLANNING    → Architect analyzes brief, creates plan (user sees thinking)
  SCAFFOLDING → Architect creates file tree, Frontend Dev writes base files
  CODING      → Frontend Dev + Stylist work simultaneously, Reviewer watches
  REVIEWING   → Reviewer does full pass, requests changes
  FIXING      → Agents fix issues from review
  TESTING     → QA Tester checks everything
  POLISHING   → Final CSS tweaks, animations, responsive fixes
  COMPLETE    → All agents sign off
```

---

## WEBSOCKET MESSAGE TYPES

```javascript
// Client → Server
{ type: "start_build", brief: "...", config: {...} }
{ type: "user_feedback", message: "change the header color to red" }
{ type: "resolve_conflict", conflictId: "...", choice: "agent_a" | "agent_b" | "custom", customSolution: "..." }
{ type: "pause_build" }
{ type: "resume_build" }
{ type: "approve_phase" }  // user approves current phase to move on

// Server → Client
{ type: "agent_thinking", agentId: "architect", thought: "Analyzing the brief..." }
{ type: "agent_message", agentId: "...", message: "...", targetAgent: "..." }
{ type: "file_created", path: "src/App.jsx", content: "...", agentId: "frontend-dev" }
{ type: "file_modified", path: "...", diff: {...}, agentId: "...", reason: "..." }
{ type: "file_deleted", path: "...", agentId: "...", reason: "..." }
{ type: "agent_conflict", id: "...", agentA: {...}, agentB: {...}, about: "..." }
{ type: "review_comment", agentId: "reviewer", file: "...", line: 12, comment: "..." }
{ type: "bug_report", agentId: "qa", severity: "high", description: "..." }
{ type: "phase_change", from: "CODING", to: "REVIEWING" }
{ type: "build_progress", percent: 65, milestone: "Components built" }
{ type: "preview_update", html: "...", css: "...", js: "..." }
{ type: "build_complete", files: [...], summary: "..." }
```

---

## BUILD SCREEN LAYOUT (MAIN VIEW)

```
┌─────────────────────────────────────────────────────────┐
│  [KRAFTWERK AI]          Build Progress ████████░░ 72%  │
│  "E-commerce landing page"              Phase: CODING   │
├──────────┬──────────────────────┬───────────────────────┤
│          │                      │                       │
│ FILE     │   AGENT ACTIVITY     │   LIVE PREVIEW        │
│ TREE     │   FEED               │                       │
│          │                      │   ┌─────────────────┐ │
│ 📁 src/  │ 🏗️ Kuba: Creating    │   │                 │ │
│  📄 App  │ component structure  │   │   [Preview of   │ │
│  📄 Nav  │                      │   │    the website   │ │
│  📄 Hero │ ⚡ Maja: Writing     │   │    being built]  │ │
│  📄 ...  │ Hero component...    │   │                 │ │
│ 📁 css/  │                      │   │                 │ │
│  📄 main │ 🎨 Leo: I don't     │   │                 │ │
│  📄 ...  │ like that gradient,  │   └─────────────────┘ │
│          │ replacing with...    │                       │
│ [Click   │                      │   [Desktop] [Mobile]  │
│  to view │ 🔍 Nova: Line 23    │   [Tablet]  [Code]    │
│  code]   │ has unused import    │                       │
│          │                      │                       │
├──────────┴──────────────────────┤   ┌─────────────────┐ │
│ [💬 Give feedback to agents...] │   │ Download  │Ship │ │
└─────────────────────────────────┴───┴───────────┴─────┴─┘
```

**3-panel layout:**
- **Left (20%):** File tree — clickable, shows which agent last modified each file
- **Center (45%):** Agent activity feed — real-time stream of agent thoughts, messages, code writes, conflicts
- **Right (35%):** Live preview — iframe rendering current state, viewport switcher, code view toggle

---

## USER INTERACTIONS DURING BUILD

1. **Feedback Input** — Text box at bottom, user can type "make the header bigger" or "I don't like the color scheme" → goes to all agents, they adapt
2. **Conflict Resolution** — When agents disagree (Stylist wants gradient, Reviewer says flat), user sees both options and picks one or writes custom solution
3. **File Click** — Click any file in tree to see its current code + who wrote what (git blame style with agent colors)
4. **Pause/Resume** — User can pause build to examine current state, then resume
5. **Phase Approval** — After each major phase, user can approve or give notes before agents proceed

---

## CONFIG SCREEN SETTINGS

```javascript
const DEFAULT_CONFIG = {
  // Site type
  siteType: "landing",  // landing | portfolio | blog | ecommerce | dashboard | custom

  // Style preferences
  stylePreset: "modern-dark",  // modern-dark | clean-minimal | bold-colorful | corporate | retro
  primaryColor: "#3b82f6",
  fontPreference: "sans-serif",  // sans-serif | serif | mono | mixed

  // Agent behavior
  agentVerbosity: 70,       // 0-100 how much agents talk vs just code
  conflictFrequency: 50,    // 0-100 how often agents disagree (entertainment factor)
  codeQuality: "balanced",  // speed | balanced | perfectionist

  // Build options
  responsive: true,
  animations: true,
  darkMode: false,          // build a dark mode site
  framework: "vanilla",     // vanilla | react | vue (stretch goal)
  includeImages: true,      // use placeholder images

  // Advanced
  maxBuildTime: 300,        // seconds
  language: "en",           // en | pl
};
```

---

## CSS DESIGN SYSTEM (copy from DMA, extend)

```css
:root {
  /* Backgrounds */
  --bg-primary: #0a0a0f;
  --bg-secondary: #0e1018;
  --bg-elevated: #13151f;
  --bg-card: #181b27;

  /* Text */
  --text-primary: #edf2f7;
  --text-secondary: #8b98a8;
  --text-tertiary: #475569;

  /* Accents */
  --accent: #3b82f6;
  --accent-hover: #60a5fa;
  --success: #22c55e;
  --error: #ef4444;
  --warning: #eab308;

  /* Agent colors */
  --architect: #3b82f6;
  --frontend-dev: #22c55e;
  --stylist: #a855f7;
  --reviewer: #ef4444;
  --qa-tester: #eab308;

  /* Fonts */
  --font-main: 'DM Sans', sans-serif;
  --font-mono: 'DM Mono', 'Fira Code', monospace;

  /* Effects */
  --glass-bg: rgba(10, 10, 15, 0.85);
  --glass-blur: blur(20px);
  --border-subtle: 1px solid rgba(255, 255, 255, 0.06);
  --shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.4);
  --transition-smooth: cubic-bezier(0.22, 1, 0.36, 1);
}
```

---

## BACKEND ORCHESTRATION LOGIC

```
Session Flow:
1. User sends brief + config
2. Server creates virtual file system (Map<path, {content, author, history}>)
3. PLANNING PHASE:
   - Architect agent gets brief → generates project plan (file list, component breakdown)
   - Send plan to client as agent_thinking + agent_message events

4. SCAFFOLDING PHASE:
   - Architect creates file tree (file_created events)
   - Frontend Dev writes base HTML/component structure
   - Each file creation is streamed to client

5. CODING PHASE (parallel agents):
   - Frontend Dev writes functionality (gets Architect's plan as context)
   - Stylist writes CSS (gets current HTML structure as context)
   - Each write triggers: file_modified event → preview_update event
   - Reviewer watches in background, queues comments

6. REVIEW PHASE:
   - Reviewer gets ALL files, does full review
   - Sends review_comment events for each issue
   - Frontend Dev and Stylist get review → fix issues (file_modified events)

7. TESTING PHASE:
   - QA gets full file set + preview
   - Reports bugs (bug_report events)
   - Agents fix reported issues

8. POLISH PHASE:
   - Stylist does final pass (animations, responsive, hover states)
   - Reviewer does final sign-off

9. COMPLETE:
   - build_complete event with all files
   - User can download zip or view final preview
```

**Agent Context Management:**
```javascript
// Each agent call includes:
const agentContext = {
  role: agent.systemPrompt,           // Agent personality + skills
  projectBrief: session.brief,         // Original user brief
  projectPlan: session.plan,           // Architect's plan
  currentFiles: session.getRelevantFiles(agent),  // Files relevant to this agent
  recentActivity: session.getRecentMessages(10),  // Last 10 agent messages
  userFeedback: session.pendingFeedback,           // Unaddressed user feedback
  reviewComments: session.getOpenComments(agent),  // Open review comments for this agent
};
```

---

## AGENT PROMPT ENGINEERING

### Architect System Prompt (example):
```
You are Kuba, the Lead Architect for a website building team. Your role:
- Analyze user briefs and create detailed project plans
- Define file structure and component hierarchy
- Make architectural decisions (layout, data flow, state management)
- You work with: Maja (Frontend Dev), Leo (CSS Stylist), Nova (Code Reviewer), Rex (QA Tester)

PERSONALITY:
- Confident, decisive, big-picture thinker
- Sometimes overcomplicates things (Nova calls you out on this)
- You respect Nova's code reviews even when they sting
- You and Leo disagree on structure vs aesthetics priorities

OUTPUT FORMAT for file operations:
When creating/modifying files, use this EXACT format:
===FILE_CREATE: path/to/file.html===
[file content here]
===END_FILE===

When discussing with team:
===MESSAGE: @target_agent===
[your message]
===END_MESSAGE===

When thinking/planning:
===THINKING===
[your thought process — user will see this]
===END_THINKING===
```

---

## KEY FEATURES BACKLOG (Priority Order)

### MVP (v1):
1. Welcome + Brief + Config screens
2. WebSocket connection + agent orchestration
3. Real-time agent activity feed
4. Virtual file system with file_created/modified events
5. Basic live preview (iframe srcdoc)
6. File tree sidebar
7. Build progress tracking
8. Download as ZIP

### v1.1:
9. User feedback during build
10. Agent conflicts with user resolution
11. Code view for individual files
12. Phase approval system
13. Diff viewer for file modifications

### v1.2:
14. Syntax highlighting (Prism.js or highlight.js)
15. Multiple viewport preview (desktop/mobile/tablet)
16. Build history/gallery
17. Agent personality sliders in config
18. Polish: animations, transitions, micro-interactions

### v2 (stretch):
19. React/Vue framework output option
20. Image generation integration (placeholder → AI images)
21. One-click deploy (Netlify/Vercel API)
22. Collaborative mode (multiple users watching)
23. Agent memory (learns user preferences over builds)

---

## PROMPT FOR NEW CLAUDE CODE SESSION

**Copy-paste this as the FIRST message in a new Claude Code session after creating the repo:**

---

```
I'm building KRAFTWERK AI — a multi-agent collaborative website builder. Think of it
as watching 5 senior devs build a website in real-time — the user describes what they
want, then watches AI agents discuss, code, argue, review and polish the site live.

TECH STACK:
- Frontend: React 18 + Vite 5 + Framer Motion 12 + Lucide React + Sonner
- Backend: Node.js + Express + WebSocket (ws library) + DeepSeek API (via OpenAI SDK)
- Styling: Pure CSS with CSS custom properties (NO Tailwind). Premium dark theme.
- Font: DM Sans (main) + DM Mono (code)

THE 5 AGENTS:
1. Architect (Kuba) 🏗️ #3b82f6 — Plans structure, creates file tree, defines components
2. Frontend Dev (Maja) ⚡ #22c55e — Writes actual HTML/CSS/JS code
3. CSS Stylist (Leo) 🎨 #a855f7 — All visual design, animations, responsive
4. Code Reviewer (Nova) 🔍 #ef4444 — Reviews code, catches bugs, requests rewrites
5. QA Tester (Rex) 🧪 #eab308 — Tests the site, finds bugs, checks responsive

UI LAYOUT — Build Screen is 3-panel:
- Left (20%): File tree — clickable, shows agent colors per file
- Center (45%): Agent activity feed — real-time stream of thoughts, messages, code
- Right (35%): Live preview iframe + viewport switcher

DESIGN SYSTEM (premium dark — same as DebateMyAgent):
- --bg-primary: #0a0a0f, --bg-secondary: #0e1018, --bg-elevated: #13151f
- --text-primary: #edf2f7, --text-secondary: #8b98a8
- --accent: #3b82f6, glass morphism effects, subtle borders rgba(255,255,255,0.06)
- Font: DM Sans weight 450-800, DM Mono for code
- Framer Motion springs for all animations
- iMessage-style bubbles for agent messages, but with agent color accents

PHASES (state machine):
WELCOME → BRIEF → CONFIG → BUILDING → REVIEW → DONE
Building sub-phases: PLANNING → SCAFFOLDING → CODING → REVIEWING → FIXING → TESTING → POLISHING → COMPLETE

WebSocket handles:
- Agent thinking/messages streamed in real-time
- file_created / file_modified / file_deleted events update file tree + preview
- agent_conflict events let user resolve disagreements
- preview_update refreshes the iframe
- User can type feedback at any time → agents adapt

START BY:
1. Initialize the project (Vite + React frontend, Express + WS backend, both package.json)
2. Create the CSS design system (all variables, base styles, glass effects)
3. Build the Welcome → Brief → Config screen flow
4. Implement WebSocket hook (useBuilderSocket) matching the event types above
5. Build the main BuildScreen with 3-panel layout
6. Backend: Session management + agent orchestration with DeepSeek API
7. Virtual file system on backend, streamed to frontend
8. Live preview via iframe srcdoc

IMPORTANT PATTERNS:
- Phase-based state machine in App.jsx (like DMA)
- useBuilderSocket hook with on(type, handler) pattern
- AnimatePresence for screen transitions
- CSS variables for theming, NO styled-components or Tailwind
- Agent messages as beautiful cards with avatars, role badges, agent colors
- File operations shown as diff-style cards in the feed
- Glass morphism on headers, panels, overlays
- Responsive: mobile shows tabs (Feed | Preview | Files) instead of 3-panel
```

---

## FILE: CLAUDE.md (put in repo root)

```markdown
# KRAFTWERK AI — Multi-Agent Website Builder

## Project Overview
Real-time collaborative AI website builder. 5 AI agents (Architect, Frontend Dev,
CSS Stylist, Code Reviewer, QA Tester) work together to build websites while the
user watches the process live.

## Tech Stack
- Frontend: React 18 + Vite 5 + Framer Motion + Lucide React + Sonner
- Backend: Node.js + Express + WebSocket (ws) + DeepSeek API (OpenAI SDK)
- Styling: Pure CSS with CSS custom properties (NO Tailwind/CSS-in-JS)
- Fonts: DM Sans, DM Mono

## Development
- Frontend dev server: `cd frontend && npm run dev` (port 5173)
- Backend server: `cd backend && npm run dev` (port 3001)

## Architecture Decisions
- Phase-based state machine for app flow (WELCOME → BRIEF → CONFIG → BUILDING → REVIEW → DONE)
- WebSocket for real-time agent communication (not SSE, not polling)
- Virtual file system on backend (Map-based), streamed to frontend
- Live preview via iframe srcdoc (not separate server)
- Agent context includes: role prompt, project brief, plan, relevant files, recent activity
- Each agent has distinct personality that affects their communication style
- Premium dark UI with glass morphism, agent-color coding, Framer Motion animations

## Code Style
- Functional React components with hooks
- useCallback for all handlers passed as props
- CSS BEM-inspired class naming
- CSS custom properties for all design tokens
- Framer Motion for animations (spring-based, no CSS transitions for complex animations)
- Toast notifications via Sonner
```

---

## QUICK REFERENCE: npm init commands

```bash
# Create repo
mkdir kraftwerk-ai && cd kraftwerk-ai
git init

# Frontend
npm create vite@latest frontend -- --template react
cd frontend
npm install framer-motion lucide-react sonner
cd ..

# Backend
mkdir backend && cd backend
npm init -y
npm install express ws cors dotenv openai uuid
npm install -D nodemon
cd ..

# Add CLAUDE.md (paste content above)
# Add .env to backend/ with DEEPSEEK_API_KEY
```
