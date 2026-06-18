export type ContentOrigin = "leia" | "ai" | "manual";

export type TaggedValue<T> = T | { value: T; origin: ContentOrigin };

export type IssueStatus = "on-track" | "at-risk";

export interface IssueLink {
  label: string;
  url: string;
}

export interface TaggedIssueLink {
  label: TaggedValue<string>;
  url: TaggedValue<string>;
}

export interface ToBeginSection {
  label: string;
  items: string[];
}

export interface RawToBeginSection {
  label: TaggedValue<string>;
  items: TaggedValue<string>[];
}

export interface MainCourseCard {
  n: number;
  name: string;
  status: IssueStatus;
  progress: string;
  impact: string;
  blockers: string;
  next: string;
}

export interface RawMainCourseCard {
  n: number;
  name: TaggedValue<string>;
  status: TaggedValue<IssueStatus>;
  progress: TaggedValue<string>;
  impact: TaggedValue<string>;
  blockers: TaggedValue<string>;
  next: TaggedValue<string>;
}

export interface IssueMeta {
  issueId: string;
  title: string;
  sprintRange: string;
  theme: string;
  date: string;
  tagline: string;
}

export interface RawIssueMeta {
  issueId: TaggedValue<string>;
  title: TaggedValue<string>;
  sprintRange: TaggedValue<string>;
  theme: TaggedValue<string>;
  date: TaggedValue<string>;
  tagline: TaggedValue<string>;
}

export interface NewsletterIssue {
  meta: IssueMeta;
  toBegin: {
    rose: ToBeginSection;
    bud: ToBeginSection;
    thorn: ToBeginSection;
  };
  mainCourse: MainCourseCard[];
  dessert: {
    leiaLinks: IssueLink[];
    manualLinks: IssueLink[];
  };
}

export interface RawNewsletterIssue {
  meta: RawIssueMeta;
  toBegin: {
    rose: RawToBeginSection;
    bud: RawToBeginSection;
    thorn: RawToBeginSection;
  };
  mainCourse: RawMainCourseCard[];
  dessert: {
    leiaLinks: TaggedIssueLink[];
    manualLinks: TaggedIssueLink[];
  };
}

export interface IssueSummary {
  issueId: string;
  title: string;
  sprintRange: string;
  theme: string;
  date: string;
  source: "repo" | "published";
}

export type UserRole = "editor" | "viewer";

export interface AuthSession {
  role: UserRole;
  email: string;
}
