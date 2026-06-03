/**
 * Smoke test — módulo Produtos e Preços.
 * Uso: npm run test:products
 * Requer: yarn dev em localhost:3000 + .env com Supabase
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
    user_metadata: { full_name: "Products Smoke" },
  });
  if (error) throw new Error(error.message);
}

async function main() {
  console.log("\n→ Smoke: Produtos e Preços\n");
  console.log(`Base: ${BASE}\n`);

  if (!SUPABASE_URL || !ANON_KEY) {
    console.error("Configure NEXT_PUBLIC_SUPABASE_URL e ANON_KEY no .env");
    process.exit(1);
  }

  // 1. Sem sessão → 401
  console.log("→ Auth guard");
  for (const path of ["/api/v1/products", "/api/v1/products/compare"]) {
    const { res } = await fetchJson(path);
    if (res.status === 401) ok(`${path} → 401`);
    else fail(`${path} → 401 esperado`, String(res.status));
  }

  // 2. Login
  const testEmail =
    process.env.SMOKE_TEST_EMAIL ?? "chef.products.smoke@example.com";
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

  // 3. Listar produtos (seed MCP)
  console.log("\n→ Leitura");
  const { res: listRes, body: listBody } = await fetchJson(
    "/api/v1/products?limit=10",
    {},
    cookies,
  );
  if (listRes.ok && listBody?.success) {
    const count = listBody?.data?.products?.length ?? 0;
    if (count > 0) ok("GET /products", `${count} produto(s)`);
    else fail("GET /products", "lista vazia — rode seed no Supabase");
  } else {
    fail("GET /products", listBody?.error ?? String(listRes.status));
  }

  const productId = listBody?.data?.products?.[0]?.id;
  if (!productId) {
    console.log(`\n${passed} ok, ${failed} falha(s)\n`);
    process.exit(failed > 0 ? 1 : 0);
  }

  const { res: detailRes, body: detailBody } = await fetchJson(
    `/api/v1/products/${productId}`,
    {},
    cookies,
  );
  if (detailRes.ok && detailBody?.data?.product?.name) {
    ok("GET /products/[id]", detailBody.data.product.name);
  } else {
    fail("GET /products/[id]");
  }

  const { res: pricesRes, body: pricesBody } = await fetchJson(
    `/api/v1/products/${productId}/prices`,
    {},
    cookies,
  );
  const priceCount = pricesBody?.data?.prices?.length ?? 0;
  if (pricesRes.ok && priceCount > 0) {
    ok("GET /products/[id]/prices", `${priceCount} preço(s)`);
  } else {
    fail("GET /products/[id]/prices", `count=${priceCount}`);
  }

  // 4. Comparar (premium — aceita 200 ou 403)
  console.log("\n→ Comparação");
  const { res: compareRes, body: compareBody } = await fetchJson(
    "/api/v1/products/compare",
    {},
    cookies,
  );
  if (compareRes.ok && compareBody?.data?.comparisons) {
    ok(
      "GET /products/compare",
      `${compareBody.data.comparisons.length} comparação(ões)`,
    );
  } else if (compareRes.status === 403) {
    ok("GET /products/compare → 403 (plano Free — esperado em dev)");
  } else {
    fail(
      "GET /products/compare",
      compareBody?.error ?? String(compareRes.status),
    );
  }

  // 5. Escrita admin (opcional)
  if (SERVICE_KEY) {
    console.log("\n→ Escrita admin (service role + dev admin)");
    const { res: createRes, body: createBody } = await fetchJson(
      "/api/v1/products",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `Smoke produto ${Date.now()}`,
          category: "OTHER",
          baseUnit: "un",
        }),
      },
      cookies,
    );
    if (createRes.status === 201 && createBody?.data?.product?.id) {
      const newId = createBody.data.product.id;
      ok("POST /products", newId.slice(0, 8));

      const { res: priceRes } = await fetchJson(
        `/api/v1/products/${newId}/prices`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            marketName: "Mercado Smoke Test",
            price: 9.99,
          }),
        },
        cookies,
      );
      if (priceRes.status === 201) ok("POST /products/[id]/prices");
      else fail("POST /products/[id]/prices", String(priceRes.status));

      const { res: delRes } = await fetchJson(
        `/api/v1/products/${newId}`,
        { method: "DELETE" },
        cookies,
      );
      if (delRes.ok) ok("DELETE /products/[id] (cleanup)");
      else fail("DELETE /products/[id]", String(delRes.status));
    } else if (createRes.status === 403) {
      ok("POST /products → 403 (NODE_ENV=production sem ADMIN_EMAILS?)");
    } else if (createRes.status === 503) {
      fail("POST /products", "503 — SUPABASE_SERVICE_ROLE_KEY ausente no .env");
    } else {
      fail("POST /products", createBody?.error ?? String(createRes.status));
    }
  } else {
    console.log("\n  ⊘ Escrita admin ignorada (sem SUPABASE_SERVICE_ROLE_KEY)");
  }

  console.log(`\n${passed} ok, ${failed} falha(s)\n`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("\nAbortado:", err.message);
  process.exit(1);
});
