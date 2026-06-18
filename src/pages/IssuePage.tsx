import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { MenuLayout } from "../components/MenuLayout";
import { DISTRIBUTION_LIST } from "../config/distribution";
import { simulateEmailSend } from "../services/emailSimulation";
import { getIssueById } from "../utils/loadIssues";

export function IssuePage() {
  const { issueId } = useParams<{ issueId: string }>();
  const { isEditor } = useAuth();
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
        <Link className="btn btn-primary" to="/">
          Back to archive
        </Link>
      </div>
    );
  }

  const baseUrl = import.meta.env.BASE_URL;
  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}${baseUrl}issues/${issue.meta.issueId}`
      : `${baseUrl}issues/${issue.meta.issueId}`;

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2400);
  };

  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      showToast("Share link copied");
    } catch {
      showToast("Could not copy link");
    }
  };

  const downloadPdf = () => {
    window.print();
    showToast("Save as PDF · enable Background graphics · margins Default or Minimum");
  };

  const simulateEditorEmail = () => {
    const result = simulateEmailSend(issue);
    showToast(
      `Simulated email to ${result.recipients.length} recipients (${DISTRIBUTION_LIST[0]}… )`,
    );
  };

  return (
    <>
      <div className="issue-toolbar no-print">
        <Link className="btn btn-ghost" to="/">
          ← Archive
        </Link>
        <button type="button" className="btn btn-secondary" onClick={copyShareLink}>
          Copy link
        </button>
        {isEditor ? (
          <button type="button" className="btn btn-secondary" onClick={simulateEditorEmail}>
            Email distribution
          </button>
        ) : null}
        <button type="button" className="btn btn-secondary" onClick={downloadPdf}>
          Print / Save PDF
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
