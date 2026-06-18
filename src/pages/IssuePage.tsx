import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { MenuLayout } from "../components/MenuLayout";
import { DISTRIBUTION_LIST } from "../config/distribution";
import { simulateEmailSend } from "../services/emailSimulation";
import { getIssueById } from "../utils/loadIssues";

export function IssuePage() {
  const { issueId } = useParams<{ issueId: string }>();
  const { isEditor, session } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const refresh = () => setRefreshKey((value) => value + 1);
    window.addEventListener("bog360-issues-updated", refresh);
    return () => window.removeEventListener("bog360-issues-updated", refresh);
  }, []);

  const issue = useMemo(
    () => (issueId ? getIssueById(issueId) : undefined),
    [issueId, refreshKey],
  );

  if (!issue) {
    return (
      <div className="not-found">
        <h1>Issue not found</h1>
        <p>
          We could not find a newsletter for <code>{issueId}</code>.
        </p>
        {session ? (
          <Link className="btn btn-primary" to="/">
            Back to archive
          </Link>
        ) : (
          <Link className="btn btn-primary" to="/login">
            Sign in to archive
          </Link>
        )}
      </div>
    );
  }

  const baseUrl = import.meta.env.BASE_URL;
  const shareUrl = `${window.location.origin}${baseUrl}issues/${issue.meta.issueId}`;
  const pdfUrl = `${baseUrl}issues/${issue.meta.issueId}.pdf`;

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2800);
  };

  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      showToast("Share link copied");
    } catch {
      showToast("Could not copy link");
    }
  };

  const downloadPdf = async () => {
    try {
      const response = await fetch(pdfUrl, { method: "HEAD" });
      if (response.ok) {
        window.open(pdfUrl, "_blank", "noopener,noreferrer");
        showToast("Opening PDF download");
        return;
      }
    } catch {
      // fall through to print
    }
    window.print();
    showToast("Use Save as PDF in the print dialog");
  };

  const emailShare = () => {
    if (isEditor) {
      const result = simulateEmailSend(issue);
      showToast(
        `Simulated distribution email to ${result.recipients.length} recipients`,
      );
      return;
    }
    const subject = encodeURIComponent(
      `${issue.meta.title} — ${issue.meta.sprintRange}`,
    );
    const body = encodeURIComponent(
      `Be Our Guest360 newsletter for ${issue.meta.sprintRange}.\n\nRead online: ${shareUrl}`,
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  return (
    <>
      <div className="issue-toolbar no-print">
        {session ? (
          <Link className="btn btn-ghost" to="/">
            ← Archive
          </Link>
        ) : (
          <Link className="btn btn-ghost" to="/login">
            Sign in
          </Link>
        )}
        <button type="button" className="btn btn-secondary" onClick={copyShareLink}>
          Copy share link
        </button>
        <button type="button" className="btn btn-secondary" onClick={emailShare}>
          {isEditor ? "Email distribution" : "Email"}
        </button>
        <button type="button" className="btn btn-primary" onClick={downloadPdf}>
          Download PDF
        </button>
      </div>
      <MenuLayout issue={issue} key={refreshKey} />
      {toast ? (
        <div className="toast" role="status" aria-live="polite">
          {toast}
        </div>
      ) : null}
    </>
  );
}
