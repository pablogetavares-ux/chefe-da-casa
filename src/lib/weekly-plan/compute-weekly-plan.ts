import { compareMarketsForShoppingList } from "@/lib/markets/compare-shopping-list";
import {
  calculateRecipeCost,
  type RecipeCostIngredientInput,
} from "@/lib/recipes/calculate-recipe-cost";
import {
  buildPantryNameSet,
  isIngredientInPantry,
} from "@/lib/shopping/missing-ingredients";
import {
  consolidateIngredientsFromRecipes,
  type RecipeIngredientSource,
} from "@/lib/shopping/consolidate-ingredients";
import type { ProductWithMarketPrices } from "@/lib/recipes/calculate-recipe-cost";
import {
  addDaysToIsoDate,
  buildWeeklyDayTemplates,
  WEEKLY_PLAN_GOAL_LABELS,
  type DayPlanTemplate,
  type WeeklyPlanGoal,
} from "@/lib/weekly-plan/meal-templates";
import { roundMoney } from "@/modules/shopping/services/savings";
import type { RecipeIngredient } from "@/types";

export type WeeklyPlanInput = {
  goal: WeeklyPlanGoal;
  startsOn?: string;
  excludePantry?: boolean;
  pantryNames?: string[];
};

export type PlannedMeal = {
  id: string;
  mealType: "almoco" | "jantar" | "cafe";
  title: string;
  description: string;
  ingredients: RecipeIngredient[];
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  estimatedDayCost: number | null;
};

export type WeeklyPlanDay = {
  dayIndex: number;
  dayLabel: string;
  date: string;
  meals: PlannedMeal[];
};

export type WeeklyPlanShoppingLine = {
  key: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  categoryLabel: string;
  recipeTitles: string[];
};

export type WeeklyPlanCost = {
  totalCheapest: number;
  totalMostExpensive: number;
  averageAcrossMarkets: number;
  costPerDay: number;
  currency: "BRL";
  itemsMatched: number;
  itemsTotal: number;
  coveragePercent: number;
};

export type WeeklyPlanMarket = {
  marketName: string;
  rank: number;
  totalCost: number;
  vsCheapest: number;
  coveragePercent: number;
  isBest: boolean;
};

export type WeeklyPlanResult = {
  goal: WeeklyPlanGoal;
  goalLabel: string;
  startsOn: string;
  days: WeeklyPlanDay[];
  shoppingList: {
    items: WeeklyPlanShoppingLine[];
    totalLines: number;
    recipes: { id: string; title: string }[];
  };
  weeklyCost: WeeklyPlanCost;
  cheapestMarket: WeeklyPlanMarket | null;
  marketRankings: WeeklyPlanMarket[];
};

function toRecipeSources(days: DayPlanTemplate[]): RecipeIngredientSource[] {
  return days.flatMap((day) =>
    day.meals.map((meal, mealIndex) => ({
      id: `day-${day.dayIndex}-meal-${mealIndex}`,
      title: `${day.dayLabel}: ${meal.title}`,
      ingredients: meal.ingredients,
    })),
  );
}

function estimateDayCost(
  ingredients: RecipeIngredient[],
  products: ProductWithMarketPrices[],
): number | null {
  const parsed: RecipeCostIngredientInput[] = ingredients
    .filter((i) => !i.optional)
    .map((i) => ({
      name: i.name,
      quantity: i.quantity ?? 1,
      unit: i.unit ?? "un",
    }));

  if (parsed.length === 0) return null;

  const result = calculateRecipeCost(parsed, products);
  const total = result.summary.cheapestTotal;
  return total > 0 ? total : null;
}

export function computeWeeklyPlan(
  input: WeeklyPlanInput,
  products: ProductWithMarketPrices[],
): WeeklyPlanResult {
  const startsOn = input.startsOn ?? new Date().toISOString().slice(0, 10);
  const dayTemplates = buildWeeklyDayTemplates(input.goal);
  const recipeSources = toRecipeSources(dayTemplates);

  let consolidated = consolidateIngredientsFromRecipes(recipeSources);

  if (input.excludePantry !== false && input.pantryNames?.length) {
    const pantrySet = buildPantryNameSet(input.pantryNames);
    const filtered = consolidated.items.filter(
      (item) => !isIngredientInPantry(item.name, pantrySet),
    );
    const groupedByCategory = { ...consolidated.groupedByCategory };
    for (const key of Object.keys(groupedByCategory) as Array<
      keyof typeof groupedByCategory
    >) {
      const group = groupedByCategory[key]!.filter(
        (item) => !isIngredientInPantry(item.name, pantrySet),
      );
      if (group.length === 0) delete groupedByCategory[key];
      else groupedByCategory[key] = group;
    }
    consolidated = {
      ...consolidated,
      items: filtered,
      groupedByCategory,
      totalLines: filtered.length,
    };
  }

  const compareItems = consolidated.items.map((item) => ({
    id: item.key,
    name: item.name,
    quantity: item.quantity,
    unit: item.unit,
  }));

  const markets = compareMarketsForShoppingList(compareItems, products, null);

  const days: WeeklyPlanDay[] = dayTemplates.map((day) => ({
    dayIndex: day.dayIndex,
    dayLabel: day.dayLabel,
    date: addDaysToIsoDate(startsOn, day.dayIndex - 1),
    meals: day.meals.map((meal, mealIndex) => ({
      id: `day-${day.dayIndex}-meal-${mealIndex}`,
      mealType: meal.mealType,
      title: meal.title,
      description: meal.description,
      ingredients: meal.ingredients,
      prepTimeMinutes: meal.prepTimeMinutes,
      cookTimeMinutes: meal.cookTimeMinutes,
      estimatedDayCost: estimateDayCost(meal.ingredients, products),
    })),
  }));

  const cheapestTotal = markets.summary.cheapestTotal;
  const costPerDay = cheapestTotal > 0 ? roundMoney(cheapestTotal / 7) : 0;

  const marketRankings: WeeklyPlanMarket[] = markets.rankings.map((r) => ({
    marketName: r.marketName,
    rank: r.rank,
    totalCost: r.totalCost,
    vsCheapest: r.vsCheapest,
    coveragePercent: r.coveragePercent,
    isBest: r.isBest,
  }));

  const cheapestMarket = marketRankings[0]
    ? {
        marketName: marketRankings[0].marketName,
        rank: 1,
        totalCost: marketRankings[0].totalCost,
        vsCheapest: 0,
        coveragePercent: marketRankings[0].coveragePercent,
        isBest: true,
      }
    : null;

  return {
    goal: input.goal,
    goalLabel: WEEKLY_PLAN_GOAL_LABELS[input.goal],
    startsOn,
    days,
    shoppingList: {
      items: consolidated.items.map((item) => ({
        key: item.key,
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        category: item.category,
        categoryLabel: item.categoryLabel,
        recipeTitles: item.recipeTitles,
      })),
      totalLines: consolidated.totalLines,
      recipes: consolidated.recipes,
    },
    weeklyCost: {
      totalCheapest: cheapestTotal,
      totalMostExpensive: markets.summary.mostExpensiveTotal,
      averageAcrossMarkets: markets.summary.averageTotal,
      costPerDay,
      currency: "BRL",
      itemsMatched: markets.summary.itemsMatched,
      itemsTotal: markets.summary.itemsTotal,
      coveragePercent:
        markets.summary.itemsTotal > 0
          ? roundMoney(
              (markets.summary.itemsMatched / markets.summary.itemsTotal) * 100,
            )
          : 0,
    },
    cheapestMarket,
    marketRankings,
  };
}
