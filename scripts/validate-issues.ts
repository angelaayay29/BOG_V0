import { readdir, readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { validateIssue } from "../src/utils/validateIssue";

const contentDir = resolve(process.cwd(), "content/issues");

async function main() {
  const files = (await readdir(contentDir)).filter((file) =>
    file.endsWith(".json"),
  );

  if (files.length === 0) {
    throw new Error("No issue JSON files found in content/issues/");
  }

  for (const file of files) {
    const filePath = join(contentDir, file);
    const raw = await readFile(filePath, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    validateIssue(parsed, filePath);
    console.log(`✓ ${file}`);
  }

  console.log(`Validated ${files.length} issue(s).`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
