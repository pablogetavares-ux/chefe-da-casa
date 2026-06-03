/**
 * Smoke — planejamento semanal.
 * Uso: npm run test:weekly-plan
 */
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

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

function createCookieStore() {
  const jar = new Map();
  return {
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

async function fetchJson(path, options = {}, cookieHeader = "") {
  const headers = { ...options.headers };
  if (cookieHeader) headers.Cookie = cookieHeader;
  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  const body = await res.json().catch(() => null);
  return { res, body };
}

async function ensureTestUser(email, password) {
  if (!SERVICE_KEY) return;
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
    return;
  }
  await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: "Weekly Plan Smoke" },
  });
}

async function main() {
  console.log("\n→ Smoke: Plano semanal\n");

  const anon = await fetchJson("/api/weekly-plan?goal=saude");
  if (anon.res.status === 401) ok("auth guard");
  else fail("auth guard", String(anon.res.status));

  const store = createCookieStore();
  const supabase = createServerClient(SUPABASE_URL, ANON_KEY, {
    cookies: store.adapter,
  });
  const email = process.env.SMOKE_TEST_EMAIL ?? "chef.weekly.smoke@example.com";
  const password = process.env.SMOKE_TEST_PASSWORD ?? "SmokeTest123!";

  await ensureTestUser(email, password);
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (signInError) {
    fail("login", signInError.message);
    process.exit(1);
  }
  ok("login");

  const cookies = store.header();

  for (const goal of ["economizar", "saude", "proteina"]) {
    const { res, body } = await fetchJson(
      `/api/v1/weekly-plan?goal=${goal}`,
      {},
      cookies,
    );
    const days = body?.data?.days?.length ?? 0;
    const items = body?.data?.shoppingList?.items?.length ?? 0;
    const total = body?.data?.weeklyCost?.totalCheapest;
    if (res.ok && days === 7 && items > 0) {
      ok(`GET goal=${goal}`, `7 dias, ${items} itens, R$ ${total ?? "?"}`);
    } else {
      fail(`GET goal=${goal}`, body?.error ?? `days=${days}`);
    }
  }

  const { res: postRes, body: postBody } = await fetchJson(
    "/api/weekly-plan",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ goal: "economizar", excludePantry: true }),
    },
    cookies,
  );
  if (postRes.ok && postBody?.data?.cheapestMarket?.marketName) {
    ok(
      "POST + mercado",
      `${postBody.data.cheapestMarket.marketName} — R$ ${postBody.data.weeklyCost.totalCheapest}`,
    );
  } else if (postRes.ok) {
    ok("POST plano", "sem mercado no catálogo (ok em dev)");
  } else {
    fail("POST", postBody?.error ?? String(postRes.status));
  }

  console.log(`\n${passed} ok, ${failed} falha(s)\n`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
