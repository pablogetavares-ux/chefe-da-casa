import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { DATABASE_TYPE_EXPORTS } from "./database-type-exports.mjs";

const { types } = JSON.parse(
  readFileSync(resolve("scripts/mcp-types.json"), "utf8"),
);

const cleaned = types.replace(/^[\s\S]*?(export type Json)/, "$1").trimEnd();

writeFileSync(
  resolve("src/types/database.ts"),
  cleaned + DATABASE_TYPE_EXPORTS,
);
console.log("✓ database.ts updated from MCP types (scripts/mcp-types.json)");
