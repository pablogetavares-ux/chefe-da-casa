"use client";

import Link from "next/link";
import {
  ArrowDownRight,
  ArrowUpRight,
  ChefHat,
  LineChart,
  PiggyBank,
  ShoppingCart,
  Sparkles,
  Store,
  TrendingUp,
} from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import {
  AnimatedPage,
  FadeIn,
  StaggerItem,
  StaggerList,
} from "@/components/shared/motion";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EconomyCharts } from "@/modules/economy/components/economy-charts";
import { formatShoppingMoney } from "@/modules/shopping/services/savings";
import { useEconomyDashboard } from "@/shared/hooks/api/economy";

function formatPercent(value: number | null): string {
  if (value == null) return "—";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value}%`;
}

function MomBadge({ percent }: { percent: number | null }) {
  if (percent == null) {
    return (
      <span className="text-xs text-muted-foreground">
        Sem dados do mês anterior
      </span>
    );
  }

  const up = percent >= 0;
  const Icon = up ? ArrowUpRight : ArrowDownRight;

  return (
    <span
      className={
        up
          ? "inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400"
          : "inline-flex items-center gap-1 text-xs font-medium text-amber-700 dark:text-amber-400"
      }
    >
      <Icon className="size-3.5" />
      {formatPercent(percent)} vs mês anterior
    </span>
  );
}

export function EconomyDashboardPanel() {
  const { data, isLoading, error, refetch } = useEconomyDashboard();

  if (error) {
    return (
      <AnimatedPage>
        <PageHeader
          title="Economia alimentar"
          description="Acompanhe quanto você economiza com listas, ofertas e receitas."
        />
        <EmptyState
          icon={LineChart}
          title="Não foi possível carregar"
          description="Faça login novamente ou tente de novo em instantes."
          action={
            <Button variant="outline" onClick={() => refetch()}>
              Tentar novamente
            </Button>
          }
        />
      </AnimatedPage>
    );
  }

  if (isLoading || !data) {
    return (
      <AnimatedPage>
        <PageHeader
          title="Economia alimentar"
          description="Acompanhe quanto você economiza com listas, ofertas e receitas."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-40 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="mt-6 h-72 rounded-2xl" />
      </AnimatedPage>
    );
  }

  const { summary } = data;

  return (
    <AnimatedPage>
      <PageHeader
        title="Economia alimentar"
        description="Quanto você economizou, evolução mensal, custo médio das receitas e mercados que mais usa."
      />

      {!data.hasActivity && (
        <FadeIn>
          <EmptyState
            icon={Sparkles}
            title="Comece a economizar"
            description="Adicione itens com ofertas na lista de compras, gere receitas ou monte um plano semanal para ver seus números aqui."
            action={
              <div className="flex flex-wrap justify-center gap-2">
                <Link href="/app/shopping">
                  <Button>Lista de compras</Button>
                </Link>
                <Link href="/app/weekly-plan">
                  <Button variant="outline">Plano semanal</Button>
                </Link>
              </div>
            }
          />
        </FadeIn>
      )}

      <StaggerList className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StaggerItem>
          <StatCard
            title="Total economizado"
            description="Ofertas, planos e compras registradas"
            value={formatShoppingMoney(summary.totalSavings)}
            icon={PiggyBank}
            accent="primary"
            href="/app/shopping"
            actionLabel="Compras"
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            title="Este mês"
            description="Economia no mês atual"
            value={formatShoppingMoney(summary.savingsThisMonth)}
            icon={TrendingUp}
            accent="primary"
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            title="Custo médio / receita"
            description={
              summary.recipesAnalyzed > 0
                ? `${summary.recipesAnalyzed} receitas no catálogo de preços`
                : "Gere receitas com ingredientes"
            }
            value={
              summary.avgRecipeCost != null
                ? formatShoppingMoney(summary.avgRecipeCost)
                : "—"
            }
            icon={ChefHat}
            accent="amber"
            href="/app/recipes"
            actionLabel="Receitas"
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            title="Por porção"
            description="Média no mercado mais barato"
            value={
              summary.avgCostPerServing != null
                ? formatShoppingMoney(summary.avgCostPerServing)
                : "—"
            }
            icon={Store}
            accent="rose"
          />
        </StaggerItem>
      </StaggerList>

      <FadeIn className="mt-4 surface-card flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium">Comparação mês a mês</p>
          <p className="text-xs text-muted-foreground">
            Mês passado: {formatShoppingMoney(summary.savingsLastMonth)} ·
            Pendente na lista: {formatShoppingMoney(summary.pendingSavings)}
          </p>
        </div>
        <MomBadge percent={summary.monthOverMonthPercent} />
      </FadeIn>

      <FadeIn className="mt-6">
        <EconomyCharts monthly={data.monthly} topMarkets={data.topMarkets} />
      </FadeIn>

      <FadeIn className="mt-6 grid gap-3 sm:grid-cols-3">
        <Link
          href="/app/compare"
          className="surface-card flex items-center gap-3 p-4 transition-shadow hover:shadow-md"
        >
          <ShoppingCart className="size-5 text-primary" />
          <div>
            <p className="text-sm font-semibold">Comparar preços</p>
            <p className="text-xs text-muted-foreground">
              Encontre o mercado mais barato
            </p>
          </div>
        </Link>
        <Link
          href="/app/weekly-plan"
          className="surface-card flex items-center gap-3 p-4 transition-shadow hover:shadow-md"
        >
          <TrendingUp className="size-5 text-violet-600" />
          <div>
            <p className="text-sm font-semibold">Plano semanal</p>
            <p className="text-xs text-muted-foreground">
              {summary.weeklyPlansCount} plano
              {summary.weeklyPlansCount === 1 ? "" : "s"} salvos
            </p>
          </div>
        </Link>
        <Link
          href="/app/offers"
          className="surface-card flex items-center gap-3 p-4 transition-shadow hover:shadow-md"
        >
          <PiggyBank className="size-5 text-emerald-600" />
          <div>
            <p className="text-sm font-semibold">Ofertas</p>
            <p className="text-xs text-muted-foreground">
              Vincule promoções à lista
            </p>
          </div>
        </Link>
      </FadeIn>
    </AnimatedPage>
  );
}
