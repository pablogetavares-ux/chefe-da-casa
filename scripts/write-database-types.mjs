import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { DATABASE_TYPE_EXPORTS } from "./database-type-exports.mjs";

const arg = process.argv[2];
if (!arg) {
  console.error("Usage: node write-database-types.mjs <types-file-or-inline>");
  process.exit(1);
}

const types =
  arg.endsWith(".ts") || arg.endsWith(".txt") ? readFileSync(arg, "utf8") : arg;

const cleaned = types.replace(/^[\s\S]*?(export type Json)/, "$1").trimEnd();

writeFileSync(
  resolve("src/types/database.ts"),
  cleaned + DATABASE_TYPE_EXPORTS,
);
console.log("✓ database.ts updated");
