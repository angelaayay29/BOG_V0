import { Link } from "react-router-dom";
import { getDraft } from "../utils/publishedIssues";

export function EditorHomePanel() {
  const draft = getDraft();

  return (
    <aside className="editor-home-panel" aria-labelledby="editor-home-heading">
      <h2 id="editor-home-heading">Publishing workspace</h2>
      <p>Compose, preview, and distribute the weekly executive menu.</p>

      <ol className="editor-workflow">
        <li>Edit content in the menu template</li>
        <li>Publish to the archive</li>
        <li>Email leadership (simulated)</li>
      </ol>

      <div className="editor-home-panel__actions">
        <Link className="btn btn-primary" to="/editor">
          {draft ? "Continue draft" : "Start this week's menu"}
        </Link>
          <Link className="btn btn-secondary" to="/editor">
            Publish from editor
          </Link>
      </div>

      {draft ? (
        <p className="editor-home-panel__draft">
          Draft in progress: <strong>{draft.meta.sprintRange}</strong>
        </p>
      ) : null}
    </aside>
  );
}
