import Link from "next/link";
import { Percent, Sparkles } from "lucide-react";

import { AiUsageMeter } from "@/components/shared/ai-usage-meter";
import { Button } from "@/components/ui/button";
import { formatPlanDisplayName } from "@/config/plans";
import type { HomeGreeting, HomeStats } from "@/modules/home/types";

type HomeHeroProps = {
  greeting: HomeGreeting;
  stats: HomeStats;
};

export function HomeHero({ greeting, stats }: HomeHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/10 via-background to-accent/10 p-5 sm:p-6">
      <div className="pointer-events-none absolute -right-8 -top-8 size-32 rounded-full bg-primary/10 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-10 left-1/3 size-28 rounded-full bg-accent/10 blur-2xl" />

      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-primary">{greeting.period}</p>
          <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
            {greeting.firstName}, o que vamos cozinhar?
          </h1>
          <p className="max-w-lg text-sm text-muted-foreground">
            Plano {formatPlanDisplayName(greeting.plan)} · {stats.aiRemaining}{" "}
            usos de IA restantes · {stats.shoppingPendingCount} itens na lista
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link href="/app/generate">
            <Button size="lg" className="w-full gap-2 shadow-md sm:w-auto">
              <Sparkles className="size-4" />
              Gerar receita
            </Button>
          </Link>
          <Link href="/app/offers">
            <Button
              size="lg"
              variant="outline"
              className="w-full gap-2 sm:w-auto"
            >
              <Percent className="size-4" />
              Ver ofertas
            </Button>
          </Link>
        </div>
      </div>

      <div className="relative mt-5 max-w-md">
        <AiUsageMeter compact />
      </div>
    </section>
  );
}
