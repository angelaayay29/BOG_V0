import { useEffect, useState } from "react";
import type { IssueStatus, NewsletterIssue } from "../types/issue";
import { DISTRIBUTION_LIST } from "../config/distribution";
import { simulateEmailSend } from "../services/emailSimulation";
import { getLatestRepoIssue } from "../utils/loadIssues";
import { getDraft, publishIssue, saveDraft } from "../utils/publishedIssues";
import { buildSummaryFromCards } from "../utils/unwrapIssue";
import { validateEditableIssue } from "../utils/validateIssue";
import { MenuLayout } from "../components/MenuLayout";

function createBlankIssue(): NewsletterIssue {
  const today = new Date().toISOString().slice(0, 10);
  const mainCourse = Array.from({ length: 8 }, (_, index) => ({
    n: index + 1,
    name: "",
    status: "on-track" as IssueStatus,
    progress: "",
    impact: "",
    blockers: "",
    next: "",
  }));
  return {
    meta: {
      issueId: `sprint-${Date.now()}`,
      title: "Guest360 Menu",
      sprintRange: "Sprint N → Sprint N+1",
      theme: "",
      date: today,
      tagline: "Be our guest — streamline, scale, and deliver.",
    },
    summary: buildSummaryFromCards(mainCourse),
    toBegin: {
      rose: { label: "Biggest Wins", items: ["", "", ""] },
      bud: { label: "What's Developing", items: ["", "", ""] },
      thorn: { label: "Biggest Blockers", items: ["", "", ""] },
    },
    mainCourse,
    dessert: {
      leiaLinks: [
        { label: "Guest360 Docs / ORBIT", url: "https://angelaayay29.github.io/ORBIT/" },
        { label: "Sprint Retro", url: "https://angelaayay29.github.io/ORBIT/#retro" },
        { label: "Sprint Planning", url: "https://angelaayay29.github.io/ORBIT/#planning" },
      ],
      manualLinks: [
        { label: "Q4 / Q1 Roadmap", url: "" },
        { label: "Demo / Presentation", url: "" },
        { label: "Newsletter Archive", url: "/" },
      ],
    },
  };
}

function cloneIssue(issue: NewsletterIssue): NewsletterIssue {
  return structuredClone(issue);
}

function notifyIssuesUpdated(): void {
  window.dispatchEvent(new Event("bog360-issues-updated"));
}

export function EditorPage() {
  const [issue, setIssue] = useState<NewsletterIssue>(() => {
    return getDraft() ?? cloneIssue(getLatestRepoIssue() ?? createBlankIssue());
  });
  const [toast, setToast] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [emailPreview, setEmailPreview] = useState<ReturnType<typeof simulateEmailSend> | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    const error = validateEditableIssue(issue);
    setValidationError(error);
  }, [issue]);

  const updateMeta = (field: keyof NewsletterIssue["meta"], value: string) => {
    setIssue((current) => ({
      ...current,
      meta: { ...current.meta, [field]: value },
    }));
  };

  const updateToBeginItem = (
    section: "rose" | "bud" | "thorn",
    index: number,
    value: string,
  ) => {
    setIssue((current) => {
      const items = [...current.toBegin[section].items];
      items[index] = value;
      return {
        ...current,
        toBegin: {
          ...current.toBegin,
          [section]: { ...current.toBegin[section], items },
        },
      };
    });
  };

  const updateCard = (
    index: number,
    field: keyof NewsletterIssue["mainCourse"][number],
    value: string | number,
  ) => {
    setIssue((current) => {
      const mainCourse = current.mainCourse.map((card, cardIndex) =>
        cardIndex === index ? { ...card, [field]: value } : card,
      );
      return {
        ...current,
        mainCourse,
        summary: buildSummaryFromCards(mainCourse),
      };
    });
  };

  const handleSaveDraft = () => {
    saveDraft(issue);
    showToast("Draft saved locally");
  };

  const handlePublish = () => {
    const error = validateEditableIssue(issue);
    if (error) {
      showToast(error);
      return;
    }
    publishIssue(issue);
    notifyIssuesUpdated();
    showToast("Published (simulated — live in this browser)");
  };

  const handleEmailAndPublish = () => {
    const error = validateEditableIssue(issue);
    if (error) {
      showToast(error);
      return;
    }
    const result = simulateEmailSend(issue);
    publishIssue(issue);
    notifyIssuesUpdated();
    setEmailPreview(result);
    showToast(`Email simulated to ${result.recipients.length} recipients`);
  };

  const loadTemplate = () => {
    const latest = getLatestRepoIssue();
    if (latest) {
      setIssue(cloneIssue(latest));
      showToast("Loaded latest repo issue as template");
    }
  };

  return (
    <div className="editor-page">
      <div className="editor-toolbar no-print">
        <div>
          <h1>Newsletter Editor</h1>
          <p>Update this week&apos;s menu, then publish or email leadership.</p>
        </div>
        <div className="editor-toolbar__actions">
          <button type="button" className="btn btn-ghost" onClick={loadTemplate}>
            Load template
          </button>
          <button type="button" className="btn btn-secondary" onClick={handleSaveDraft}>
            Save draft
          </button>
          <button type="button" className="btn btn-secondary" onClick={handlePublish}>
            Publish
          </button>
          <button type="button" className="btn btn-primary" onClick={handleEmailAndPublish}>
            Email &amp; publish
          </button>
        </div>
      </div>

      {validationError ? (
        <p className="editor-validation" role="alert">
          {validationError}
        </p>
      ) : (
        <p className="editor-validation editor-validation--ok">Ready to publish</p>
      )}

      <div className="editor-layout">
        <section className="editor-form" aria-label="Newsletter editor form">
          <h2>Issue details</h2>
          <div className="editor-grid">
            <label>
              Issue ID
              <input
                value={issue.meta.issueId}
                onChange={(event) => updateMeta("issueId", event.target.value)}
              />
              <span className="origin-badge" data-origin="manual">manual</span>
            </label>
            <label>
              Date
              <input
                type="date"
                value={issue.meta.date}
                onChange={(event) => updateMeta("date", event.target.value)}
              />
              <span className="origin-badge" data-origin="leia">leia</span>
            </label>
            <label className="editor-grid__full">
              Sprint range
              <input
                value={issue.meta.sprintRange}
                onChange={(event) => updateMeta("sprintRange", event.target.value)}
              />
              <span className="origin-badge" data-origin="leia">leia</span>
            </label>
            <label className="editor-grid__full">
              Theme
              <input
                value={issue.meta.theme}
                onChange={(event) => updateMeta("theme", event.target.value)}
              />
              <span className="origin-badge" data-origin="manual">manual</span>
            </label>
            <label className="editor-grid__full">
              Tagline
              <input
                value={issue.meta.tagline}
                onChange={(event) => updateMeta("tagline", event.target.value)}
              />
              <span className="origin-badge" data-origin="manual">manual</span>
            </label>
          </div>

          {(["rose", "bud", "thorn"] as const).map((section) => (
            <div key={section} className="editor-section">
              <h3>To Begin — {section}</h3>
              {issue.toBegin[section].items.map((item, index) => (
                <label key={`${section}-${index}`}>
                  Bullet {index + 1}
                  <textarea
                    rows={2}
                    value={item}
                    onChange={(event) =>
                      updateToBeginItem(section, index, event.target.value)
                    }
                  />
                  <span className="origin-badge" data-origin="leia">leia</span>
                </label>
              ))}
            </div>
          ))}

          <div className="editor-section">
            <h3>Main Course (8 priorities)</h3>
            {issue.mainCourse.map((card, index) => (
              <details key={card.n} className="editor-card-panel" open={index === 0}>
                <summary>
                  {card.n}. {card.name || "Untitled priority"}
                </summary>
                <div className="editor-grid">
                  <label>
                    Name
                    <input
                      value={card.name}
                      onChange={(event) => updateCard(index, "name", event.target.value)}
                    />
                  </label>
                  <label>
                    Status
                    <select
                      value={card.status}
                      onChange={(event) =>
                        updateCard(index, "status", event.target.value)
                      }
                    >
                      <option value="on-track">On Track</option>
                      <option value="at-risk">At Risk</option>
                    </select>
                  </label>
                  <label className="editor-grid__full">
                    Progress
                    <textarea
                      rows={2}
                      value={card.progress}
                      onChange={(event) => updateCard(index, "progress", event.target.value)}
                    />
                    <span className="origin-badge" data-origin="leia">leia</span>
                  </label>
                  <label className="editor-grid__full">
                    Impact
                    <textarea
                      rows={2}
                      value={card.impact}
                      onChange={(event) => updateCard(index, "impact", event.target.value)}
                    />
                    <span className="origin-badge" data-origin="ai">ai</span>
                  </label>
                  <label className="editor-grid__full">
                    Blockers
                    <textarea
                      rows={2}
                      value={card.blockers}
                      onChange={(event) => updateCard(index, "blockers", event.target.value)}
                    />
                    <span className="origin-badge" data-origin="leia">leia</span>
                  </label>
                  <label className="editor-grid__full">
                    Next
                    <textarea
                      rows={2}
                      value={card.next}
                      onChange={(event) => updateCard(index, "next", event.target.value)}
                    />
                    <span className="origin-badge" data-origin="leia">leia</span>
                  </label>
                </div>
              </details>
            ))}
          </div>
        </section>

        <section className="editor-preview" aria-label="Live preview">
          <h2 className="sr-only">Preview</h2>
          <MenuLayout issue={issue} />
        </section>
      </div>

      {emailPreview ? (
        <aside className="email-simulation no-print" aria-live="polite">
          <h3>Email simulation</h3>
          <p>
            <strong>Subject:</strong> {emailPreview.subject}
          </p>
          <p>
            <strong>Sent at:</strong>{" "}
            {new Date(emailPreview.sentAt).toLocaleString()}
          </p>
          <p>
            <strong>Recipients:</strong> {emailPreview.recipients.join(", ")}
          </p>
          <p className="email-simulation__note">
            Simulated only. Production will send via your backend distribution
            list: {DISTRIBUTION_LIST.join(", ")}.
          </p>
        </aside>
      ) : null}

      {toast ? (
        <div className="toast" role="status">
          {toast}
        </div>
      ) : null}
    </div>
  );
}
