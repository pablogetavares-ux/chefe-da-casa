import { PLANS } from "@/config/plans";
import { getMonthStartIso } from "@/lib/utils/date";
import { createClient } from "@/lib/supabase/server";
import {
  createAdminClient,
  isAdminClientConfigured,
} from "@/lib/supabase/admin";
import type {
  AdminActivityRow,
  AdminOfferRow,
  AdminPaginated,
  AdminStats,
  AdminUserRow,
} from "@/modules/admin/types";
export async function fetchAdminStatsForUser(
  authUserId: string,
): Promise<AdminStats> {
  const monthStart = getMonthStartIso();

  if (!isAdminClientConfigured()) {
    const aiUsage = await getAiUsageSummary(authUserId, monthStart);
    return {
      demo: true,
      users: 1,
      recipes: 0,
      pantryItems: 0,
      aiGenerations: aiUsage.generations,
      aiTokensThisMonth: aiUsage.tokens,
      chatMessagesThisMonth: aiUsage.chatMessages,
      activeSubscriptions: 0,
      planBreakdown: { FREE: 1, PRO: 0, FAMILY: 0 },
      mrrEstimateBrl: 0,
      regionalOffersActive: 0,
      regionalStoresActive: 0,
      offerFavorites: 0,
      shoppingLists: 0,
    };
  }

  const admin = createAdminClient();
  const now = new Date().toISOString();

  const results = await Promise.all([
    admin.from("profiles").select("*", { count: "exact", head: true }),
    admin.from("recipes").select("*", { count: "exact", head: true }),
    admin.from("pantry_items").select("*", { count: "exact", head: true }),
    admin
      .from("ai_generations")
      .select("*", { count: "exact", head: true })
      .eq("status", "COMPLETED"),
    admin
      .from("subscriptions")
      .select("*", { count: "exact", head: true })
      .eq("status", "ACTIVE"),
    admin.from("profiles").select("plan"),
    admin
      .from("usage_logs")
      .select("*", { count: "exact", head: true })
      .eq("action", "ai.chat")
      .gte("created_at", monthStart),
    admin
      .from("ai_generations")
      .select("total_tokens")
      .eq("status", "COMPLETED")
      .gte("created_at", monthStart),
    admin
      .from("regional_offers")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true)
      .gt("valid_until", now),
    admin
      .from("regional_stores")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true),
    admin.from("offer_favorites").select("*", { count: "exact", head: true }),
    admin.from("shopping_lists").select("*", { count: "exact", head: true }),
  ]);

  const queryError = results.find(
    (result) => "error" in result && result.error,
  );
  if (queryError && "error" in queryError && queryError.error) {
    throw queryError.error;
  }

  const [
    { count: users },
    { count: recipes },
    { count: pantryItems },
    { count: aiGenerations },
    { count: activeSubscriptions },
    { data: profiles },
    { count: chatMessages },
    { data: tokenAgg },
    { count: regionalOffersActive },
    { count: regionalStoresActive },
    { count: offerFavorites },
    { count: shoppingLists },
  ] = results;

  const planBreakdown = { FREE: 0, PRO: 0, FAMILY: 0 };
  for (const row of profiles ?? []) {
    if (row.plan in planBreakdown) {
      planBreakdown[row.plan as keyof typeof planBreakdown] += 1;
    }
  }

  const mrrEstimateBrl =
    planBreakdown.PRO * PLANS.pro.priceMonthly +
    planBreakdown.FAMILY * PLANS.family.priceMonthly;

  const aiTokensThisMonth = (tokenAgg ?? []).reduce(
    (sum, row) => sum + (row.total_tokens ?? 0),
    0,
  );

  return {
    demo: false,
    users: users ?? 0,
    recipes: recipes ?? 0,
    pantryItems: pantryItems ?? 0,
    aiGenerations: aiGenerations ?? 0,
    aiTokensThisMonth,
    chatMessagesThisMonth: chatMessages ?? 0,
    activeSubscriptions: activeSubscriptions ?? 0,
    planBreakdown,
    mrrEstimateBrl,
    regionalOffersActive: regionalOffersActive ?? 0,
    regionalStoresActive: regionalStoresActive ?? 0,
    offerFavorites: offerFavorites ?? 0,
    shoppingLists: shoppingLists ?? 0,
  };
}

export async function fetchAdminUsers(options: {
  page: number;
  limit: number;
  q?: string;
}): Promise<AdminPaginated<AdminUserRow>> {
  if (!isAdminClientConfigured()) {
    return emptyPage(options.page, options.limit);
  }

  const admin = createAdminClient();
  const from = (options.page - 1) * options.limit;
  const to = from + options.limit - 1;

  let query = admin
    .from("profiles")
    .select(
      "id, email, full_name, plan, created_at, offer_city, offer_state, offer_search_radius_km",
      { count: "exact" },
    )
    .order("created_at", { ascending: false });

  const term = options.q?.trim();
  if (term) {
    query = query.or(`email.ilike.%${term}%,full_name.ilike.%${term}%`);
  }

  const { data, count, error } = await query.range(from, to);
  if (error) throw error;

  const total = count ?? 0;
  return {
    items: (data ?? []).map((row) => ({
      id: row.id,
      email: row.email,
      fullName: row.full_name,
      plan: row.plan,
      createdAt: row.created_at,
      offerCity: row.offer_city,
      offerState: row.offer_state,
      offerRadiusKm: row.offer_search_radius_km,
    })),
    page: options.page,
    limit: options.limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / options.limit)),
  };
}

export async function fetchAdminOffers(options: {
  page: number;
  limit: number;
  q?: string;
}): Promise<AdminPaginated<AdminOfferRow>> {
  if (!isAdminClientConfigured()) {
    return emptyPage(options.page, options.limit);
  }

  const admin = createAdminClient();
  const from = (options.page - 1) * options.limit;
  const to = from + options.limit - 1;

  let query = admin
    .from("regional_offers")
    .select(
      `
      id, title, product_name, category, current_price, previous_price,
      is_active, valid_until,
      store:regional_stores!regional_offers_store_id_fkey (name, city, state)
    `,
      { count: "exact" },
    )
    .order("valid_until", { ascending: true });

  const term = options.q?.trim();
  if (term) {
    query = query.or(`title.ilike.%${term}%,product_name.ilike.%${term}%`);
  }

  const { data, count, error } = await query.range(from, to);
  if (error) throw error;

  const total = count ?? 0;
  const items: AdminOfferRow[] = [];

  for (const row of data ?? []) {
    const store = row.store as {
      name: string;
      city: string;
      state: string;
    } | null;
    if (!store) continue;
    items.push({
      id: row.id,
      title: row.title,
      productName: row.product_name,
      category: row.category,
      currentPrice: Number(row.current_price),
      previousPrice:
        row.previous_price != null ? Number(row.previous_price) : null,
      isActive: row.is_active,
      validUntil: row.valid_until,
      storeName: store.name,
      storeCity: store.city,
      storeState: store.state,
    });
  }

  return {
    items,
    page: options.page,
    limit: options.limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / options.limit)),
  };
}

export async function fetchAdminActivity(
  limit: number,
): Promise<AdminActivityRow[]> {
  if (!isAdminClientConfigured()) {
    return [];
  }

  const admin = createAdminClient();

  const { data: logs, error } = await admin
    .from("usage_logs")
    .select("id, action, user_id, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  if (!logs?.length) return [];

  const userIds = [...new Set(logs.map((l) => l.user_id))];
  const { data: profiles } = await admin
    .from("profiles")
    .select("id, email")
    .in("id", userIds);

  const emailById = new Map(
    (profiles ?? []).map((p) => [p.id, p.email] as const),
  );

  return logs.map((log) => ({
    id: log.id,
    action: log.action,
    userId: log.user_id,
    userEmail: emailById.get(log.user_id) ?? null,
    createdAt: log.created_at,
  }));
}

function emptyPage<T>(page: number, limit: number): AdminPaginated<T> {
  return { items: [], page, limit, total: 0, totalPages: 1 };
}

async function getAiUsageSummary(userId: string, monthStart: string) {
  const supabase = await createClient();
  const [{ count: generations }, { count: chatMessages }, { data: tokens }] =
    await Promise.all([
      supabase
        .from("ai_generations")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .gte("created_at", monthStart)
        .eq("status", "COMPLETED"),
      supabase
        .from("usage_logs")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("action", "ai.chat")
        .gte("created_at", monthStart),
      supabase
        .from("ai_generations")
        .select("total_tokens")
        .eq("user_id", userId)
        .gte("created_at", monthStart)
        .eq("status", "COMPLETED"),
    ]);

  return {
    generations: generations ?? 0,
    chatMessages: chatMessages ?? 0,
    tokens: (tokens ?? []).reduce((s, r) => s + (r.total_tokens ?? 0), 0),
  };
}
