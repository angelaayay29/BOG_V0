import type { NewsletterIssue } from "../types/issue";
import { DessertSection } from "./DessertSection";
import { MainCourseGrid } from "./MainCourseGrid";
import { MenuMasthead } from "./MenuMasthead";
import { ToBeginGrid } from "./ToBeginGrid";

interface MenuLayoutProps {
  issue: NewsletterIssue;
}

export function MenuLayout({ issue }: MenuLayoutProps) {
  return (
    <main className="menu-page" id="menu-content">
      <MenuMasthead meta={issue.meta} />
      <ToBeginGrid toBegin={issue.toBegin} />
      <MainCourseGrid cards={issue.mainCourse} />
      <DessertSection
        leiaLinks={issue.dessert.leiaLinks}
        manualLinks={issue.dessert.manualLinks}
      />
      <footer className="menu-footer">
        <p className="menu-tagline">{issue.meta.tagline}</p>
      </footer>
    </main>
  );
}
