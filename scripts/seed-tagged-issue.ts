import { tag } from "./unwrapIssue";

function item(value: string, origin: "leia" | "ai" | "manual" = "leia") {
  return tag(value, origin);
}

export const taggedSprint24 = {
  meta: {
    issueId: item("sprint-24", "manual"),
    title: item("Guest360 Menu", "manual"),
    sprintRange: item("Sprint 23 → Sprint 24", "leia"),
    theme: item(
      "Streamline So We Can Scale While Delivering Capital Needs",
      "manual",
    ),
    date: item("2025-05-30", "leia"),
    tagline: item("Be our guest — streamline, scale, and deliver.", "manual"),
  },
  toBegin: {
    rose: {
      label: item("Biggest Wins", "leia"),
      items: [
        item("Funnel dashboard v2 shipped early — analytics now demo-ready."),
        item("54 pts delivered vs 48 committed — strongest output this quarter."),
        item("CCN R2: dining pipeline & park-entry schema both closed."),
      ],
    },
    bud: {
      label: item("What's Developing", "leia"),
      items: [
        item("S24 commits 62 pts — hinges on a Day-1 BEEP-442 sync."),
        item("Finish dining pipeline & push funnel dashboard to production."),
        item("Launch onboarding A/B test; scale real-time aggregation."),
      ],
    },
    thorn: {
      label: item("Biggest Blockers", "leia"),
      items: [
        item("BEEP-442 dependency blocking 3 stories — escalate by Day 2."),
        item("Integration test environment unstable — root cause by Day 3."),
        item("Two retro actions still open (sync cadence, criteria template)."),
      ],
    },
  },
  mainCourse: [
    {
      n: 1,
      name: item("CCN Release 2"),
      status: item("on-track" as const),
      progress: item(
        "72% complete (+8%); dining pipeline & park-entry schema delivered.",
      ),
      impact: item(
        "Search & Guest Events foundations advancing — supports the $12M revenue path.",
        "ai",
      ),
      blockers: item(
        "Park-entry schema pending external sign-off (Low — Chu following up).",
      ),
      next: item("Integrate park-entry events with identity resolution."),
    },
    {
      n: 2,
      name: item("Project BEEP"),
      status: item("at-risk" as const),
      progress: item(
        "58% complete (+4%); push-notification targeting rules shipped.",
      ),
      impact: item(
        "Capabilities advancing but pace trails the $20M enablement target.",
        "ai",
      ),
      blockers: item(
        "BEEP-442 dependency; 2 epic requirements still incomplete (Brian).",
      ),
      next: item("Clear cross-platform API gateway blockers; ship targeting v2."),
    },
    {
      n: 3,
      name: item("Agile Process"),
      status: item("on-track" as const),
      progress: item(
        "Velocity 54 pts; team health 7.8 (+0.6); cadence now measurable.",
      ),
      impact: item(
        "Standup format & pair programming cited as key process wins.",
        "ai",
      ),
      blockers: item("Dependency meetings still ad hoc (recurring retro theme)."),
      next: item(
        "Stand up bi-weekly dependency sync; define acceptance-criteria template.",
      ),
    },
    {
      n: 4,
      name: item("Guest360 API"),
      status: item("at-risk" as const),
      progress: item(
        "Gateway config delivered (8 pts); 18 pts of integration committed S24.",
      ),
      impact: item(
        '"Walk" API path advancing toward the Salesforce Data Cloud transition.',
        "ai",
      ),
      blockers: item(
        "BEEP-442 (High); integration test environment instability (High).",
      ),
      next: item("Front-load BEEP-442 sync Day 1; deliver webhook reliability."),
    },
    {
      n: 5,
      name: item("Guest Events Onboarding"),
      status: item("on-track" as const),
      progress: item(
        "65% complete; park-entry event schema update completed S23.",
      ),
      impact: item(
        "Standardized schema moves us toward self-service onboarding.",
        "ai",
      ),
      blockers: item("External sign-off on schema change (Low — non-blocking)."),
      next: item("Deliver park-entry event integration (Taylor, 5 pts, S24)."),
    },
    {
      n: 6,
      name: item("Adobe AEP / AJO"),
      status: item("at-risk" as const),
      progress: item(
        "45% complete; technical stack path blocked by API dependencies.",
      ),
      impact: item(
        "Enables vendor decision, lower-env setup & integration planning.",
        "ai",
      ),
      blockers: item("Cascading from BEEP-442 and test environment instability."),
      next: item("Confirm feasibility post-BEEP-442; escalate to BEEP lead by Day 2."),
    },
    {
      n: 7,
      name: item("AI SDLC"),
      status: item("on-track" as const),
      progress: item(
        "ORBIT AI panels generating exec-ready narratives; faster code review.",
      ),
      impact: item(
        "AI summaries cut Scrum Master prep time and speed leadership comms.",
        "ai",
      ),
      blockers: item("Documentation lagging behind shipped features."),
      next: item(
        "Document shipped Analytics features in Confluence (Elaine, S25).",
      ),
    },
    {
      n: 8,
      name: item("Guest360 Demo App"),
      status: item("on-track" as const),
      progress: item(
        "85% complete (+12%); funnel dashboard v2 & A/B results shipped.",
      ),
      impact: item(
        "Demo-ready analytics & activation assets for client/leader presentations.",
        "ai",
      ),
      blockers: item(
        "Samantha partial availability days 6–10 — 3 pts shift to Alex.",
      ),
      next: item("Deploy funnel dashboard & A/B test to production."),
    },
  ],
  dessert: {
    leiaLinks: [
      {
        label: item("Guest360 Docs / ORBIT"),
        url: item("https://angelaayay29.github.io/ORBIT/"),
      },
      {
        label: item("Sprint 23 Retro"),
        url: item("https://angelaayay29.github.io/ORBIT/#retro"),
      },
      {
        label: item("Sprint 24 Planning"),
        url: item("https://angelaayay29.github.io/ORBIT/#planning"),
      },
    ],
    manualLinks: [
      { label: item("Q4 / Q1 Roadmap", "manual"), url: item("", "manual") },
      { label: item("Demo / Presentation", "manual"), url: item("", "manual") },
      { label: item("Newsletter Archive", "manual"), url: item("/", "manual") },
    ],
  },
};
