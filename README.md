# Gatherly AI — Autonomous Celebration & Event Planner
> **Submission for [Challenge 5] Celebration & Event Planner**  
> **Repository:** [https://github.com/justinmathew2/gatherly-ai-event-planner](https://github.com/justinmathew2/gatherly-ai-event-planner.git)  
> **Total Repository Size:** < 1 MB (Strictly compliant with the < 10 MB limit)

---

## 🌟 Executive Summary

**Gatherly AI** is an intelligent, GenAI-powered full-lifecycle celebration and event planning assistant designed to streamline the complex, high-stress process of organizing **Weddings, Milestone Birthdays, Community & Cultural Festivals, and Corporate Celebrations**.

Planning celebrations involves hundreds of moving pieces—volatile budgets, vendor communications, multi-phase countdowns, hourly day-of itineraries, dietary restrictions, and aesthetic coherence. Gatherly AI bridges the gap between raw generative creativity and mathematical budgeting rigor: it synthesizes industry-standard financial formulas, vendor matrices, and timeline automation with Google's Gemini models.

---

## 🎯 Chosen Verticals & Problem Statement Alignment

Gatherly AI provides specialized engines for the four major celebration verticals:

| Vertical | Target Use Cases | Specialized Capabilities |
| :--- | :--- | :--- |
| 💍 **Weddings** | Intimate to Grand Receptions, Rehearsal Dinners, Ceremonies | Headcount formulas, Tuscan/Boho/Black-Tie themes, dual-purpose floral optimization, photo golden-hour timing, couple toast scheduling. |
| 🎂 **Milestone Birthdays** | Sweet 16, 21st, 30th/50th/80th Jubilees, Arcade & Glow Bashes | Gaming tournaments, slider/tot bars, custom neon sign coordination, surprise video montage scheduling, synthwave playlists. |
| 🤝 **Community & Cultural** | Neighborhood Harvest Festivals, Street Carnivals, Eco Fairs | Municipal park permits, ADA accessibility, quiet sensory zones, volunteer rosters, zero-waste protocols, local food truck coordination. |
| 🏢 **Corporate & Gatherings** | Annual Hackathons, Innovation Galas, Team Retreats | Audio/visual checklists, keynote cue sheets, tiered catering packages, award ceremonies. |

---

## 🚀 Key Features

### 1. 🧙‍♂️ AI Event Architect & Smart Setup Wizard
- Interactive 3-step wizard capturing event vertical, guest count, aesthetic vibe, date, location, dietary accommodations, and accessibility requirements.
- Generates a mathematically balanced, cohesive master event plan in seconds.

### 2. 💰 Smart Dynamic Budget Planner & Rebalancer
- Real-time tracking across 10 categories (Venue, Catering, Photo, Music, Decor, Attire, Stationery, Transport, Contingency, Other).
- **AI Rebalancing**: One-click optimization applying industry benchmark proportions (e.g. 35% venue, 30% catering, 12% photo, 10% music, 8% decor, 5% contingency).
- Multi-currency support (USD, EUR, GBP, INR, CAD, AUD).
- Track allocated caps, actual quotes, and paid deposit receipts.

### 3. ⏱️ Timeline & Day-Of Run-of-Show Manager
- **Phase Countdown**: Milestones organized chronologically (12+ Months Out, 6 Months, 3 Months, 1 Month, 2 Weeks, 1 Week, Day Before, Post-Event).
- **Day-Of Hourly Run of Show**: Hour-by-hour run-of-show cue sheet with locations, key responsible people, and notes.
- **Calendar Sync**: One-click export to RFC-5545 `.ics` (Apple Calendar, Google Calendar, Outlook).

### 4. 🤝 Vendor Hub & AI Communication Toolkit
- Track vendors across 11 categories with status progression (`Researching` ➔ `Contacted` ➔ `Quote Received` ➔ `Contract Signed` ➔ `Deposit Paid` ➔ `Fully Paid`).
- **AI Inquiry Email Drafter**: Automatically drafts a personalized, professional inquiry email incorporating your guest count, date, location, and budget.
- **AI Vendor Interview Cheat Sheet**: Formulates top 5 targeted questions per vendor category to prevent hidden fees.

### 5. 🎨 Personalized Ideation Studio
- **Aesthetic Harmony Palette**: Curated 5-tone color scheme with one-click HEX code copying.
- **Invitations Copywriter**: Generates Formal, Modern/Playful, and Casual invitation copy with tailored RSVP questions.
- **Catering & Cocktail Pairings**: Curated multi-course menus respecting dietary restrictions (vegan, gluten-free, halal, nut-free) and signature cocktail/mocktail recipes.
- **Activities & Playlist Vibes**: Curated timeline-aligned activities, icebreakers, and music track inspiration.

### 6. 🤖 Interactive Event Planning Copilot (Gatherly Chat)
- Context-aware AI assistant with full visibility into the active event's budget, dates, and priorities.
- Instant chips for cost-cutting ideas, game suggestions, and contingency planning.

### 7. 📤 Comprehensive Export & Portability
- Export to **iCalendar (.ics)**, **Budget CSV**, **Vendor CSV**, and **Full Plan JSON Backup**.
- Complete restore/import capability for cross-device portability.
- Print / Save to PDF ready formatting.

---

## 🧠 GenAI Services Utilized & Exact Implementation Details

Gatherly AI leverages Google's **Gemini Models** (`gemini-2.0-flash` and `gemini-1.5-flash`) via `@google/generative-ai`:

1. **Master Event Plan Generation (`generateEventPlanWithAI`)**:
   - Synthesizes user parameters into a structured, typed JSON schema validated with Zod.
   - Enforces mathematical budget constraints, chronological timeline sequences, and realistic vendor quotes.
2. **Dynamic Vendor Email Generation (`generateVendorInquiryEmail`)**:
   - Generates customized outreach emails referencing specific guest counts, aesthetic vibes, and budget constraints.
3. **Vendor Interview Questions Generator (`generateVendorQuestions`)**:
   - Generates high-impact interview questions tailored to the vendor category and event scale.
4. **Conversational Copilot (`queryAssistantCopilot`)**:
   - Maintains contextual state to answer budgeting queries, suggest timeline adjustments, and handle emergency contingencies.
5. **Robust Zero-Dependency Fallback Engine**:
   - Built-in procedural intelligence engine guarantees complete, rich functionality even without an API key or in offline environments.

---

## 🛡️ Evaluation Focus Areas Alignment

### 1. Code Quality
- Clean, modular TypeScript architecture with strict typing.
- Decoupled UI components (`components/`), storage logic (`services/storage.ts`), AI services (`services/gemini.ts`), and export formatters (`services/export.ts`).
- Zod schema validation ensuring run-time safety for all data structures.

### 2. Security
- **BYOK (Bring Your Own Key)** architecture: Gemini API keys are stored exclusively in client-side `localStorage`. Zero API keys or secrets are transmitted to intermediate backend servers or checked into git.
- Strict input sanitization and XSS-safe text rendering.
- No third-party tracking or data harvesting.

### 3. Efficiency
- Blazingly fast Vite + React client-side bundle (~120 KB gzipped).
- Instant offline cache with zero-latency updates.
- Optimized token usage using Gemini Flash models with structured JSON mode.

### 4. Testing
- Automated unit and integration test suite using **Vitest**.
- Validates Zod schema parsing, budget math calculations, RFC-5545 iCalendar compliance, CSV generation, and offline fallback consistency.
- Run tests anytime with `npm test`.

### 5. Accessibility
- High-contrast color palettes meeting WCAG 2.1 AA standards.
- Full keyboard navigation and semantic HTML landmarks (`<header>`, `<main>`, `<nav>`, `<aside>`, `<footer>`).
- Screen reader friendly labels (`aria-label`, `aria-expanded`, `role="tablist"`).

---

## 🛠️ Architecture & Tech Stack

```
gatherly-ai-event-planner/
├── src/
│   ├── components/            # Modular React UI components
│   │   ├── Navbar.tsx         # Header, event switcher & tab navigation
│   │   ├── Dashboard.tsx      # Countdown timer & high-level KPI cards
│   │   ├── BudgetPlanner.tsx  # Dynamic budget table & AI rebalance modal
│   │   ├── TimelineManager.tsx# Countdown milestones & hourly run-of-show
│   │   ├── VendorChecklist.tsx# Vendor status tracker & AI email drafter
│   │   ├── IdeationStudio.tsx # Color palettes, menus, invites & playlists
│   │   ├── AssistantChat.tsx  # Interactive AI copilot drawer
│   │   ├── EventSetupWizard.tsx# 3-step AI creation wizard
│   │   ├── SettingsModal.tsx  # API key, model & currency configuration
│   │   └── ExportModal.tsx    # iCal, CSV, JSON & PDF export tools
│   ├── services/
│   │   ├── gemini.ts          # Google GenAI integration & offline engine
│   │   ├── storage.ts         # LocalStorage persistence & sample management
│   │   ├── export.ts          # iCal (.ics) & CSV generators
│   │   └── mockData.ts        # Sample events (Wedding, Birthday, Festival)
│   ├── types/
│   │   ├── event.ts           # Core TypeScript interfaces
│   │   └── schema.ts          # Zod validation schemas
│   ├── test/
│   │   ├── setup.ts           # Vitest environment setup
│   │   └── planner.test.ts    # Comprehensive automated test suite
│   ├── App.tsx                # Main application state container
│   ├── main.tsx               # DOM entry point
│   └── index.css              # Tailwind CSS directives & print styles
├── index.html                 # HTML shell with accessibility & viewport tags
├── package.json               # Dependency definitions
├── tailwind.config.js         # Theme color definitions & animation keyframes
├── vite.config.ts             # Vite build & Vitest test configuration
└── README.md                  # Comprehensive documentation
```

---

## 📋 Assumptions Made

1. **Client-Side Privacy Priority**: Users prioritize data ownership and privacy for celebrations (guest lists, budget figures, personal addresses). Therefore, data is stored client-side in browser storage.
2. **Reviewer Zero-Setup Experience**: Reviewers evaluating the project might not have an active Gemini API key on hand. The application is built with a dual-engine architecture: it works with a live Gemini API key, and provides a smart offline engine that delivers full functionality without any setup.
3. **Calendar Compatibility**: The standard RFC-5545 iCalendar (`.ics`) format was chosen to support Google Calendar, Apple Calendar, and Outlook across iOS, Android, macOS, and Windows.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)

### Installation & Run

1. **Clone the repository:**
   ```bash
   git clone https://github.com/justinmathew2/gatherly-ai-event-planner.git
   cd gatherly-ai-event-planner
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

4. **Run the automated test suite:**
   ```bash
   npm test
   ```

5. **Build for production:**
   ```bash
   npm run build
   ```

---

## 🌐 Deployment Instructions

### One-Click Deploy to Vercel
1. Push your repository to GitHub.
2. Go to [Vercel](https://vercel.com) and click **"Add New Project"**.
3. Select `gatherly-ai-event-planner`.
4. Leave framework preset as **Vite**, click **Deploy**.
5. (Optional) Set `VITE_GEMINI_API_KEY` in Vercel Environment Variables.

---

## 📝 Submission Form Quick-Reference

For your contest submission form:

- **Challenge**: `[Challenge 5] Celebration & Event Planner`
- **Public GitHub Repository Link**: `https://github.com/justinmathew2/gatherly-ai-event-planner.git`
- **Describe the changes/updates made in the deployed version**:
  > Built Gatherly AI, a GenAI event planning copilot for Weddings, Milestone Birthdays, Community Festivals, and Corporate Gatherings. Features dynamic budget allocation with one-click AI rebalancing, countdown milestones, hour-by-hour day-of run-of-show with RFC-5545 iCal calendar export, vendor tracking with automated inquiry email drafting & interview questions, personalized aesthetic palettes with HEX copy, dietary-conscious catering menus, and an interactive context-aware AI planning copilot.
- **Mention the Gen AI services utilized in the submission, and where did you utilize it?**:
  > Google Gemini Models (`gemini-2.0-flash` & `gemini-1.5-flash`) utilized via the `@google/generative-ai` SDK in:
  > 1. **AI Event Architect**: Synthesizes custom user requirements into a full, typed event plan.
  > 2. **Smart Budget Rebalancer**: Analyzes spending allocations against industry benchmarks and generates tailored cost-cutting insights.
  > 3. **Vendor Communication Engine**: Generates tailored vendor inquiry emails and top 5 interview questions per vendor category.
  > 4. **Ideation Studio**: Generates aesthetic moodboards, custom invitation wording in 3 tones, multi-course dining suggestions, and music playlists.
  > 5. **Gatherly Copilot**: Interactive conversational assistant for real-time event adjustments. Includes a robust fallback engine ensuring 100% testability offline.
