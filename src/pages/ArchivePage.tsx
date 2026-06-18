import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { formatIssueDate, getIssueSummaries } from "../utils/loadIssues";

export function ArchivePage() {
  const { isEditor } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);

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
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return issues;

    return issues.filter((issue) => {
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
  }, [issues, query]);

  const baseUrl = import.meta.env.BASE_URL;

  return (
    <div className="archive-page">
      <header className="archive-header">
        <h1>Be Our Guest360</h1>
        <p>Executive newsletter archive — sprint progress for business leaders.</p>
        {isEditor ? (
          <Link className="btn btn-primary archive-header__cta" to="/editor">
            Create / edit this week&apos;s newsletter
          </Link>
        ) : null}
      </header>

      <div className="archive-controls">
        <label htmlFor="archive-search" className="sr-only">
          Search issues by sprint, theme, or date
        </label>
        <input
          id="archive-search"
          className="archive-search"
          type="search"
          placeholder="Search by sprint, theme, or date…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <p className="archive-empty">No issues match your search.</p>
      ) : (
        <div className="archive-grid">
          {filtered.map((issue) => (
            <article key={issue.issueId} className="archive-card">
              <div className="archive-card__top">
                <h2>{issue.title}</h2>
                {issue.source === "published" ? (
                  <span className="archive-card__badge">Recently published</span>
                ) : null}
              </div>
              <p className="archive-card__meta">{issue.sprintRange}</p>
              <p className="archive-card__theme">
                Theme: {issue.theme} · {formatIssueDate(issue.date)}
              </p>
              <div className="archive-card__actions">
                <Link
                  className="btn btn-primary"
                  to={`/issues/${issue.issueId}`}
                >
                  Read
                </Link>
                <a
                  className="btn btn-secondary"
                  href={`${baseUrl}issues/${issue.issueId}.pdf`}
                  download
                >
                  Download PDF
                </a>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
