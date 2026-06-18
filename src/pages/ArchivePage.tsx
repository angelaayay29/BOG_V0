import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { ExecutiveBriefingBar } from "../components/ExecutiveBriefingBar";
import { SubscribePanel } from "../components/SubscribePanel";
import type { IssueSummary } from "../types/issue";
import {
  formatIssueDate,
  getExecutiveBriefing,
  getIssueSummaries,
} from "../utils/loadIssues";

type FilterKey = "all" | "on-track" | "at-risk";

function StatusDots({ onTrack, atRisk }: { onTrack: number; atRisk: number }) {
  return (
    <span className="status-dots" aria-label={`${onTrack} on track, ${atRisk} at risk`}>
      {Array.from({ length: onTrack }, (_, i) => (
        <span key={`ok-${i}`} className="status-dots__dot status-dots__dot--ok" />
      ))}
      {Array.from({ length: atRisk }, (_, i) => (
        <span key={`risk-${i}`} className="status-dots__dot status-dots__dot--risk" />
      ))}
    </span>
  );
}

function ArchiveTimelineItem({
  issue,
  index,
  total,
}: {
  issue: IssueSummary;
  index: number;
  total: number;
}) {
  const isLatest = index === 0;

  return (
    <li className={`archive-timeline__item${isLatest ? " archive-timeline__item--latest" : ""}`}>
      <div className="archive-timeline__rail" aria-hidden="true">
        <span className="archive-timeline__node">{total - index}</span>
        {index < total - 1 ? <span className="archive-timeline__line" /> : null}
      </div>

      <article className="archive-timeline__card">
        <div className="archive-timeline__card-top">
          <div>
            <p className="archive-timeline__date">{formatIssueDate(issue.date)}</p>
            <h3>{issue.sprintRange}</h3>
          </div>
          <div className="archive-timeline__badges">
            {isLatest ? <span className="archive-badge archive-badge--latest">Latest</span> : null}
            {issue.source === "published" ? (
              <span className="archive-badge">New</span>
            ) : null}
          </div>
        </div>

        <p className="archive-timeline__theme">{issue.theme}</p>

        <div className="archive-timeline__meta">
          <StatusDots onTrack={issue.onTrack} atRisk={issue.atRisk} />
          <span className="archive-timeline__read">{issue.readMinutes} min read</span>
          <span className="archive-timeline__health">
            {issue.onTrack} on track · {issue.atRisk} at risk
          </span>
        </div>

        <div className="archive-timeline__actions">
          <Link className="btn btn-primary" to={`/issues/${issue.issueId}`}>
            Open menu
          </Link>
          <Link className="btn btn-ghost" to={`/issues/${issue.issueId}`}>
            Print / PDF
          </Link>
        </div>
      </article>
    </li>
  );
}

export function ArchivePage() {
  const { isEditor } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const refresh = () => setRefreshKey((value) => value + 1);
    window.addEventListener("bog360-issues-updated", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("bog360-issues-updated", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const issues = useMemo(() => getIssueSummaries(), [refreshKey]);
  const briefing = useMemo(() => getExecutiveBriefing(), [refreshKey]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return issues.filter((issue) => {
      if (filter === "on-track" && issue.atRisk > issue.onTrack) return false;
      if (filter === "at-risk" && issue.atRisk === 0) return false;

      if (!normalized) return true;

      const haystack = [
        issue.title,
        issue.sprintRange,
        issue.theme,
        issue.date,
        formatIssueDate(issue.date),
        issue.issueId,
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalized);
    });
  }, [issues, query, filter]);

  const copyLatestLink = async () => {
    if (!briefing) return;
    const baseUrl = import.meta.env.BASE_URL;
    const url = `${window.location.origin}${baseUrl}issues/${briefing.latestIssue.issueId}`;
    try {
      await navigator.clipboard.writeText(url);
      setToast("Latest briefing link copied");
      window.setTimeout(() => setToast(null), 2400);
    } catch {
      setToast("Could not copy link");
      window.setTimeout(() => setToast(null), 2400);
    }
  };

  return (
    <div className="archive-page">
      <header className="archive-hero">
        <p className="archive-hero__eyebrow">Executive newsletter</p>
        <h1>Be Our Guest360</h1>
        <p className="archive-hero__lead">
          Sprint menus for business leaders — Q4 priorities, risks, and wins in a
          two-minute skim.
        </p>
        {isEditor ? (
          <Link className="btn btn-primary" to="/editor">
            Compose this week&apos;s menu
          </Link>
        ) : null}
      </header>

      {briefing ? (
        <ExecutiveBriefingBar briefing={briefing} onCopyLatest={copyLatestLink} />
      ) : null}

      <div className="archive-layout">
        <section className="archive-panel" aria-labelledby="archive-panel-heading">
          <div className="archive-panel__header">
            <div>
              <h2 id="archive-panel-heading">Newsletter archive</h2>
              <p>Ordered newest first — every published Guest360 menu.</p>
            </div>
            <span className="archive-panel__count">{issues.length} issues</span>
          </div>

          <div className="archive-controls">
            <label htmlFor="archive-search" className="sr-only">
              Search newsletters
            </label>
            <input
              id="archive-search"
              className="archive-search"
              type="search"
              placeholder="Search sprint, theme, or date…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <div className="archive-filters" role="group" aria-label="Filter newsletters">
              {(
                [
                  ["all", "All"],
                  ["on-track", "Mostly on track"],
                  ["at-risk", "Has risks"],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  className={`archive-filter${filter === key ? " archive-filter--active" : ""}`}
                  onClick={() => setFilter(key)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <p className="archive-empty">No newsletters match your search.</p>
          ) : (
            <ol className="archive-timeline">
              {filtered.map((issue, index) => (
                <ArchiveTimelineItem
                  key={issue.issueId}
                  issue={issue}
                  index={index}
                  total={filtered.length}
                />
              ))}
            </ol>
          )}
        </section>

        <div className="archive-sidebar">
          <SubscribePanel />

          <aside className="exec-tips" aria-labelledby="exec-tips-heading">
            <h2 id="exec-tips-heading">How leaders use this</h2>
            <ul>
              <li>
                <strong>2-minute skim:</strong> Rose / Bud / Thorn tells you what
                changed this sprint.
              </li>
              <li>
                <strong>Main course:</strong> Eight Q4 priorities with status,
                blockers, and next steps.
              </li>
              <li>
                <strong>Share:</strong> Copy a stable link or print a one-page PDF
                for staff meetings.
              </li>
            </ul>
          </aside>
        </div>
      </div>

      {toast ? (
        <div className="toast" role="status">
          {toast}
        </div>
      ) : null}
    </div>
  );
}
