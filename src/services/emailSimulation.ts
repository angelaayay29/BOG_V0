import { DISTRIBUTION_LIST } from "../config/distribution";
import type { NewsletterIssue } from "../types/issue";

export interface EmailSimulationResult {
  sentAt: string;
  recipients: string[];
  subject: string;
  issueId: string;
}

export function simulateEmailSend(issue: NewsletterIssue): EmailSimulationResult {
  return {
    sentAt: new Date().toISOString(),
    recipients: [...DISTRIBUTION_LIST],
    subject: `${issue.meta.title} — ${issue.meta.sprintRange}`,
    issueId: issue.meta.issueId,
  };
}
