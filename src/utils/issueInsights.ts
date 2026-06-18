import type { NewsletterIssue } from "../types/issue";

export function countStatuses(issue: NewsletterIssue): {
  onTrack: number;
  atRisk: number;
} {
  const onTrack = issue.mainCourse.filter((c) => c.status === "on-track").length;
  const atRisk = issue.mainCourse.filter((c) => c.status === "at-risk").length;
  return { onTrack, atRisk };
}

export function estimateReadMinutes(issue: NewsletterIssue): number {
  const text = JSON.stringify(issue);
  const words = text.split(/\s+/).length;
  return Math.max(2, Math.min(5, Math.round(words / 220)));
}

export function getHeadlineWin(issue: NewsletterIssue): string {
  return issue.toBegin.rose.items[0] ?? "";
}
