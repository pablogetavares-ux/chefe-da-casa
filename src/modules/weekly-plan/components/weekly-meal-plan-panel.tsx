"use client";

import Link from "next/link";
import { useState } from "react";
import {
  CalendarDays,
  Dumbbell,
  Heart,
  Loader2,
  PiggyBank,
  RefreshCw,
  ShoppingCart,
  Store,
  Trophy,
} from "lucide-react";

import { ErrorFallback } from "@/components/shared/error-fallback";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { WeeklyPlanResult } from "@/lib/weekly-plan/compute-weekly-plan";
import { WEEKLY_PLAN_GOAL_LABELS } from "@/lib/weekly-plan/meal-templates";
import type { WeeklyPlanGoal } from "@/lib/weekly-plan/meal-templates";
import { cn } from "@/lib/utils";
import { WeeklyPlanOffersSection } from "@/modules/offers/components/weekly-plan-offers-section";
import { api } from "@/lib/api/client";
import { useGenerateWeeklyPlan } from "@/shared/hooks/api/weekly-plan";
import { useSmartShopping } from "@/shared/hooks/api/shopping";
import { toast } from "sonner";

const GOAL_OPTIONS: {
  id: WeeklyPlanGoal;
  label: string;
  description: string;
  icon: typeof PiggyBank;
}[] = [
  {
    id: "economizar",
    label: WEEKLY_PLAN_GOAL_LABELS.economizar,
    description: "Pratos brasileiros de baixo custo",
    icon: PiggyBank,
  },
  {
    id: "saude",
    label: WEEKLY_PLAN_GOAL_LABELS.saude,
    description: "Leve, legumes e proteína magra",
    icon: Heart,
  },
  {
    id: "proteina",
    label: WEEKLY_PLAN_GOAL_LABELS.proteina,
    description: "Alto teor proteico para treino",
    icon: Dumbbell,
  },
];

function formatMoney(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatDateBr(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export function WeeklyMealPlanPanel() {
  const generate = useGenerateWeeklyPlan();
  const { activeListId } = useSmartShopping();

  const [goal, setGoal] = useState<WeeklyPlanGoal>("economizar");
  const [excludePantry, setExcludePantry] = useState(true);
  const [plan, setPlan] = useState<
    (WeeklyPlanResult & { planId: string | null }) | null
  >(null);
  const [addingList, setAddingList] = useState(false);

  async function handleGenerate() {
    const result = await generate.mutateAsync({
      goal,
      excludePantry,
    });
    setPlan(result);
  }

  async function handleAddToShoppingList() {
    if (!plan?.shoppingList.items.length) return;
    setAddingList(true);
    try {
      let added = 0;
      for (const item of plan.shoppingList.items) {
        await api.shoppingList.addItem({
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
          listId: activeListId,
        });
        added += 1;
      }
      toast.success(`${added} itens adicionados à lista de compras`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao adicionar à lista");
    } finally {
      setAddingList(false);
    }
  }

  return (
    <div className="space-y-8">
      <Card className="surface-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-heading text-xl">
            <CalendarDays className="size-5 text-primary" />
            Seu objetivo da semana
          </CardTitle>
          <CardDescription>
            Montamos 7 refeições, a lista de compras e o custo no catálogo de
            mercados cadastrados.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-3">
            {GOAL_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setGoal(option.id)}
                className={cn(
                  "rounded-xl border p-4 text-left transition-colors",
                  goal === option.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/30",
                )}
              >
                <option.icon className="mb-2 size-5 text-primary" />
                <p className="font-medium">{option.label}</p>
                <p className="text-xs text-muted-foreground">
                  {option.description}
                </p>
              </button>
            ))}
          </div>

          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={excludePantry}
              onChange={(e) => setExcludePantry(e.target.checked)}
              className="size-4 rounded border-border"
            />
            Descontar ingredientes que já estão na despensa
          </label>

          <Button
            onClick={handleGenerate}
            disabled={generate.isPending}
            className="gap-2"
          >
            {generate.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <RefreshCw className="size-4" />
            )}
            Gerar plano da semana
          </Button>

          {generate.isError && (
            <ErrorFallback
              compact
              message={
                generate.error instanceof Error
                  ? generate.error.message
                  : "Erro ao gerar plano"
              }
              reset={() => generate.reset()}
            />
          )}
        </CardContent>
      </Card>

      {generate.isPending && !plan && (
        <div className="space-y-4">
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      )}

      {plan && (
        <>
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Trophy className="size-5 text-primary" />
                Resumo da semana
              </CardTitle>
              <CardDescription>
                {plan.goalLabel} · a partir de {formatDateBr(plan.startsOn)}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Stat
                label="Custo estimado (semana)"
                value={formatMoney(plan.weeklyCost.totalCheapest)}
                highlight
              />
              <Stat
                label="Média por dia"
                value={formatMoney(plan.weeklyCost.costPerDay)}
              />
              <Stat
                label="Itens na lista"
                value={String(plan.shoppingList.totalLines)}
              />
              <Stat
                label="Cobertura no catálogo"
                value={`${plan.weeklyCost.coveragePercent}%`}
              />
            </CardContent>
            {plan.cheapestMarket && (
              <CardContent className="border-t pt-4">
                <p className="flex flex-wrap items-center gap-2 text-sm">
                  <Store className="size-4 text-primary" />
                  <span>
                    Mercado mais barato:{" "}
                    <strong>{plan.cheapestMarket.marketName}</strong> —{" "}
                    {formatMoney(plan.cheapestMarket.totalCost)}
                  </span>
                  <Link
                    href="/app/compare"
                    className={cn(
                      buttonVariants({ variant: "outline", size: "sm" }),
                      "ml-auto gap-1",
                    )}
                  >
                    Comparar mercados
                  </Link>
                </p>
              </CardContent>
            )}
          </Card>

          <section className="space-y-3">
            <h2 className="font-heading text-lg font-semibold">
              Cardápio — 7 dias
            </h2>
            <div className="grid gap-3">
              {plan.days.map((day) => (
                <Card key={day.dayIndex} className="surface-card">
                  <CardHeader className="py-4">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <CardTitle className="text-base">
                          {day.dayLabel}
                        </CardTitle>
                        <CardDescription>
                          {formatDateBr(day.date)}
                        </CardDescription>
                      </div>
                      {day.meals[0]?.estimatedDayCost != null &&
                        day.meals[0].estimatedDayCost > 0 && (
                          <Badge variant="secondary">
                            ~{formatMoney(day.meals[0].estimatedDayCost)}
                          </Badge>
                        )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-0">
                    {day.meals.map((meal) => (
                      <div
                        key={meal.id}
                        className="rounded-lg border bg-muted/20 p-3"
                      >
                        <p className="font-medium">{meal.title}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {meal.description}
                        </p>
                        <ul className="mt-2 flex flex-wrap gap-1.5">
                          {meal.ingredients.map((ing) => (
                            <li
                              key={`${meal.id}-${ing.name}`}
                              className="rounded-full bg-background px-2 py-0.5 text-xs"
                            >
                              {ing.name}
                              {ing.quantity != null && ing.unit
                                ? ` (${ing.quantity} ${ing.unit})`
                                : ""}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {plan.marketRankings.length > 1 && (
            <section className="space-y-3">
              <h2 className="font-heading text-lg font-semibold">
                Ranking de mercados
              </h2>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {plan.marketRankings.map((market) => (
                  <Card
                    key={market.marketName}
                    className={cn(market.isBest && "ring-2 ring-primary")}
                  >
                    <CardContent className="flex items-center justify-between p-4">
                      <div>
                        <p className="font-medium">{market.marketName}</p>
                        <p className="text-xs text-muted-foreground">
                          #{market.rank} · {market.coveragePercent}% itens
                        </p>
                      </div>
                      <p className="font-semibold tabular-nums">
                        {formatMoney(market.totalCost)}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}

          <WeeklyPlanOffersSection
            ingredientNames={plan.shoppingList.items.map((item) => item.name)}
          />

          <section className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-heading text-lg font-semibold">
                Lista de compras consolidada
              </h2>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  disabled={addingList || plan.shoppingList.items.length === 0}
                  onClick={handleAddToShoppingList}
                >
                  {addingList ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <ShoppingCart className="size-4" />
                  )}
                  Adicionar à lista
                </Button>
                <Link
                  href="/app/shopping"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "gap-2",
                  )}
                >
                  Ver compras
                </Link>
              </div>
            </div>
            <Card className="surface-card">
              <CardContent className="divide-y p-0">
                {plan.shoppingList.items.map((item) => (
                  <div
                    key={item.key}
                    className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm"
                  >
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.categoryLabel}
                        {item.recipeTitles.length > 0 &&
                          ` · ${item.recipeTitles.length} refeição(ões)`}
                      </p>
                    </div>
                    <span className="shrink-0 text-muted-foreground tabular-nums">
                      {item.quantity} {item.unit}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>
        </>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p
        className={cn(
          "font-heading text-lg font-semibold tabular-nums",
          highlight && "text-primary",
        )}
      >
        {value}
      </p>
    </div>
  );
}
