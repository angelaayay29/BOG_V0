import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { taggedSprint24 } from "./seed-tagged-issue";

const outputPath = resolve(process.cwd(), "content/issues/sprint-24.json");

await writeFile(outputPath, `${JSON.stringify(taggedSprint24, null, 2)}\n`, "utf8");
console.log(`Wrote tagged seed issue to ${outputPath}`);
