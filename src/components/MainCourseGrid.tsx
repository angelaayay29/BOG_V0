import type { IssueStatus, MainCourseCard } from "../types/issue";

function StatusBadge({ status }: { status: IssueStatus }) {
  const label = status === "on-track" ? "On Track" : "At Risk";
  return (
    <span className={`status-badge status-badge--${status}`}>{label}</span>
  );
}

function PriorityField({ label, value }: { label: string; value: string }) {
  return (
    <div className="priority-card__field">
      <span className="priority-card__label">{label}</span>
      <p className="priority-card__value">{value}</p>
    </div>
  );
}

function PriorityCard({ card }: { card: MainCourseCard }) {
  return (
    <article className="priority-card" aria-label={`${card.name} priority update`}>
      <div className="priority-card__header">
        <div className="priority-card__title-row">
          <span className="priority-card__number" aria-hidden="true">
            {card.n}
          </span>
          <h3 className="priority-card__name">{card.name}</h3>
        </div>
        <StatusBadge status={card.status} />
      </div>
      <PriorityField label="Progress" value={card.progress} />
      <PriorityField label="Impact" value={card.impact} />
      <PriorityField label="Blockers" value={card.blockers} />
      <PriorityField label="Next" value={card.next} />
    </article>
  );
}

interface MainCourseGridProps {
  cards: MainCourseCard[];
}

export function MainCourseGrid({ cards }: MainCourseGridProps) {
  return (
    <section className="menu-section" aria-labelledby="main-course-heading">
      <div className="menu-section-heading">
        <h2 id="main-course-heading" className="menu-section-title">
          The Main Course
        </h2>
        <p className="menu-section-subtitle">
          How are we delivering on our Q4 priorities?
        </p>
      </div>
      <div className="main-course-grid">
        {cards.map((card) => (
          <PriorityCard key={card.n} card={card} />
        ))}
      </div>
    </section>
  );
}
