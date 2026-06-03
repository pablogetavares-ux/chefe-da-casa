import type { SupabaseClient } from "@supabase/supabase-js";

import {
  computeWeeklyPlan,
  type WeeklyPlanResult,
} from "@/lib/weekly-plan/compute-weekly-plan";
import type { WeeklyPlanGoal } from "@/lib/weekly-plan/meal-templates";
import { loadProductsWithPrices } from "@/modules/recipes/services/recipe-cost";
import type { Database } from "@/types/database";

type Client = SupabaseClient<Database>;

export type BuildWeeklyPlanInput = {
  goal: WeeklyPlanGoal;
  startsOn?: string;
  excludePantry?: boolean;
  persist?: boolean;
};

export async function buildWeeklyMealPlan(
  client: Client,
  userId: string,
  input: BuildWeeklyPlanInput,
): Promise<WeeklyPlanResult & { planId: string | null }> {
  const [products, pantryResult] = await Promise.all([
    loadProductsWithPrices(client),
    input.excludePantry !== false
      ? client.from("pantry_items").select("name").eq("user_id", userId)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (pantryResult.error) throw new Error(pantryResult.error.message);

  const pantryNames = (pantryResult.data ?? []).map((p) => p.name);

  const plan = computeWeeklyPlan(
    {
      goal: input.goal,
      startsOn: input.startsOn,
      excludePantry: input.excludePantry,
      pantryNames,
    },
    products,
  );

  let planId: string | null = null;

  if (input.persist) {
    const { data, error } = await client
      .from("weekly_meal_plans")
      .insert({
        user_id: userId,
        goal: input.goal,
        starts_on: plan.startsOn,
        plan_json: JSON.parse(JSON.stringify(plan)),
        total_cost: plan.weeklyCost.totalCheapest,
        cheapest_market: plan.cheapestMarket?.marketName ?? null,
      })
      .select("id")
      .single();

    if (error) throw new Error(error.message);
    planId = data?.id ?? null;
  }

  return { ...plan, planId };
}
