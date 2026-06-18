import type {
  ContentOrigin,
  IssueLink,
  IssueStatus,
  IssueSummaryStats,
  MainCourseCard,
  NewsletterIssue,
  RawNewsletterIssue,
  TaggedIssueLink,
  TaggedValue,
} from "../types/issue";

export function unwrap<T>(field: TaggedValue<T>): T {
  if (field !== null && typeof field === "object" && "value" in field) {
    return field.value;
  }
  return field as T;
}

export function unwrapOrigin<T>(field: TaggedValue<T>): ContentOrigin | undefined {
  if (field !== null && typeof field === "object" && "origin" in field) {
    return field.origin;
  }
  return undefined;
}

export function tag<T>(value: T, origin: ContentOrigin): { value: T; origin: ContentOrigin } {
  return { value, origin };
}

function unwrapLink(link: TaggedIssueLink): IssueLink {
  return {
    label: unwrap(link.label),
    url: unwrap(link.url),
  };
}

export function normalizeIssue(raw: RawNewsletterIssue): NewsletterIssue {
  return {
    meta: {
      issueId: unwrap(raw.meta.issueId),
      title: unwrap(raw.meta.title),
      sprintRange: unwrap(raw.meta.sprintRange),
      theme: unwrap(raw.meta.theme),
      date: unwrap(raw.meta.date),
      tagline: unwrap(raw.meta.tagline),
    },
    summary: {
      onTrack: unwrap(raw.summary.onTrack),
      atRisk: unwrap(raw.summary.atRisk),
      overallStatus: unwrap(raw.summary.overallStatus),
    },
    toBegin: {
      rose: {
        label: unwrap(raw.toBegin.rose.label),
        items: raw.toBegin.rose.items.map(unwrap),
      },
      bud: {
        label: unwrap(raw.toBegin.bud.label),
        items: raw.toBegin.bud.items.map(unwrap),
      },
      thorn: {
        label: unwrap(raw.toBegin.thorn.label),
        items: raw.toBegin.thorn.items.map(unwrap),
      },
    },
    mainCourse: raw.mainCourse.map(
      (card): MainCourseCard => ({
        n: card.n,
        name: unwrap(card.name),
        status: unwrap(card.status),
        progress: unwrap(card.progress),
        impact: unwrap(card.impact),
        blockers: unwrap(card.blockers),
        next: unwrap(card.next),
      }),
    ),
    dessert: {
      leiaLinks: raw.dessert.leiaLinks.map(unwrapLink),
      manualLinks: raw.dessert.manualLinks.map(unwrapLink),
    },
  };
}

export function buildSummaryFromCards(
  mainCourse: MainCourseCard[],
): IssueSummaryStats {
  const onTrack = mainCourse.filter((card) => card.status === "on-track").length;
  const atRisk = mainCourse.filter((card) => card.status === "at-risk").length;
  let overallStatus: IssueSummaryStats["overallStatus"] = "mixed";
  if (atRisk === 0 || onTrack > atRisk) overallStatus = "on-track";
  else if (atRisk > onTrack) overallStatus = "at-risk";
  return { onTrack, atRisk, overallStatus };
}

export function toRawIssue(issue: NewsletterIssue): RawNewsletterIssue {
  const fieldOrigins = {
    meta: {
      issueId: "manual" as const,
      title: "manual" as const,
      sprintRange: "leia" as const,
      theme: "manual" as const,
      date: "leia" as const,
      tagline: "manual" as const,
    },
    summary: "leia" as const,
    toBegin: "leia" as const,
    impact: "ai" as const,
    main: "leia" as const,
    leiaLink: "leia" as const,
    manualLink: "manual" as const,
  };

  return {
    meta: {
      issueId: tag(issue.meta.issueId, fieldOrigins.meta.issueId),
      title: tag(issue.meta.title, fieldOrigins.meta.title),
      sprintRange: tag(issue.meta.sprintRange, fieldOrigins.meta.sprintRange),
      theme: tag(issue.meta.theme, fieldOrigins.meta.theme),
      date: tag(issue.meta.date, fieldOrigins.meta.date),
      tagline: tag(issue.meta.tagline, fieldOrigins.meta.tagline),
    },
    summary: {
      onTrack: tag(issue.summary.onTrack, fieldOrigins.summary),
      atRisk: tag(issue.summary.atRisk, fieldOrigins.summary),
      overallStatus: tag(issue.summary.overallStatus, fieldOrigins.summary),
    },
    toBegin: {
      rose: {
        label: tag(issue.toBegin.rose.label, fieldOrigins.toBegin),
        items: issue.toBegin.rose.items.map((item) => tag(item, fieldOrigins.toBegin)),
      },
      bud: {
        label: tag(issue.toBegin.bud.label, fieldOrigins.toBegin),
        items: issue.toBegin.bud.items.map((item) => tag(item, fieldOrigins.toBegin)),
      },
      thorn: {
        label: tag(issue.toBegin.thorn.label, fieldOrigins.toBegin),
        items: issue.toBegin.thorn.items.map((item) => tag(item, fieldOrigins.toBegin)),
      },
    },
    mainCourse: issue.mainCourse.map((card) => ({
      n: card.n,
      name: tag(card.name, fieldOrigins.main),
      status: tag(card.status, fieldOrigins.main),
      progress: tag(card.progress, fieldOrigins.main),
      impact: tag(card.impact, fieldOrigins.impact),
      blockers: tag(card.blockers, fieldOrigins.main),
      next: tag(card.next, fieldOrigins.main),
    })),
    dessert: {
      leiaLinks: issue.dessert.leiaLinks.map((link) => ({
        label: tag(link.label, fieldOrigins.leiaLink),
        url: tag(link.url, fieldOrigins.leiaLink),
      })),
      manualLinks: issue.dessert.manualLinks.map((link) => ({
        label: tag(link.label, fieldOrigins.manualLink),
        url: tag(link.url, fieldOrigins.manualLink),
      })),
    },
  };
}
