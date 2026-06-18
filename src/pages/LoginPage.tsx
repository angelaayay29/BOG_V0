import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { DEMO_CREDENTIALS } from "../config/auth";

export function LoginPage() {
  const { login, loginAsRole, session } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from =
    (location.state as { from?: string } | null)?.from ?? "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (session) {
    navigate(from, { replace: true });
    return null;
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const result = login(email, password);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    navigate(from, { replace: true });
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Be Our Guest360</h1>
        <p className="login-card__subtitle">
          Sign in as an editor or viewer to access the newsletter.
        </p>

        <form className="login-form" onSubmit={handleSubmit}>
          <label>
            Email
            <input
              type="email"
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>
          {error ? <p className="login-form__error">{error}</p> : null}
          <button type="submit" className="btn btn-primary login-form__submit">
            Sign in
          </button>
        </form>

        <div className="login-demo">
          <p className="login-demo__title">Demo access (simulated)</p>
          <div className="login-demo__actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                loginAsRole("editor");
                navigate("/editor", { replace: true });
              }}
            >
              Continue as Editor
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                loginAsRole("viewer");
                navigate("/", { replace: true });
              }}
            >
              Continue as Viewer
            </button>
          </div>
          <ul className="login-demo__creds">
            <li>
              Editor: <code>{DEMO_CREDENTIALS.editor.email}</code> /{" "}
              <code>{DEMO_CREDENTIALS.editor.password}</code>
            </li>
            <li>
              Viewer: <code>{DEMO_CREDENTIALS.viewer.email}</code> /{" "}
              <code>{DEMO_CREDENTIALS.viewer.password}</code>
            </li>
          </ul>
        </div>

        <p className="login-card__note">
          Production will use your company SSO. Email distribution is simulated
          until the backend is connected.
        </p>
      </div>
    </div>
  );
}
