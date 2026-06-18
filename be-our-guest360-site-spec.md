# Be Our Guest360 — Newsletter Site Build Spec

> **For Cursor:** Build a small website that publishes and archives the *Be Our Guest360* executive newsletter. Each issue is a one-page, menu-themed summary of sprint progress against Q4 priorities, written for business leaders. Issues must be **downloadable, distributable, and browsable in an archive** that can live on the Guest360 site. Content is a **combination of data pulled from LEIA and net-new business context** entered by the author. Use the design tokens, content model, and seed issue below. Treat the JSON payload as the single source of truth for each issue.

---

## 1. Goal

A static, fast, accessible site with two jobs:

1. **Publish** each newsletter as its own page that matches the menu design exactly, populated from a data file (never hand-built HTML per issue).
2. **Archive** every issue in a browsable list that can be embedded on or linked from the main Guest360 webpage.

Every issue must be **downloadable as a one-page PDF** and **distributable via a stable share link**.

**Audience:** business leaders. Skimmable, plain-language, exec-friendly. No internal jargon in the rendered output.

---

## 2. Where the content comes from (convert / extract)

Each newsletter is assembled from **three content origins**. Tag every field with its origin so numbers stay traceable and nothing is invented.

| Origin | Tag | What it covers | How it's extracted |
|---|---|---|---|
| **LEIA** | `leia` | All figures and status (points, %, deltas, statuses, blockers, next steps, links) | LEIA already aggregates Jira / Outlook / EOW / standups / snapshots. It should **emit one JSON payload per sprint** (a `newsletter.json`) — or expose a read endpoint — that this site consumes. No numbers are typed by hand. |
| **AI narrative** | `ai` | The plain-English "Impact" / "why it matters" lines | Generated in LEIA's AI Insight layer (Cursor + Anthropic API). **Words only — the AI never produces numbers;** figures in an Impact line come from LEIA or config. |
| **Net-new (manual)** | `manual` | Theme line, Q4 dollar targets/framing, external Dessert links, tagline, distribution list | Entered by the author (intern / Scrum Master) per issue. These are business context that does not exist in any data source. |

**Extraction rule:** the site reads an issue's JSON and renders it. It does **not** compute metrics. If LEIA can't yet emit the payload automatically, the author pastes the JSON in for now; the schema is identical either way, so the automated path is a drop-in later.

> This site is "Layer 3" — it only repackages published LEIA output (Retro for Sprint N + Planning for Sprint N+1) plus the manual context above. No new data is calculated here.

---

## 3. Pages & information architecture

1. **Archive / home** (`/`)
   - Lists all issues, newest first, as cards: title, sprint range, date, theme, "Read" link.
   - Search/filter by sprint or date.
   - Designed to embed in or link from the Guest360 webpage.
2. **Issue page** (`/issues/{issueId}`, e.g. `/issues/sprint-24`)
   - Renders the full one-page menu layout from the issue JSON.
   - Stable permalink (this is the share link).
   - Actions: **Download PDF** and **Copy share link** (and optional **Email**).
3. **Optional:** `/issues/{issueId}.pdf` — a pre-generated PDF for direct download/distribution.

---

## 4. Newsletter layout (the "menu")

One page, full-bleed ivory background, centered masthead, three "courses." Keep it print-friendly (A4, one page).

### Masthead
- Eyebrow/ornament, then large wine title: **Guest360 Menu**.
- Gold divider.
- Subtitle (italic): `Be Our Guest · {sprintRange}` (e.g., *Sprint 23 → Sprint 24*).
- Theme + date line: `Theme: {theme} · {date}`.

### Course 1 — "To Begin" · *What do you need to know?*
Three side-by-side boxes. **Rose / Bud / Thorn are fixed sections** (always the same colors and order); treat them as insight categories, not variable copy:
- **Rose — Biggest Wins** (highlights) · 3 bullets
- **Bud — What's Developing** (development) · 3 bullets
- **Thorn — Biggest Blockers** (weaknesses) · 3 bullets

### Course 2 — "The Main Course" · *How are we delivering on our Q4 priorities?*
A 2-column grid of **8 priority cards** (2 across × 4 down). Each card:
- Number chip + priority name + a **status badge** colored by status: `on-track` → green, `at-risk` → red. **The card's status/color is meaningful data** (each card is one Q4 priority).
- Four labeled rows: **PROGRESS · IMPACT · BLOCKERS · NEXT**.

### Course 3 — "Dessert" · *Where can you go for more detail?*
Reference links in three columns: LEIA/ORBIT deep links (`leia`) plus manual links (`manual`).

### Footer
Centered tagline (italic), e.g., *Be our guest — streamline, scale, and deliver.*

---

## 5. Design tokens (match the existing newsletter)

```css
--wine:   #9c1f31;  /* title, accents, card headers */
--gold:   #c2932f;  /* dividers, ornaments */
--ivory:  #faf1d8;  /* full-bleed background */
--ink:    #2a2a2a;  /* body text */
--ok:     #3f7a4e;  /* status: On Track */
--risk:   #b23a3a;  /* status: At Risk */
```
- **Font:** Plus Jakarta Sans (Google Fonts) throughout.
- Cards: bordered, rounded, ivory/white fill, wine section header bar, small-caps field labels (PROGRESS/IMPACT/BLOCKERS/NEXT) in wine.
- Status badge: pill, uppercase, white text on `--ok` or `--risk`.
- Print: `@page { size: A4; margin: 0 }`, `print-color-adjust: exact`, full-bleed background, fit to one page.

---

## 6. Issue data model (single source of truth)

One JSON file per issue at `/content/issues/{issueId}.json`. Every leaf value carries an origin tag (`leia` | `ai` | `manual`) so the build can show traceability and the author knows what to fill in.

```jsonc
{
  "meta": {
    "issueId":     "sprint-24",                         // manual
    "title":       "Guest360 Menu",                     // manual (brand)
    "sprintRange": "Sprint 23 → Sprint 24",             // leia
    "theme":       "Streamline So We Can Scale...",     // manual
    "date":        "2025-05-30",                        // leia (Retro end date)
    "tagline":     "Be our guest — streamline, scale, and deliver." // manual
  },
  "toBegin": {
    "rose":  { "label": "Biggest Wins",     "items": ["…","…","…"] }, // leia
    "bud":   { "label": "What's Developing", "items": ["…","…","…"] }, // leia
    "thorn": { "label": "Biggest Blockers",  "items": ["…","…","…"] }  // leia
  },
  "mainCourse": [
    {
      "n": 1,
      "name":     "CCN Release 2",
      "status":   "on-track",     // leia  (on-track | at-risk)
      "progress": "…",            // leia
      "impact":   "…",            // ai + manual ($ targets)
      "blockers": "…",            // leia
      "next":     "…"             // leia
    }
    // …8 cards total
  ],
  "dessert": {
    "leiaLinks":   [ { "label": "…", "url": "…" } ],   // leia
    "manualLinks": [ { "label": "…", "url": "…" } ]    // manual
  }
}
```

**Validation:** exactly 3 items per Rose/Bud/Thorn; exactly 8 main-course cards; `status` must be `on-track` or `at-risk`. Fail the build with a clear message if an issue JSON is malformed.

---

## 7. Download & distribute

- **Download PDF:** a "Download PDF" button on each issue. Produce a one-page PDF that visually matches the on-screen menu (same fonts/colors/layout). Implement either with a print stylesheet + `window.print()`/`html2pdf`, or a build step (Puppeteer/Playwright) that writes `/public/issues/{issueId}.pdf`. The build-step approach is preferred so a ready PDF exists for distribution.
- **Distribute:** every issue has a stable permalink (the share link). Add "Copy link" and an optional "Email" action (mailto or a configured distribution list).
- **Archive/repository:** every published issue's JSON lives in the repo under `/content/issues/`, and its rendered page + PDF are part of the deploy. The archive page lists them all. This is the "Newsletter Archive" link in Dessert.

---

## 8. Recommended stack (keep it feasible)

- **Framework:** a static site that exports cleanly to GitHub Pages (the existing ORBIT/LEIA prototype is on GitHub Pages, so match it). Next.js (static export) or Vite + React both work; plain templated HTML is acceptable if simpler.
- **Content:** JSON files in `/content/issues/` (Section 6). Build generates the archive index + one page per issue.
- **PDF:** Puppeteer/Playwright build step → `/public/issues/*.pdf`.
- **Styling:** the tokens in Section 5; Plus Jakarta Sans via Google Fonts.
- **No secrets in the repo.** The LEIA payload is fetched at build time or pasted into the issue JSON.

---

## 9. Acceptance criteria

- [ ] Archive lists every issue, newest first, each linking to its page; searchable by sprint/date.
- [ ] Each issue renders the full menu layout from its JSON and matches the design tokens.
- [ ] Rose/Bud/Thorn render as fixed sections; the 8 cards show correct status colors.
- [ ] Every field shows/holds its origin tag; no metric is computed in the site.
- [ ] "Download PDF" yields a one-page PDF that matches the on-screen layout.
- [ ] Each issue has a stable, copyable share link.
- [ ] Responsive and accessible: semantic headings, color contrast on badges, keyboard navigation, alt text on ornaments.
- [ ] Deploys to GitHub Pages (or the Guest360 site) with no manual HTML per issue.

---

## 10. Seed issue — `/content/issues/sprint-24.json`

Use this real Sprint 23 → 24 issue to build and verify rendering.

```json
{
  "meta": {
    "issueId": "sprint-24",
    "title": "Guest360 Menu",
    "sprintRange": "Sprint 23 → Sprint 24",
    "theme": "Streamline So We Can Scale While Delivering Capital Needs",
    "date": "2025-05-30",
    "tagline": "Be our guest — streamline, scale, and deliver."
  },
  "toBegin": {
    "rose": {
      "label": "Biggest Wins",
      "items": [
        "Funnel dashboard v2 shipped early — analytics now demo-ready.",
        "54 pts delivered vs 48 committed — strongest output this quarter.",
        "CCN R2: dining pipeline & park-entry schema both closed."
      ]
    },
    "bud": {
      "label": "What's Developing",
      "items": [
        "S24 commits 62 pts — hinges on a Day-1 BEEP-442 sync.",
        "Finish dining pipeline & push funnel dashboard to production.",
        "Launch onboarding A/B test; scale real-time aggregation."
      ]
    },
    "thorn": {
      "label": "Biggest Blockers",
      "items": [
        "BEEP-442 dependency blocking 3 stories — escalate by Day 2.",
        "Integration test environment unstable — root cause by Day 3.",
        "Two retro actions still open (sync cadence, criteria template)."
      ]
    }
  },
  "mainCourse": [
    {
      "n": 1, "name": "CCN Release 2", "status": "on-track",
      "progress": "72% complete (+8%); dining pipeline & park-entry schema delivered.",
      "impact": "Search & Guest Events foundations advancing — supports the $12M revenue path.",
      "blockers": "Park-entry schema pending external sign-off (Low — Chu following up).",
      "next": "Integrate park-entry events with identity resolution."
    },
    {
      "n": 2, "name": "Project BEEP", "status": "at-risk",
      "progress": "58% complete (+4%); push-notification targeting rules shipped.",
      "impact": "Capabilities advancing but pace trails the $20M enablement target.",
      "blockers": "BEEP-442 dependency; 2 epic requirements still incomplete (Brian).",
      "next": "Clear cross-platform API gateway blockers; ship targeting v2."
    },
    {
      "n": 3, "name": "Agile Process", "status": "on-track",
      "progress": "Velocity 54 pts; team health 7.8 (+0.6); cadence now measurable.",
      "impact": "Standup format & pair programming cited as key process wins.",
      "blockers": "Dependency meetings still ad hoc (recurring retro theme).",
      "next": "Stand up bi-weekly dependency sync; define acceptance-criteria template."
    },
    {
      "n": 4, "name": "Guest360 API", "status": "at-risk",
      "progress": "Gateway config delivered (8 pts); 18 pts of integration committed S24.",
      "impact": "\"Walk\" API path advancing toward the Salesforce Data Cloud transition.",
      "blockers": "BEEP-442 (High); integration test environment instability (High).",
      "next": "Front-load BEEP-442 sync Day 1; deliver webhook reliability."
    },
    {
      "n": 5, "name": "Guest Events Onboarding", "status": "on-track",
      "progress": "65% complete; park-entry event schema update completed S23.",
      "impact": "Standardized schema moves us toward self-service onboarding.",
      "blockers": "External sign-off on schema change (Low — non-blocking).",
      "next": "Deliver park-entry event integration (Taylor, 5 pts, S24)."
    },
    {
      "n": 6, "name": "Adobe AEP / AJO", "status": "at-risk",
      "progress": "45% complete; technical stack path blocked by API dependencies.",
      "impact": "Enables vendor decision, lower-env setup & integration planning.",
      "blockers": "Cascading from BEEP-442 and test environment instability.",
      "next": "Confirm feasibility post-BEEP-442; escalate to BEEP lead by Day 2."
    },
    {
      "n": 7, "name": "AI SDLC", "status": "on-track",
      "progress": "ORBIT AI panels generating exec-ready narratives; faster code review.",
      "impact": "AI summaries cut Scrum Master prep time and speed leadership comms.",
      "blockers": "Documentation lagging behind shipped features.",
      "next": "Document shipped Analytics features in Confluence (Elaine, S25)."
    },
    {
      "n": 8, "name": "Guest360 Demo App", "status": "on-track",
      "progress": "85% complete (+12%); funnel dashboard v2 & A/B results shipped.",
      "impact": "Demo-ready analytics & activation assets for client/leader presentations.",
      "blockers": "Samantha partial availability days 6–10 — 3 pts shift to Alex.",
      "next": "Deploy funnel dashboard & A/B test to production."
    }
  ],
  "dessert": {
    "leiaLinks": [
      { "label": "Guest360 Docs / ORBIT", "url": "https://angelaayay29.github.io/ORBIT/" },
      { "label": "Sprint 23 Retro", "url": "https://angelaayay29.github.io/ORBIT/#retro" },
      { "label": "Sprint 24 Planning", "url": "https://angelaayay29.github.io/ORBIT/#planning" }
    ],
    "manualLinks": [
      { "label": "Q4 / Q1 Roadmap", "url": "" },
      { "label": "Demo / Presentation", "url": "" },
      { "label": "Newsletter Archive", "url": "/" }
    ]
  }
}
```

---

## 11. Build order (suggested)

1. Scaffold the static site + design tokens + Plus Jakarta Sans.
2. Define the issue schema and load `/content/issues/*.json`.
3. Build the **issue page** renderer (masthead → To Begin → Main Course → Dessert) against the seed.
4. Build the **archive** index.
5. Add **Download PDF** (build-step PDF) and **Copy link**.
6. Validation + accessibility pass.
7. Deploy (GitHub Pages) and link/embed on the Guest360 webpage.
