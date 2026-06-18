import type { IssueSummary } from "../types/issue";

export type ArchiveFilter = "all" | "on-track" | "at-risk";

export type PortfolioStatusLabel = "On Track" | "Mixed" | "At Risk";

export interface SprintPortfolioStatus {
  sprintCount: number;
  latestSprintRange: string;
  latestDate: string;
  latestOnTrack: number;
  latestAtRisk: number;
  latestLabel: PortfolioStatusLabel;
  mostlyOnTrackCount: number;
  withRisksCount: number;
  mixedCount: number;
}

export function portfolioStatusLabel(
  overallStatus: IssueSummary["overallStatus"],
): PortfolioStatusLabel {
  switch (overallStatus) {
    case "on-track":
      return "On Track";
    case "at-risk":
      return "At Risk";
    default:
      return "Mixed";
  }
}

export function matchesArchiveFilter(
  issue: IssueSummary,
  filter: ArchiveFilter,
): boolean {
  switch (filter) {
    case "all":
      return true;
    case "on-track":
      return issue.overallStatus === "on-track";
    case "at-risk":
      return issue.atRisk > 0;
    default:
      return true;
  }
}

export function buildPortfolioStatus(issues: IssueSummary[]): SprintPortfolioStatus | null {
  if (issues.length === 0) return null;

  const latest = issues[0];
  let mostlyOnTrackCount = 0;
  let withRisksCount = 0;
  let mixedCount = 0;

  for (const issue of issues) {
    if (issue.overallStatus === "on-track") mostlyOnTrackCount += 1;
    if (issue.overallStatus === "mixed") mixedCount += 1;
    if (issue.atRisk > 0) withRisksCount += 1;
  }

  return {
    sprintCount: issues.length,
    latestSprintRange: latest.sprintRange,
    latestDate: latest.date,
    latestOnTrack: latest.onTrack,
    latestAtRisk: latest.atRisk,
    latestLabel: portfolioStatusLabel(latest.overallStatus),
    mostlyOnTrackCount,
    withRisksCount,
    mixedCount,
  };
}

export function filterCount(issues: IssueSummary[], filter: ArchiveFilter): number {
  return issues.filter((issue) => matchesArchiveFilter(issue, filter)).length;
}

export function getHeadlineWin(issue: {
  toBegin: { rose: { items: string[] } };
}): string {
  return issue.toBegin.rose.items[0] ?? "";
}
