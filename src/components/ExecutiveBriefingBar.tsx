import { Link } from "react-router-dom";
import type { ExecutiveBriefing } from "../types/issue";
import { formatIssueDate } from "../utils/formatIssueDate";

interface ExecutiveBriefingProps {
  briefing: ExecutiveBriefing;
  onCopyLatest: () => void;
}

export function ExecutiveBriefingBar({
  briefing,
  onCopyLatest,
}: ExecutiveBriefingProps) {
  const { latestIssue, totalIssues, headlineRose } = briefing;

  return (
    <section className="exec-briefing" aria-label="Executive briefing summary">
      <div className="exec-briefing__pulse">
        <div className="exec-stat">
          <span className="exec-stat__value">{latestIssue.onTrack}</span>
          <span className="exec-stat__label">On track</span>
        </div>
        <div className="exec-stat exec-stat--risk">
          <span className="exec-stat__value">{latestIssue.atRisk}</span>
          <span className="exec-stat__label">At risk</span>
        </div>
        <div className="exec-stat">
          <span className="exec-stat__value">{latestIssue.readMinutes}m</span>
          <span className="exec-stat__label">Read time</span>
        </div>
        <div className="exec-stat">
          <span className="exec-stat__value">{totalIssues}</span>
          <span className="exec-stat__label">In archive</span>
        </div>
      </div>

      <article className="exec-featured">
        <p className="exec-featured__eyebrow">Latest menu · {formatIssueDate(latestIssue.date)}</p>
        <h2>{latestIssue.sprintRange}</h2>
        <p className="exec-featured__theme">{latestIssue.theme}</p>
        {headlineRose ? (
          <p className="exec-featured__win">
            <strong>Top win:</strong> {headlineRose}
          </p>
        ) : null}
        <div className="exec-featured__actions">
          <Link
            className="btn btn-primary"
            to={`/issues/${latestIssue.issueId}`}
          >
            Read latest briefing
          </Link>
          <button type="button" className="btn btn-secondary" onClick={onCopyLatest}>
            Copy share link
          </button>
        </div>
      </article>
    </section>
  );
}
