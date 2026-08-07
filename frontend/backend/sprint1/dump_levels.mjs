// dump_levels.mjs — loads levels.js as a real ES module and dumps it as
// JSON. This is far more robust than regex-parsing the source text, since
// it uses the actual JS engine to interpret the file — template literals,
// nested objects, escaped strings, formatting changes, none of it matters.
//
// Usage: node dump_levels.mjs <path-to-levels.js>

import { pathToFileURL } from "url";
import path from "path";

const filePath = process.argv[2];
if (!filePath) {
  console.error("Usage: node dump_levels.mjs <path-to-levels.js>");
  process.exit(1);
}

const absPath = path.resolve(filePath);
const moduleUrl = pathToFileURL(absPath).href;

try {
  const mod = await import(moduleUrl);
  if (!mod.levels) {
    console.error("ERROR: file does not export `levels`");
    process.exit(1);
  }
  process.stdout.write(JSON.stringify(mod.levels));
} catch (err) {
  console.error("ERROR loading levels.js:", err.message);
  process.exit(1);
}
