import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export function SiteHeader() {
  const { session, logout, isEditor } = useAuth();
  const location = useLocation();

  if (!session || location.pathname === "/login") {
    return null;
  }

  return (
    <header className="site-header no-print">
      <div className="site-header__inner">
        <Link className="site-header__brand" to="/">
          Be Our Guest360
        </Link>
        <nav className="site-header__nav" aria-label="Primary">
          <Link className="site-header__link" to="/">
            Archive
          </Link>
          {isEditor ? (
            <Link className="site-header__link" to="/editor">
              Editor
            </Link>
          ) : null}
        </nav>
        <div className="site-header__user">
          <span className="site-header__role" data-role={session.role}>
            {session.role}
          </span>
          <span className="site-header__email">{session.email}</span>
          <button type="button" className="btn btn-ghost" onClick={logout}>
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
