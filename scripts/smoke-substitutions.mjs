/**
 * Smoke test — substituições inteligentes.
 * Uso: npm run test:substitutions
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
  const { error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: "Substitutions Smoke" },
  });
  if (error) throw new Error(error.message);
}

async function main() {
  console.log("\n→ Smoke: Substituições inteligentes\n");
  console.log(
    "  (401 no início = teste sem login; no app logado não deve repetir)\n",
  );
  console.log(`Base: ${BASE}\n`);

  if (!SUPABASE_URL || !ANON_KEY) {
    console.error("Configure NEXT_PUBLIC_SUPABASE_URL e ANON_KEY no .env");
    process.exit(1);
  }

  console.log("→ Auth guard");
  for (const path of ["/api/substitutions", "/api/v1/substitutions"]) {
    const { res } = await fetchJson(path);
    if (res.status === 401) ok(`${path} → 401`);
    else fail(`${path} → 401 esperado`, String(res.status));
  }

  const testEmail =
    process.env.SMOKE_TEST_EMAIL ?? "chef.substitutions.smoke@example.com";
  const testPassword = process.env.SMOKE_TEST_PASSWORD ?? "SmokeTest123!";

  const store = createCookieStore();
  const supabase = createServerClient(SUPABASE_URL, ANON_KEY, {
    cookies: store.adapter,
  });

  try {
    await ensureTestUser(testEmail, testPassword);
  } catch (e) {
    fail("setup usuário", e instanceof Error ? e.message : String(e));
    process.exit(1);
  }

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: testEmail,
    password: testPassword,
  });
  if (signInError) {
    fail("login", signInError.message);
    process.exit(1);
  }
  ok("login", testEmail);

  const cookies = store.header();

  console.log("\n→ Catálogo");
  const { res: catRes, body: catBody } = await fetchJson(
    "/api/v1/substitutions?catalogOnly=true",
    {},
    cookies,
  );
  const catalogLen = catBody?.data?.catalog?.length ?? 0;
  if (catRes.ok && catalogLen > 0) {
    ok("GET catalogOnly", `${catalogLen} regra(s)`);
  } else {
    fail("GET catalogOnly", catBody?.error ?? `count=${catalogLen}`);
  }

  console.log("\n→ Sugestões por ingredientes");
  const { res: postRes, body: postBody } = await fetchJson(
    "/api/substitutions",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ingredients: [
          { name: "arroz branco", quantity: 2, unit: "xicara" },
          { name: "peito de frango", quantity: 500, unit: "g" },
        ],
        applySubstitutions: true,
      }),
    },
    cookies,
  );
  const sugLen = postBody?.data?.suggestions?.length ?? 0;
  if (postRes.ok && sugLen > 0) {
    ok("POST /api/substitutions", `${sugLen} sugestão(ões)`);
    const first = postBody.data.suggestions[0];
    if (first?.reason) ok("sugestão com reason", first.substituteName);
  } else {
    fail("POST substituições", postBody?.error ?? `count=${sugLen}`);
  }

  if (postBody?.data?.recipeCostWithSubstitutions?.summary) {
    ok("recipeCostWithSubstitutions presente");
  } else if (postRes.ok) {
    ok("recipeCost base", "sem otimização (ok se catálogo vazio)");
  }

  console.log(`\n${passed} ok, ${failed} falha(s)\n`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
