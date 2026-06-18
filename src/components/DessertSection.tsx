import { Link } from "react-router-dom";
import type { IssueLink } from "../types/issue";

interface DessertSectionProps {
  leiaLinks: IssueLink[];
  manualLinks: IssueLink[];
}

function DessertLink({ link, showUrl = false }: { link: IssueLink; showUrl?: boolean }) {
  if (!link.url) {
    return (
      <span className="dessert-link dessert-link--placeholder">
        {link.label} — [Insert link]
      </span>
    );
  }

  const isInternal = link.url.startsWith("/");
  const displayUrl = link.url.replace(/^https?:\/\//, "");

  if (isInternal) {
    return (
      <Link className="dessert-link" to={link.url}>
        {link.label}
      </Link>
    );
  }

  return (
    <a className="dessert-link" href={link.url} target="_blank" rel="noreferrer">
      <span className="dessert-link__label">{link.label}</span>
      {showUrl ? <span className="dessert-link__url">{displayUrl}</span> : null}
    </a>
  );
}

export function DessertSection({ leiaLinks, manualLinks }: DessertSectionProps) {
  const columns = leiaLinks.map((leiaLink, index) => ({
    leia: leiaLink,
    manual: manualLinks[index],
  }));

  return (
    <section className="menu-section" aria-labelledby="dessert-heading">
      <div className="menu-section-heading">
        <h2 id="dessert-heading" className="menu-section-title">
          Dessert
        </h2>
        <p className="menu-section-subtitle">
          Where can you go for more detail?
        </p>
      </div>
      <div className="dessert-grid">
        {columns.map(({ leia, manual }) => (
          <div key={leia.label} className="dessert-column">
            <DessertLink link={leia} showUrl />
            {manual ? <DessertLink link={manual} /> : null}
          </div>
        ))}
      </div>
    </section>
  );
}
