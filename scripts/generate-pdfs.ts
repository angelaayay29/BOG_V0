import { mkdir } from "node:fs/promises";
import { readdir, readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { chromium, type Page } from "playwright";

const distDir = resolve(process.cwd(), "dist");
const pdfDir = resolve(distDir, "issues");
const contentDir = resolve(process.cwd(), "content/issues");
const previewPort = 4173;
const rawBasePath = process.env.BASE_PATH ?? "/";
const SESSION_KEY = "bog360-auth-session";
const SESSION = { role: "editor", email: "editor@guest360.local" };

function normalizeBasePath(base: string): string {
  if (base === "/") return "/";
  const withLeading = base.startsWith("/") ? base : `/${base}`;
  return withLeading.endsWith("/") ? withLeading : `${withLeading}/`;
}

const basePath = normalizeBasePath(rawBasePath);
const origin = `http://127.0.0.1:${previewPort}`;

function appUrl(path = ""): string {
  if (basePath === "/") {
    return `${origin}/${path}`.replace(/([^:]\/)\/+/g, "$1");
  }
  return `${origin}${basePath}${path}`.replace(/([^:]\/)\/+/g, "$1");
}

async function getIssueIds(): Promise<string[]> {
  const files = (await readdir(contentDir)).filter((file) =>
    file.endsWith(".json"),
  );
  return files.map((file) => file.replace(/\.json$/, ""));
}

async function injectSession(page: Page): Promise<void> {
  await page.evaluate(
    ({ key, session }) => {
      sessionStorage.setItem(key, JSON.stringify(session));
    },
    { key: SESSION_KEY, session: SESSION },
  );
}

async function openIssuePage(page: Page, issueId: string): Promise<void> {
  const directUrl = appUrl(`issues/${issueId}`);

  await page.goto(directUrl, { waitUntil: "networkidle", timeout: 60_000 });

  const menu = page.locator("#menu-content");
  if (await menu.isVisible().catch(() => false)) {
    return;
  }

  // SPA fallback: load app root, inject auth, client-navigate to the issue.
  await page.goto(appUrl(), { waitUntil: "networkidle", timeout: 60_000 });
  await injectSession(page);
  await page.reload({ waitUntil: "networkidle", timeout: 60_000 });

  const issuePath =
    basePath === "/"
      ? `/issues/${issueId}`
      : `${basePath.replace(/\/$/, "")}/issues/${issueId}`;

  await page.evaluate((path) => {
    window.history.pushState({}, "", path);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }, issuePath);

  await menu.waitFor({ state: "visible", timeout: 60_000 });
}

async function main() {
  await mkdir(pdfDir, { recursive: true });

  const issueIds = await getIssueIds();
  const browser = await chromium.launch();
  const page = await browser.newPage();

  for (const issueId of issueIds) {
    await readFile(join(contentDir, `${issueId}.json`), "utf8");
    await openIssuePage(page, issueId);
    await page.emulateMedia({ media: "print" });

    const outputPath = resolve(pdfDir, `${issueId}.pdf`);
    await page.pdf({
      path: outputPath,
      format: "A4",
      printBackground: true,
      margin: {
        top: "0.35in",
        right: "0.4in",
        bottom: "0.35in",
        left: "0.4in",
      },
    });

    console.log(`✓ ${issueId}.pdf`);
  }

  await browser.close();
  console.log(`Generated ${issueIds.length} PDF(s) in dist/issues/`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
