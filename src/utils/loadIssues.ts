import type { IssueSummary, NewsletterIssue } from "../types/issue";
import { formatIssueDate } from "./formatIssueDate";
import { getPublishedIssueById, getPublishedIssues } from "./publishedIssues";
import { validateIssue } from "./validateIssue";

export { formatIssueDate };

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

export function getLatestRepoIssue(): NewsletterIssue | undefined {
  const issues = loadRepoIssues().sort(
    (a, b) => new Date(b.meta.date).getTime() - new Date(a.meta.date).getTime(),
  );
  return issues[0];
}
