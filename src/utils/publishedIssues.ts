import type { NewsletterIssue } from "../types/issue";
import { buildSummaryFromCards } from "./unwrapIssue";
import { validateEditableIssue } from "./validateIssue";

const PUBLISHED_KEY = "bog360-published-issues";
const DRAFT_KEY = "bog360-editor-draft";

type StoredIssue = NewsletterIssue & { publishedAt?: string };

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeStorage<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export function getPublishedIssues(): NewsletterIssue[] {
  const stored = readStorage<StoredIssue[]>(PUBLISHED_KEY, []);
  return stored.filter((issue) => !validateEditableIssue(issue));
}

export function getPublishedIssueById(issueId: string): NewsletterIssue | undefined {
  return getPublishedIssues().find((issue) => issue.meta.issueId === issueId);
}

export function publishIssue(issue: NewsletterIssue): void {
  const withSummary: NewsletterIssue = {
    ...issue,
    summary: buildSummaryFromCards(issue.mainCourse),
  };
  const error = validateEditableIssue(withSummary);
  if (error) {
    throw new Error(error);
  }

  const existing = readStorage<StoredIssue[]>(PUBLISHED_KEY, []);
  const next: StoredIssue[] = [
    { ...withSummary, publishedAt: new Date().toISOString() },
    ...existing.filter((item) => item.meta.issueId !== withSummary.meta.issueId),
  ];
  writeStorage(PUBLISHED_KEY, next);
  clearDraft();
}

export function saveDraft(issue: NewsletterIssue): void {
  writeStorage(DRAFT_KEY, issue);
}

export function getDraft(): NewsletterIssue | null {
  return readStorage<NewsletterIssue | null>(DRAFT_KEY, null);
}

export function clearDraft(): void {
  localStorage.removeItem(DRAFT_KEY);
}
