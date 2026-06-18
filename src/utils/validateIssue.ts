import type { NewsletterIssue } from "../types/issue";
import { normalizeIssue, unwrap } from "./unwrapIssue";

const TO_BEGIN_KEYS = ["rose", "bud", "thorn"] as const;

function assertTagged(field: unknown, path: string): void {
  if (!field || typeof field !== "object" || !("value" in field) || !("origin" in field)) {
    throw new Error(`${path}: expected tagged value { value, origin }`);
  }
}

export function validateRawIssue(
  issue: unknown,
  filePath: string,
): NewsletterIssue {
  if (!issue || typeof issue !== "object") {
    throw new Error(`${filePath}: issue must be an object`);
  }

  const data = issue as Record<string, unknown>;

  if (!data.meta || typeof data.meta !== "object") {
    throw new Error(`${filePath}: meta is required`);
  }

  if (!data.summary || typeof data.summary !== "object") {
    throw new Error(`${filePath}: summary is required (LEIA onTrack/atRisk/overallStatus)`);
  }

  const meta = data.meta as Record<string, unknown>;
  for (const key of ["issueId", "title", "sprintRange", "theme", "date", "tagline"]) {
    assertTagged(meta[key], `${filePath}: meta.${key}`);
  }

  const summary = data.summary as Record<string, unknown>;
  for (const key of ["onTrack", "atRisk", "overallStatus"]) {
    assertTagged(summary[key], `${filePath}: summary.${key}`);
  }

  const overallStatus = unwrap(summary.overallStatus as never);
  if (overallStatus !== "on-track" && overallStatus !== "at-risk" && overallStatus !== "mixed") {
    throw new Error(`${filePath}: summary.overallStatus must be on-track, at-risk, or mixed`);
  }

  const toBegin = data.toBegin as Record<string, unknown> | undefined;
  if (!toBegin) {
    throw new Error(`${filePath}: toBegin is required`);
  }

  for (const key of TO_BEGIN_KEYS) {
    const section = toBegin[key] as Record<string, unknown> | undefined;
    if (!section?.label) {
      throw new Error(`${filePath}: toBegin.${key}.label is required`);
    }
    assertTagged(section.label, `${filePath}: toBegin.${key}.label`);
    if (!Array.isArray(section.items) || section.items.length !== 3) {
      throw new Error(
        `${filePath}: toBegin.${key}.items must contain exactly 3 tagged items`,
      );
    }
    section.items.forEach((item, index) =>
      assertTagged(item, `${filePath}: toBegin.${key}.items[${index}]`),
    );
  }

  if (!Array.isArray(data.mainCourse) || data.mainCourse.length !== 8) {
    throw new Error(`${filePath}: mainCourse must contain exactly 8 cards`);
  }

  (data.mainCourse as Record<string, unknown>[]).forEach((card, index) => {
    if (typeof card.n !== "number") {
      throw new Error(`${filePath}: mainCourse[${index}].n must be a number`);
    }
    for (const field of ["name", "status", "progress", "impact", "blockers", "next"]) {
      if (!card[field]) {
        throw new Error(`${filePath}: mainCourse[${index}].${field} is required`);
      }
      assertTagged(card[field], `${filePath}: mainCourse[${index}].${field}`);
    }
    const status = unwrap(card.status as never);
    if (status !== "on-track" && status !== "at-risk") {
      throw new Error(
        `${filePath}: mainCourse[${index}].status must be "on-track" or "at-risk"`,
      );
    }
  });

  const dessert = data.dessert as Record<string, unknown> | undefined;
  if (!dessert?.leiaLinks || !Array.isArray(dessert.leiaLinks)) {
    throw new Error(`${filePath}: dessert.leiaLinks must be an array`);
  }
  if (!dessert?.manualLinks || !Array.isArray(dessert.manualLinks)) {
    throw new Error(`${filePath}: dessert.manualLinks must be an array`);
  }

  return normalizeIssue(data as never);
}

export function validateIssue(
  issue: unknown,
  filePath: string,
): NewsletterIssue {
  return validateRawIssue(issue, filePath);
}

export function validateEditableIssue(issue: NewsletterIssue): string | null {
  if (!issue.meta?.issueId) return "editor: meta.issueId is required";
  if (!issue.meta?.title) return "editor: meta.title is required";
  if (!issue.summary) return "editor: summary is required";

  for (const key of TO_BEGIN_KEYS) {
    const section = issue.toBegin[key];
    if (!section?.label || section.items.length !== 3) {
      return `editor: toBegin.${key} must have a label and exactly 3 items`;
    }
    if (section.items.some((item) => !item.trim())) {
      return `editor: toBegin.${key} items cannot be empty`;
    }
  }

  if (issue.mainCourse.length !== 8) {
    return "editor: mainCourse must contain exactly 8 cards";
  }

  for (const card of issue.mainCourse) {
    if (!card.name?.trim()) return "editor: each priority needs a name";
    for (const field of ["progress", "impact", "blockers", "next"] as const) {
      if (!card[field]?.trim()) {
        return `editor: ${card.name || "priority"} is missing ${field}`;
      }
    }
  }

  return null;
}
