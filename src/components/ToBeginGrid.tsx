import type { ToBeginSection } from "../types/issue";

interface ToBeginCardProps {
  name: "Rose" | "Bud" | "Thorn";
  variant: "rose" | "bud" | "thorn";
  section: ToBeginSection;
}

export function ToBeginCard({ name, variant, section }: ToBeginCardProps) {
  return (
    <article className="to-begin-card">
      <div className={`to-begin-card__header to-begin-card__header--${variant}`}>
        <p className="to-begin-card__name">{name}</p>
        <p className="to-begin-card__label">{section.label}</p>
      </div>
      <ul className="to-begin-card__body">
        {section.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </article>
  );
}

interface ToBeginSectionProps {
  toBegin: {
    rose: ToBeginSection;
    bud: ToBeginSection;
    thorn: ToBeginSection;
  };
}

export function ToBeginGrid({ toBegin }: ToBeginSectionProps) {
  return (
    <section className="menu-section" aria-labelledby="to-begin-heading">
      <div className="menu-section-heading">
        <h2 id="to-begin-heading" className="menu-section-title">
          To Begin
        </h2>
        <p className="menu-section-subtitle">What do you need to know?</p>
      </div>
      <div className="to-begin-grid">
        <ToBeginCard name="Rose" variant="rose" section={toBegin.rose} />
        <ToBeginCard name="Bud" variant="bud" section={toBegin.bud} />
        <ToBeginCard name="Thorn" variant="thorn" section={toBegin.thorn} />
      </div>
    </section>
  );
}
