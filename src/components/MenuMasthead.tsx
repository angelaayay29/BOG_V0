import type { IssueMeta } from "../types/issue";
import { formatIssueDate } from "../utils/formatIssueDate";
import { MenuOrnament } from "./MenuOrnament";

interface MenuMastheadProps {
  meta: IssueMeta;
}

export function MenuMasthead({ meta }: MenuMastheadProps) {
  return (
    <header className="menu-masthead">
      <MenuOrnament />
      <h1 className="menu-title">{meta.title}</h1>
      <div className="menu-divider" aria-hidden="true">
        <span className="menu-divider-diamond" />
      </div>
      <p className="menu-subtitle">Be Our Guest · {meta.sprintRange}</p>
      <p className="menu-theme">
        Theme: {meta.theme} · {formatIssueDate(meta.date)}
      </p>
    </header>
  );
}
