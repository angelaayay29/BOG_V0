import { copyFile } from "node:fs/promises";
import { resolve } from "node:path";

const distDir = resolve(process.cwd(), "dist");

async function main() {
  await copyFile(resolve(distDir, "index.html"), resolve(distDir, "404.html"));
  console.log("Created 404.html for GitHub Pages SPA routing.");
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
