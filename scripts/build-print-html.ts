import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { MenuLayout } from "../src/components/MenuLayout";
import { validateIssue } from "../src/utils/validateIssue";

const contentDir = resolve(process.cwd(), "content/issues");
const printDir = resolve(process.cwd(), "dist/print");
const assetsDir = resolve(process.cwd(), "dist/assets");

function normalizeBasePath(base: string): string {
  if (base === "/") return "/";
  const withLeading = base.startsWith("/") ? base : `/${base}`;
  return withLeading.endsWith("/") ? withLeading : `${withLeading}/`;
}

async function findCssPath(basePath: string): Promise<string> {
  const files = await readdir(assetsDir);
  const cssFile = files.find((file) => file.endsWith(".css"));
  if (!cssFile) {
    throw new Error("No CSS bundle found in dist/assets — run vite build first.");
  }
  return `${basePath}assets/${cssFile}`;
}

function buildDocument(body: string, cssPath: string, title: string): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&display=swap"
      rel="stylesheet"
    />
    <link rel="stylesheet" href="${cssPath}" />
  </head>
  <body>${body}</body>
</html>`;
}

async function main() {
  const basePath = normalizeBasePath(process.env.BASE_PATH ?? "/");
  const cssPath = await findCssPath(basePath);
  await mkdir(printDir, { recursive: true });

  const files = (await readdir(contentDir)).filter((file) =>
    file.endsWith(".json"),
  );

  for (const file of files) {
    const filePath = resolve(contentDir, file);
    const raw = JSON.parse(await readFile(filePath, "utf8")) as unknown;
    const issue = validateIssue(raw, filePath);

    const body = renderToStaticMarkup(
      createElement(
        MemoryRouter,
        null,
        createElement(MenuLayout, { issue }),
      ),
    );

    const html = buildDocument(body, cssPath, issue.meta.title);
    const outputPath = resolve(printDir, `${issue.meta.issueId}.html`);
    await writeFile(outputPath, html, "utf8");
    console.log(`✓ dist/print/${issue.meta.issueId}.html`);
  }

  console.log(`Built ${files.length} print page(s).`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
