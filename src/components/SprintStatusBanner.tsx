import { Link } from "react-router-dom";
import type { SprintPortfolioStatus } from "../utils/issueInsights";
import { formatIssueDate } from "../utils/formatIssueDate";

interface SprintStatusBannerProps {
  portfolio: SprintPortfolioStatus;
  latestIssueId: string;
  onCopyLatest?: () => void;
  variant: "viewer" | "editor";
}

function statusClass(label: SprintPortfolioStatus["latestLabel"]): string {
  switch (label) {
    case "On Track":
      return "sprint-status--ok";
    case "At Risk":
      return "sprint-status--risk";
    default:
      return "sprint-status--mixed";
  }
}

export function SprintStatusBanner({
  portfolio,
  latestIssueId,
  onCopyLatest,
  variant,
}: SprintStatusBannerProps) {
  return (
    <section
      className={`sprint-status ${statusClass(portfolio.latestLabel)}`}
      aria-label="Overall sprint portfolio status"
    >
      <div className="sprint-status__main">
        <p className="sprint-status__eyebrow">Current sprint status</p>
        <div className="sprint-status__headline">
          <span className="sprint-status__badge">{portfolio.latestLabel}</span>
          <h2>{portfolio.latestSprintRange}</h2>
        </div>
        <p className="sprint-status__detail">
          {portfolio.latestOnTrack} priorities on track · {portfolio.latestAtRisk} at
          risk · {formatIssueDate(portfolio.latestDate)}
        </p>
      </div>

      <div className="sprint-status__portfolio">
        <p className="sprint-status__portfolio-label">Across {portfolio.sprintCount} sprints</p>
        <ul className="sprint-status__stats">
          <li>
            <strong>{portfolio.mostlyOnTrackCount}</strong> mostly on track
          </li>
          <li>
            <strong>{portfolio.mixedCount}</strong> mixed
          </li>
          <li>
            <strong>{portfolio.withRisksCount}</strong> with risks
          </li>
        </ul>
      </div>

      {variant === "viewer" ? (
        <div className="sprint-status__actions">
          <Link className="btn btn-primary" to={`/issues/${latestIssueId}`}>
            Read latest menu
          </Link>
          {onCopyLatest ? (
            <button type="button" className="btn btn-secondary" onClick={onCopyLatest}>
              Copy link
            </button>
          ) : null}
        </div>
      ) : (
        <div className="sprint-status__actions">
          <Link className="btn btn-primary" to="/editor">
            Open editor
          </Link>
          <Link className="btn btn-secondary" to={`/issues/${latestIssueId}`}>
            Preview latest
          </Link>
        </div>
      )}
    </section>
  );
}
