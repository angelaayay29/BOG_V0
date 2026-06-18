import { mkdir } from "node:fs/promises";
import { readdir, readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { chromium, type Page } from "playwright";

const distDir = resolve(process.cwd(), "dist");
const pdfDir = resolve(distDir, "issues");
const contentDir = resolve(process.cwd(), "content/issues");
const previewPort = 4173;
const basePath = process.env.BASE_PATH ?? "/";

async function getIssueIds(): Promise<string[]> {
  const files = (await readdir(contentDir)).filter((file) =>
    file.endsWith(".json"),
  );
  return files.map((file) => file.replace(/\.json$/, ""));
}

async function loginForBuild(page: Page): Promise<void> {
  const loginUrl = `http://127.0.0.1:${previewPort}${basePath}login`;
  await page.goto(loginUrl, { waitUntil: "networkidle" });
  await page.getByLabel("Email").fill("editor@guest360.local");
  await page.getByLabel("Password").fill("guest360-edit");
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL((url) => !url.pathname.endsWith("/login"));
}

async function main() {
  await mkdir(pdfDir, { recursive: true });

  const issueIds = await getIssueIds();
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await loginForBuild(page);

  for (const issueId of issueIds) {
    await readFile(join(contentDir, `${issueId}.json`), "utf8");

    const url = `http://127.0.0.1:${previewPort}${basePath}issues/${issueId}`;
    await page.goto(url, { waitUntil: "networkidle" });
    await page.emulateMedia({ media: "print" });

    const outputPath = resolve(pdfDir, `${issueId}.pdf`);
    await page.pdf({
      path: outputPath,
      format: "A4",
      printBackground: true,
      margin: { top: "0.35in", right: "0.4in", bottom: "0.35in", left: "0.4in" },
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
