import type { NewsletterIssue, RawNewsletterIssue } from "../types/issue";
import { normalizeIssue, unwrap } from "./unwrapIssue";

const TO_BEGIN_KEYS = ["rose", "bud", "thorn"] as const;

export function validateRawIssue(
  issue: unknown,
  filePath: string,
): NewsletterIssue {
  if (!issue || typeof issue !== "object") {
    throw new Error(`${filePath}: issue must be an object`);
  }

  const data = issue as Partial<RawNewsletterIssue>;

  if (!data.meta?.issueId) {
    throw new Error(`${filePath}: meta.issueId is required`);
  }

  if (!data.meta?.title) {
    throw new Error(`${filePath}: meta.title is required`);
  }

  if (!data.meta?.sprintRange) {
    throw new Error(`${filePath}: meta.sprintRange is required`);
  }

  if (!data.meta?.theme) {
    throw new Error(`${filePath}: meta.theme is required`);
  }

  if (!data.meta?.date) {
    throw new Error(`${filePath}: meta.date is required`);
  }

  if (!data.meta?.tagline) {
    throw new Error(`${filePath}: meta.tagline is required`);
  }

  if (!data.toBegin) {
    throw new Error(`${filePath}: toBegin is required`);
  }

  for (const key of TO_BEGIN_KEYS) {
    const section = data.toBegin[key];
    if (!section?.label) {
      throw new Error(`${filePath}: toBegin.${key}.label is required`);
    }
    if (!Array.isArray(section.items) || section.items.length !== 3) {
      throw new Error(
        `${filePath}: toBegin.${key}.items must contain exactly 3 items`,
      );
    }
  }

  if (!Array.isArray(data.mainCourse) || data.mainCourse.length !== 8) {
    throw new Error(`${filePath}: mainCourse must contain exactly 8 cards`);
  }

  data.mainCourse.forEach((card, index) => {
    if (typeof card.n !== "number") {
      throw new Error(`${filePath}: mainCourse[${index}].n must be a number`);
    }
    if (!card.name) {
      throw new Error(`${filePath}: mainCourse[${index}].name is required`);
    }
    const status = unwrap(card.status);
    if (status !== "on-track" && status !== "at-risk") {
      throw new Error(
        `${filePath}: mainCourse[${index}].status must be "on-track" or "at-risk"`,
      );
    }
    for (const field of ["progress", "impact", "blockers", "next"] as const) {
      if (!card[field]) {
        throw new Error(
          `${filePath}: mainCourse[${index}].${field} is required`,
        );
      }
    }
  });

  if (!data.dessert?.leiaLinks || !Array.isArray(data.dessert.leiaLinks)) {
    throw new Error(`${filePath}: dessert.leiaLinks must be an array`);
  }

  if (!data.dessert?.manualLinks || !Array.isArray(data.dessert.manualLinks)) {
    throw new Error(`${filePath}: dessert.manualLinks must be an array`);
  }

  return normalizeIssue(data as RawNewsletterIssue);
}

export function validateIssue(
  issue: unknown,
  filePath: string,
): NewsletterIssue {
  return validateRawIssue(issue, filePath);
}

export function validateEditableIssue(issue: NewsletterIssue): string | null {
  try {
    validateRawIssue(issue, "editor");
    return null;
  } catch (error) {
    return error instanceof Error ? error.message : "Invalid issue";
  }
}
