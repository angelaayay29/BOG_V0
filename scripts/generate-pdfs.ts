import { mkdir } from "node:fs/promises";
import { readdir, readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { chromium } from "playwright";

const distDir = resolve(process.cwd(), "dist");
const pdfDir = resolve(distDir, "issues");
const contentDir = resolve(process.cwd(), "content/issues");
const previewPort = 4173;
const rawBasePath = process.env.BASE_PATH ?? "/";

function normalizeBasePath(base: string): string {
  if (base === "/") return "/";
  const withLeading = base.startsWith("/") ? base : `/${base}`;
  return withLeading.endsWith("/") ? withLeading : `${withLeading}/`;
}

const basePath = normalizeBasePath(rawBasePath);
const origin = `http://127.0.0.1:${previewPort}`;

function printPageUrl(issueId: string): string {
  return `${origin}${basePath}print/${issueId}.html`;
}

async function getIssueIds(): Promise<string[]> {
  const files = (await readdir(contentDir)).filter((file) =>
    file.endsWith(".json"),
  );
  return files.map((file) => file.replace(/\.json$/, ""));
}

async function main() {
  await mkdir(pdfDir, { recursive: true });

  const issueIds = await getIssueIds();
  const browser = await chromium.launch();
  const page = await browser.newPage();

  for (const issueId of issueIds) {
    await readFile(join(contentDir, `${issueId}.json`), "utf8");

    const url = printPageUrl(issueId);
    await page.goto(url, { waitUntil: "networkidle", timeout: 60_000 });
    await page.locator("#menu-content").waitFor({
      state: "visible",
      timeout: 60_000,
    });
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
