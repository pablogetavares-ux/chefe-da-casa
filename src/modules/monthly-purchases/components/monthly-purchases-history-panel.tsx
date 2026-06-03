"use client";

import Link from "next/link";
import { ArrowLeft, CalendarDays, ChevronRight, History } from "lucide-react";

import { AnimatedPage, FadeIn } from "@/components/shared/motion";
import { PageHeader } from "@/components/shared/page-header";
import { PanelSkeleton } from "@/components/shared/panel-skeleton";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatShoppingMoney } from "@/modules/shopping/services/savings";
import { useMonthlyPurchaseHistory } from "@/shared/hooks/api/monthly-purchases";

export function MonthlyPurchasesHistoryPanel() {
  const { data, isLoading, error } = useMonthlyPurchaseHistory();

  if (error) {
    return (
      <AnimatedPage>
        <PageHeader
          title="Histórico de compras"
          description="Consulte listas de meses anteriores."
        />
        <div className="surface-card p-8 text-center text-muted-foreground">
          Não foi possível carregar o histórico. Tente novamente.
        </div>
      </AnimatedPage>
    );
  }

  if (isLoading || !data) {
    return (
      <AnimatedPage>
        <PageHeader
          title="Histórico de compras"
          description="Meses em que você registrou compras."
        />
        <PanelSkeleton rows={6} label="Carregando histórico…" />
      </AnimatedPage>
    );
  }

  const entries = [...data.entries].sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    return b.month - a.month;
  });

  return (
    <AnimatedPage>
      <div className="mb-4">
        <Link
          href="/compras-do-mes"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "gap-2 -ml-2",
          )}
        >
          <ArrowLeft className="size-4" />
          Voltar às compras do mês
        </Link>
      </div>

      <PageHeader
        title="Histórico de compras"
        description="Veja quanto gastou e quantos itens tinha em cada mês. Toque para consultar a lista."
      />

      {entries.length === 0 ? (
        <FadeIn className="mt-8">
          <div className="surface-card flex flex-col items-center gap-3 p-10 text-center">
            <History className="size-10 text-muted-foreground" />
            <p className="font-medium">Nenhum histórico ainda</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Quando você criar listas em meses anteriores, elas aparecerão aqui
              para consulta.
            </p>
            <Link
              href="/compras-do-mes"
              className={cn(buttonVariants(), "mt-2 inline-flex")}
            >
              Ir para Compras do Mês
            </Link>
          </div>
        </FadeIn>
      ) : (
        <ul className="mt-6 space-y-2">
          {entries.map((entry) => (
            <li key={entry.listId}>
              <Link
                href={`/compras-do-mes/historico/consulta?month=${entry.month}&year=${entry.year}`}
                className="surface-card flex items-center gap-4 p-4 transition-colors hover:bg-muted/50"
              >
                <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <CalendarDays className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-heading font-semibold capitalize">
                    {entry.label}
                    {entry.isCurrentMonth && (
                      <span className="ml-2 text-xs font-normal text-muted-foreground">
                        (mês atual)
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {entry.itemCount} {entry.itemCount === 1 ? "item" : "itens"}
                    {entry.totalSpent > 0 &&
                      ` · ${formatShoppingMoney(entry.totalSpent)} gastos`}
                  </p>
                </div>
                <ChevronRight className="size-5 shrink-0 text-muted-foreground" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </AnimatedPage>
  );
}
