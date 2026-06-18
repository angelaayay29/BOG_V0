import type { IssueSummary, NewsletterIssue } from "../types/issue";
import { getPublishedIssueById, getPublishedIssues } from "./publishedIssues";
import { validateIssue } from "./validateIssue";

const issueModules = import.meta.glob("../../content/issues/*.json", {
  eager: true,
}) as Record<string, { default: unknown }>;

function loadRepoIssues(): NewsletterIssue[] {
  return Object.entries(issueModules).map(([path, mod]) =>
    validateIssue(mod.default, path),
  );
}

function mergeIssues(): NewsletterIssue[] {
  const repoIssues = loadRepoIssues();
  const published = getPublishedIssues();
  const repoIds = new Set(repoIssues.map((issue) => issue.meta.issueId));

  const merged = [
    ...published.filter((issue) => !repoIds.has(issue.meta.issueId)),
    ...repoIssues,
    ...published.filter((issue) => repoIds.has(issue.meta.issueId)),
  ];

  const byId = new Map<string, NewsletterIssue>();
  for (const issue of merged) {
    byId.set(issue.meta.issueId, issue);
  }

  return [...byId.values()].sort(
    (a, b) => new Date(b.meta.date).getTime() - new Date(a.meta.date).getTime(),
  );
}

export function getAllIssues(): NewsletterIssue[] {
  return mergeIssues();
}

export function getIssueSummaries(): IssueSummary[] {
  const publishedIds = new Set(
    getPublishedIssues().map((issue) => issue.meta.issueId),
  );

  return getAllIssues().map((issue) => ({
    issueId: issue.meta.issueId,
    title: issue.meta.title,
    sprintRange: issue.meta.sprintRange,
    theme: issue.meta.theme,
    date: issue.meta.date,
    source: publishedIds.has(issue.meta.issueId) ? "published" : "repo",
  }));
}

export function getIssueById(issueId: string): NewsletterIssue | undefined {
  const published = getPublishedIssueById(issueId);
  if (published) return published;
  return loadRepoIssues().find((issue) => issue.meta.issueId === issueId);
}

export function formatIssueDate(date: string): string {
  const parsed = new Date(`${date}T00:00:00`);
  return parsed.toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });
}

export function getLatestRepoIssue(): NewsletterIssue | undefined {
  const issues = loadRepoIssues().sort(
    (a, b) => new Date(b.meta.date).getTime() - new Date(a.meta.date).getTime(),
  );
  return issues[0];
}
