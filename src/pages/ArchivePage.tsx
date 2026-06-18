import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { EditorHomePanel } from "../components/EditorHomePanel";
import { SprintStatusBanner } from "../components/SprintStatusBanner";
import { SubscribePanel } from "../components/SubscribePanel";
import type { IssueSummary } from "../types/issue";
import {
  type ArchiveFilter,
  buildPortfolioStatus,
  filterCount,
  matchesArchiveFilter,
} from "../utils/issueInsights";
import { formatIssueDate, getIssueSummaries } from "../utils/loadIssues";

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
            <h3>{issue.title}</h3>
            <p className="archive-timeline__sprint">{issue.sprintRange}</p>
          </div>
          {isLatest ? <span className="archive-badge archive-badge--latest">Latest</span> : null}
        </div>

        <p className="archive-timeline__theme">Theme: {issue.theme}</p>

        <div className="archive-timeline__meta">
          <StatusDots onTrack={issue.onTrack} atRisk={issue.atRisk} />
          <span className="archive-timeline__health">
            {issue.onTrack} on track · {issue.atRisk} at risk
          </span>
        </div>

        <div className="archive-timeline__actions">
          <Link className="btn btn-primary" to={`/issues/${issue.issueId}`}>
            Read
          </Link>
        </div>
      </article>
    </li>
  );
}

const FILTER_OPTIONS: { key: ArchiveFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "on-track", label: "Mostly on track" },
  { key: "at-risk", label: "Has risks" },
];

export function ArchivePage() {
  const { isEditor } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<ArchiveFilter>("all");
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
  const portfolio = useMemo(() => buildPortfolioStatus(issues), [issues]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return issues.filter((issue) => {
      if (!matchesArchiveFilter(issue, filter)) return false;
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
    if (!portfolio) return;
    const latest = issues[0];
    const baseUrl = import.meta.env.BASE_URL;
    const url = `${window.location.origin}${baseUrl}issues/${latest.issueId}`;
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
    <div className={`archive-page archive-page--${isEditor ? "editor" : "viewer"}`}>
      <header className="archive-hero archive-hero--compact">
        <h1>Be Our Guest360</h1>
        <p className="archive-hero__lead">
          {isEditor
            ? "Prepare and publish the weekly executive sprint menu."
            : "Read sprint briefings — priorities, risks, and wins in minutes."}
        </p>
      </header>

      {portfolio && issues[0] ? (
        <SprintStatusBanner
          portfolio={portfolio}
          latestIssueId={issues[0].issueId}
          onCopyLatest={isEditor ? undefined : copyLatestLink}
          variant={isEditor ? "editor" : "viewer"}
        />
      ) : null}

      <div
        className={`archive-layout archive-layout--${isEditor ? "editor" : "viewer"}`}
      >
        {isEditor ? <EditorHomePanel /> : null}

        <section className="archive-panel" aria-labelledby="archive-panel-heading">
          <div className="archive-panel__header">
            <h2 id="archive-panel-heading">
              {isEditor ? "Published menus" : "Past newsletters"}
            </h2>
          </div>

          <div className="archive-controls">
            <input
              id="archive-search"
              className="archive-search"
              type="search"
              placeholder="Search sprint or theme…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              aria-label="Search newsletters"
            />
            <div className="archive-filters" role="group" aria-label="Filter newsletters">
              {FILTER_OPTIONS.map(({ key, label }) => {
                const count = filterCount(issues, key);
                return (
                  <button
                    key={key}
                    type="button"
                    className={`archive-filter${filter === key ? " archive-filter--active" : ""}`}
                    onClick={() => setFilter(key)}
                    aria-pressed={filter === key}
                  >
                    {label} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {filtered.length === 0 ? (
            <p className="archive-empty">No newsletters match this filter.</p>
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

        {!isEditor ? <SubscribePanel /> : null}
      </div>

      {toast ? (
        <div className="toast" role="status">
          {toast}
        </div>
      ) : null}
    </div>
  );
}
