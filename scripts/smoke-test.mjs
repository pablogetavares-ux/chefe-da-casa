/**
 * Smoke test de integração — simula usuário real via cookies Supabase SSR.
 * Uso: node scripts/smoke-test.mjs
 */
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const results = [];
let passed = 0;
let failed = 0;

function log(status, name, detail = "") {
  const icon = status ? "✓" : "✗";
  const line = `${icon} ${name}${detail ? ` — ${detail}` : ""}`;
  console.log(line);
  results.push({ status, name, detail });
  if (status) passed++;
  else failed++;
}

async function assertOk(condition, name, detail = "") {
  log(condition, name, detail);
  if (!condition) throw new Error(`FAIL: ${name} ${detail}`);
}

/** Cookie jar compatível com @supabase/ssr */
function createCookieStore() {
  const jar = new Map();
  return {
    jar,
    adapter: {
      getAll() {
        return [...jar.entries()].map(([name, value]) => ({ name, value }));
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          if (value) jar.set(name, value);
          else jar.delete(name);
        }
      },
    },
    header() {
      return [...jar.entries()].map(([k, v]) => `${k}=${v}`).join("; ");
    },
  };
}

async function fetchApp(path, options = {}, cookieHeader = "") {
  const headers = { ...options.headers };
  if (cookieHeader) headers.Cookie = cookieHeader;
  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  return res;
}

async function fetchJson(path, options = {}, cookieHeader = "") {
  const res = await fetchApp(path, options, cookieHeader);
  const body = await res.json().catch(() => null);
  return { res, body };
}

/** PNG 1x1 mínimo para teste de upload */
function minimalPngBuffer() {
  return Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
    "base64",
  );
}

async function ensureTestUser(email, password, supabase) {
  if (SERVICE_KEY) {
    const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data: list } = await admin.auth.admin.listUsers({ perPage: 1000 });
    const existing = list?.users?.find((u) => u.email === email);
    if (existing) {
      await admin.auth.admin.updateUserById(existing.id, {
        password,
        email_confirm: true,
      });
      log(true, "setup: usuário de teste atualizado", email);
      return;
    }
    const { error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: "Chef Teste" },
    });
    if (error) throw new Error(`createUser: ${error.message}`);
    log(true, "setup: usuário de teste criado", email);
    return;
  }

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: "Chef Teste Smoke" } },
  });

  if (signUpData.session) {
    log(true, "setup: cadastro com sessão imediata", email);
    return;
  }

  if (signUpError && !signUpError.message.includes("already registered")) {
    log(false, "setup: cadastro", signUpError.message);
  } else {
    log(true, "setup: cadastro (usuário existente ou criado)", email);
  }
}

async function run() {
  console.log("\n=== Chefe da Casa — Smoke Test ===\n");
  console.log(`Base: ${BASE}\n`);

  if (!SUPABASE_URL || !ANON_KEY) {
    console.error("NEXT_PUBLIC_SUPABASE_URL e ANON_KEY são obrigatórios.");
    process.exit(1);
  }

  if (!SERVICE_KEY) {
    console.warn(
      "⚠️  SUPABASE_SERVICE_ROLE_KEY ausente — usando signup normal (modo dev).\n",
    );
  }

  // --- Público ---
  {
    const { res, body } = await fetchJson("/api/health");
    await assertOk(res.ok, "health: status ok", body?.status);
    await assertOk(body?.checks?.app === "ok", "health: app ok");
  }

  for (const path of ["/", "/login", "/signup", "/pricing"]) {
    const res = await fetchApp(path);
    await assertOk(res.ok, `page: GET ${path}`, String(res.status));
  }

  // APIs sem auth → 401
  for (const path of [
    "/api/v1/profile",
    "/api/v1/recipes",
    "/api/v1/favorites",
    "/api/v1/pantry",
    "/api/v1/ai/usage",
    "/api/v1/offers",
  ]) {
    const { res } = await fetchJson(path);
    await assertOk(
      res.status === 401,
      `auth: ${path} → 401`,
      String(res.status),
    );
  }

  // --- Login ---
  const testEmail =
    process.env.SMOKE_TEST_EMAIL ?? `chef.smoke.${Date.now()}@example.com`;
  const testPassword = process.env.SMOKE_TEST_PASSWORD ?? "SmokeTest123!";

  const store = createCookieStore();
  const supabase = createServerClient(SUPABASE_URL, ANON_KEY, {
    cookies: store.adapter,
  });

  await ensureTestUser(testEmail, testPassword, supabase);

  let { error: signInError } = await supabase.auth.signInWithPassword({
    email: testEmail,
    password: testPassword,
  });

  if (signInError) {
    await ensureTestUser(testEmail, testPassword, supabase);
    ({ error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    }));
  }
  await assertOk(!signInError, "auth: login", signInError?.message ?? "ok");

  const cookieHeader = store.header();
  await assertOk(cookieHeader.length > 0, "auth: cookies de sessão gerados");

  // Sessão persistente — segunda requisição com mesmos cookies
  {
    const { res, body } = await fetchJson("/api/v1/profile", {}, cookieHeader);
    await assertOk(
      res.ok && body?.success,
      "session: GET profile",
      body?.data?.id ?? "",
    );
  }

  // --- Dashboard data (APIs paralelas como o app) ---
  {
    const [recipes, pantry, favorites, usage, aiStatus, offers, homeFeed] =
      await Promise.all([
        fetchJson("/api/v1/recipes", {}, cookieHeader),
        fetchJson("/api/v1/pantry", {}, cookieHeader),
        fetchJson("/api/v1/favorites", {}, cookieHeader),
        fetchJson("/api/v1/ai/usage", {}, cookieHeader),
        fetchJson("/api/v1/ai/status", {}, cookieHeader),
        fetchJson("/api/v1/offers?city=S%C3%A3o%20Paulo", {}, cookieHeader),
        fetchJson("/api/v1/home?city=S%C3%A3o%20Paulo", {}, cookieHeader),
      ]);
    await assertOk(recipes.res.ok, "dashboard: recipes");
    await assertOk(
      Array.isArray(recipes.body?.data?.items),
      "dashboard: recipes paginated",
    );
    await assertOk(pantry.res.ok, "dashboard: pantry");
    await assertOk(favorites.res.ok, "dashboard: favorites");
    await assertOk(usage.res.ok, "dashboard: ai usage");
    await assertOk(aiStatus.res.ok, "dashboard: ai status");
    await assertOk(offers.res.ok, "dashboard: offers");
    await assertOk(homeFeed.res.ok, "home: feed API");
    await assertOk(
      homeFeed.body?.data?.stats != null,
      "home: stats no feed",
      String(homeFeed.body?.data?.stats?.recipeCount ?? 0),
    );
    await assertOk(
      Array.isArray(offers.body?.data?.offers),
      "offers: lista retornada",
      String(offers.body?.data?.offers?.length ?? 0),
    );
    await assertOk(
      aiStatus.body?.data?.configured === true,
      "ai: configured (mock ou real)",
      String(aiStatus.body?.data?.mock),
    );
  }

  // --- Pantry CRUD ---
  let pantryId;
  {
    const { res, body } = await fetchJson(
      "/api/v1/pantry",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: `Smoke Test ${Date.now()}` }),
      },
      cookieHeader,
    );
    await assertOk(res.ok, "pantry: create", String(res.status));
    pantryId = body?.data?.id;
  }
  if (pantryId) {
    const { res } = await fetchJson(
      `/api/v1/pantry/${pantryId}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Smoke Test Atualizado" }),
      },
      cookieHeader,
    );
    await assertOk(res.ok, "pantry: update");
  }

  // --- Geração de receita IA (mock) ---
  let recipeId;
  {
    const { res, body } = await fetchJson(
      "/api/v1/ai/generate-recipe",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ingredients: ["tomate", "ovo", "cebola"],
          mode: "STANDARD",
          servings: 2,
        }),
      },
      cookieHeader,
    );
    await assertOk(
      res.ok,
      "ai: generate recipe",
      body?.data?.recipe?.title ?? "",
    );
    recipeId = body?.data?.recipe?.id;
  }

  // --- Favoritos ---
  if (recipeId) {
    const { res } = await fetchJson(
      "/api/v1/favorites",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipeId }),
      },
      cookieHeader,
    );
    await assertOk(res.ok, "favorites: add");

    const { res: res2, body } = await fetchJson(
      "/api/v1/favorites",
      {},
      cookieHeader,
    );
    const ids = body?.data?.recipeIds ?? [];
    await assertOk(
      res2.ok && ids.includes(recipeId),
      "favorites: list contains recipe",
    );

    const { res: res3 } = await fetchJson(
      `/api/v1/favorites?recipeId=${recipeId}`,
      { method: "DELETE" },
      cookieHeader,
    );
    await assertOk(res3.ok, "favorites: remove");
  }

  // --- Upload + scanner (mock vision) ---
  {
    const png = minimalPngBuffer();
    const form = new FormData();
    form.append(
      "file",
      new Blob([png], { type: "image/png" }),
      "smoke-test.png",
    );

    const uploadRes = await fetch(`${BASE}/api/v1/ai/upload-scan`, {
      method: "POST",
      headers: { Cookie: cookieHeader },
      body: form,
    });
    const uploadBody = await uploadRes.json().catch(() => null);
    await assertOk(
      uploadRes.ok,
      "scanner: upload image",
      uploadBody?.data?.storagePath ??
        uploadBody?.error ??
        String(uploadRes.status),
    );

    if (uploadBody?.data?.storagePath) {
      const { res, body } = await fetchJson(
        "/api/v1/ai/scan-ingredients",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            storagePath: uploadBody.data.storagePath,
            addToPantry: false,
          }),
        },
        cookieHeader,
      );
      await assertOk(
        res.ok,
        "scanner: scan ingredients",
        body?.data?.ingredientNames?.join(", ") ?? "",
      );
    }
  }

  // --- Chat IA ---
  {
    const { res, body } = await fetchJson(
      "/api/v1/ai/chat",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: "O que fazer com ovos?" }],
        }),
      },
      cookieHeader,
    );
    await assertOk(
      res.ok,
      "ai: chat",
      body?.data?.message?.content?.slice(0, 40) ?? "",
    );
  }

  // --- Shopping list ---
  {
    const { res: listsRes, body: listsBody } = await fetchJson(
      "/api/v1/shopping-list/lists",
      {},
      cookieHeader,
    );
    await assertOk(listsRes.ok, "shopping: list lists");
    await assertOk(
      Array.isArray(listsBody?.data?.lists),
      "shopping: lists array",
      String(listsBody?.data?.lists?.length ?? 0),
    );

    const { res, body } = await fetchJson(
      "/api/v1/shopping-list/items",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Item smoke test" }),
      },
      cookieHeader,
    );
    await assertOk(res.ok, "shopping: add item");
    const itemId = body?.data?.id;
    if (itemId) {
      const { res: delRes } = await fetchJson(
        `/api/v1/shopping-list/items/${itemId}`,
        { method: "DELETE" },
        cookieHeader,
      );
      await assertOk(delRes.ok, "shopping: delete item");
    }
  }

  // --- Pricing compare (premium gate) ---
  {
    const { res, body } = await fetchJson(
      "/api/v1/pricing/compare?city=S%C3%A3o%20Paulo&mode=basket",
      {},
      cookieHeader,
    );
    if (res.status === 403) {
      log(true, "pricing: compare basket gated (FREE)", body?.error ?? "403");
    } else {
      await assertOk(res.ok, "pricing: compare basket");
      await assertOk(
        Array.isArray(body?.data?.storeRankings),
        "pricing: rankings retornados",
        String(body?.data?.storeRankings?.length ?? 0),
      );
    }
  }

  // --- App pages (SSR) ---
  for (const path of ["/app/compare", "/app/offers", "/app/shopping"]) {
    const res = await fetchApp(path, {}, cookieHeader);
    await assertOk(
      res.status === 200 || res.status === 307,
      `page: GET ${path}`,
      String(res.status),
    );
  }

  // --- Logout (Supabase signOut + cookie clear) ---
  {
    await supabase.auth.signOut();
    const afterLogout = store.header();
    const { res } = await fetchJson("/api/v1/profile", {}, afterLogout);
    await assertOk(
      res.status === 401,
      "auth: logout invalida sessão",
      String(res.status),
    );
  }

  // --- Performance: dashboard page TTFB ---
  {
    const t0 = performance.now();
    const res = await fetchApp("/app");
    const ms = Math.round(performance.now() - t0);
    await assertOk(
      res.status === 200 || res.status === 307,
      "perf: /app responde",
      `${ms}ms`,
    );
    if (ms > 5000) {
      log(false, "perf: /app lento (>5s)", `${ms}ms — investigar cold start`);
      failed++;
      passed--;
    } else {
      log(true, "perf: /app tempo aceitável", `${ms}ms`);
    }
  }

  // --- Relatório ---
  const reportDir = join(__dirname, "..", "test-results");
  mkdirSync(reportDir, { recursive: true });
  writeFileSync(
    join(reportDir, "smoke-report.json"),
    JSON.stringify(
      { passed, failed, results, timestamp: new Date().toISOString() },
      null,
      2,
    ),
  );

  console.log(`\n--- Resultado: ${passed} ok, ${failed} falhas ---\n`);
  process.exit(failed > 0 ? 1 : 0);
}

run().catch((err) => {
  console.error("\nSmoke test abortado:", err.message);
  process.exit(1);
});
