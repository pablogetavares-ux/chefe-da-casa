"use client";

import Link from "next/link";
import { BarChart3 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PLANS, type PlanId } from "@/config/plans";
import { usePlanUsage, usePremiumAccess } from "@/shared/hooks/api/identity";
import { cn } from "@/lib/utils";
import { isUnlimited } from "@/lib/billing/plan-limits-core";

function UsageRow({
  label,
  used,
  limit,
}: {
  label: string;
  used: number;
  limit: number;
}) {
  const unlimited = isUnlimited(limit);
  const percent = unlimited
    ? 0
    : limit > 0
      ? Math.min((used / limit) * 100, 100)
      : 0;
  const isLow = !unlimited && limit > 0 && used / limit >= 0.8;

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium tabular-nums">
          {unlimited ? `${used} · ilimitado` : `${used}/${limit}`}
        </span>
      </div>
      {!unlimited && (
        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              isLow ? "bg-amber-500" : "bg-primary",
            )}
            style={{ width: `${percent}%` }}
          />
        </div>
      )}
    </div>
  );
}

function planLabel(tier: string) {
  const key = tier.toLowerCase() as PlanId;
  return PLANS[key]?.name ?? tier;
}

export function PlanUsageCard() {
  const { data, isLoading, error } = usePlanUsage();
  const { isPremium } = usePremiumAccess();

  if (isLoading) {
    return (
      <Card className="surface-card animate-pulse">
        <CardContent className="h-32 p-6" />
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card className="surface-card border-destructive/30">
        <CardContent className="flex flex-col gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Não foi possível carregar o uso do plano.
          </p>
          <Link href="/app/profile">
            <Button size="sm" variant="outline">
              Ver perfil
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="surface-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <BarChart3 className="size-4 text-primary" />
          Uso do plano {planLabel(data.plan)}
        </CardTitle>
        {!isPremium && (
          <Link href="/pricing">
            <Button size="sm" variant="outline">
              Upgrade
            </Button>
          </Link>
        )}
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2">
        <UsageRow
          label="IA este mês"
          used={data.ai.used}
          limit={data.ai.limit}
        />
        <UsageRow
          label="Receitas este mês"
          used={data.recipes.used}
          limit={data.recipes.limit}
        />
        <UsageRow
          label="Despensa"
          used={data.pantry.used}
          limit={data.pantry.limit}
        />
        <UsageRow
          label="Favoritas"
          used={data.favorites.used}
          limit={data.favorites.limit}
        />
      </CardContent>
    </Card>
  );
}
