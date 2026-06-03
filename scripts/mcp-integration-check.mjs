/**
 * Verifica integração frontend ↔ backend ↔ Supabase (pós-MCP).
 * Uso: npm run integration:mcp
 */
import "dotenv/config";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const PROJECT_ID = "mnevlegpkrncxlqkqdnl";

const REQUIRED_TABLES = [
  "regional_offers",
  "regional_stores",
  "offer_favorites",
  "profiles",
  "recipes",
  "pantry_items",
  "shopping_lists",
  "shopping_list_items",
  "mobile_subscriptions",
  "revenuecat_webhook_events",
  "products",
  "market_prices",
];

const REQUIRED_API_ROUTES = [
  "src/app/api/v1/offers/route.ts",
  "src/app/api/v1/offers/for-recipe/route.ts",
  "src/app/api/v1/offers/add-to-shopping/route.ts",
  "src/app/api/v1/home/route.ts",
  "src/app/api/v1/pricing/compare/route.ts",
  "src/app/api/v1/shopping-list/route.ts",
  "src/app/api/v1/shopping-list/lists/route.ts",
  "src/app/api/v1/billing/mobile/status/route.ts",
  "src/app/api/v1/billing/mobile/sync/route.ts",
  "src/app/api/webhooks/revenuecat/route.ts",
  "src/app/api/v1/products/route.ts",
  "src/app/api/v1/products/compare/route.ts",
  "src/app/api/v1/products/[id]/route.ts",
  "src/app/api/v1/products/[id]/prices/route.ts",
  "src/app/api/v1/market-prices/[id]/route.ts",
  "src/lib/api/client.ts",
];

let passed = 0;
let failed = 0;

function ok(name, detail = "") {
  console.log(`  ✓ ${name}${detail ? ` — ${detail}` : ""}`);
  passed++;
}

function fail(name, detail = "") {
  console.log(`  ✗ ${name}${detail ? ` — ${detail}` : ""}`);
  failed++;
}

async function main() {
  console.log(`\n→ Integração MCP + app (${PROJECT_ID})\n`);

  // 1. Tipos locais alinhados ao schema remoto
  console.log("→ Tipos TypeScript (src/types/database.ts)");
  const typesPath = resolve("src/types/database.ts");
  let typesSource = "";
  try {
    typesSource = readFileSync(typesPath, "utf8");
  } catch {
    fail("database.ts existe");
    process.exit(1);
  }
  ok("database.ts existe");

  for (const table of REQUIRED_TABLES) {
    if (typesSource.includes(`${table}:`)) ok(`tabela ${table}`);
    else fail(`tabela ${table} nos tipos`);
  }

  if (typesSource.includes("OfferCategory")) ok("enum OfferCategory");
  else fail("enum OfferCategory nos tipos");

  // 2. Migrations locais (offers + smart shopping)
  console.log("\n→ Migrations locais (supabase/migrations)");
  const migrations = readFileSync(
    resolve("supabase/migrations/20260526133000_regional_offers_module.sql"),
    "utf8",
  );
  if (migrations.includes("regional_offers")) ok("regional_offers_module.sql");
  else fail("regional_offers_module.sql");

  const audit = readFileSync(
    resolve("supabase/migrations/20260526170000_audit_integration_fixes.sql"),
    "utf8",
  );
  if (audit.includes("offer_favorites_offer_id_idx"))
    ok("audit_integration_fixes.sql");
  else fail("audit_integration_fixes.sql");

  try {
    const smartShopping = readFileSync(
      resolve("supabase/migrations/20260526180000_smart_shopping_list.sql"),
      "utf8",
    );
    if (smartShopping.includes("shopping_list_items"))
      ok("smart_shopping_list.sql");
    else fail("smart_shopping_list.sql");
  } catch {
    fail("smart_shopping_list.sql");
  }

  // 3. Rotas API existem no filesystem
  console.log("\n→ Rotas API (filesystem)");
  for (const route of REQUIRED_API_ROUTES) {
    try {
      readFileSync(resolve(route), "utf8");
      ok(route);
    } catch {
      fail(route);
    }
  }

  // 4. Query keys centralizadas
  console.log("\n→ React Query (query-keys.ts)");
  const queryKeys = readFileSync(
    resolve("src/shared/hooks/api/query-keys.ts"),
    "utf8",
  );
  for (const symbol of [
    "homeFeedQueryKey",
    "SHOPPING_INVALIDATION",
    "pricingCompareQueryKey",
  ]) {
    if (queryKeys.includes(symbol)) ok(symbol);
    else fail(symbol);
  }

  // 5. Health + auth guard (servidor deve estar rodando)
  console.log(`\n→ HTTP (${BASE})`);
  try {
    const health = await fetch(`${BASE}/api/health`);
    if (health.ok) {
      const body = await health.json();
      ok("/api/health", body?.status ?? "ok");
      if (body?.checks?.supabase === "ok") ok("health: supabase");
      else fail("health: supabase", String(body?.checks?.supabase));
    } else {
      fail("/api/health", String(health.status));
    }
  } catch (error) {
    fail(
      "/api/health",
      `servidor offline? ${error instanceof Error ? error.message : error}`,
    );
  }

  for (const path of [
    "/api/v1/profile",
    "/api/v1/offers",
    "/api/v1/home",
    "/api/v1/pricing/compare",
    "/api/v1/products",
    "/api/v1/products/compare",
  ]) {
    try {
      const res = await fetch(`${BASE}${path}`);
      if (res.status === 401) ok(`${path} → 401 sem sessão`);
      else fail(`${path} → 401 esperado`, String(res.status));
    } catch (error) {
      fail(path, error instanceof Error ? error.message : String(error));
    }
  }

  // 6. Client API wired
  console.log("\n→ Client API (domínios)");
  const client = readFileSync(resolve("src/lib/api/client.ts"), "utf8");
  for (const domain of ["offers", "home", "pricing", "shoppingList"]) {
    if (client.includes(`${domain}: {`)) ok(`api.${domain}`);
    else fail(`api.${domain}`);
  }
  for (const method of ["list", "forRecipe", "addToShopping", "addFavorite"]) {
    if (client.includes(`${method}:`)) ok(`api.offers.${method}`);
    else fail(`api.offers.${method}`);
  }
  if (client.includes("feed:")) ok("api.home.feed");
  else fail("api.home.feed");
  if (client.includes("compareBasket")) ok("api.pricing.compareBasket");
  else fail("api.pricing.compareBasket");
  if (client.includes("getLists")) ok("api.shoppingList.getLists");
  else fail("api.shoppingList.getLists");

  console.log(`\n${passed} ok, ${failed} falha(s)\n`);
  process.exit(failed > 0 ? 1 : 0);
}

main();
