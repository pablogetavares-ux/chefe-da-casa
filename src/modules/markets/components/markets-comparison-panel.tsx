"use client";

import { ShoppingCart, Store, Trophy } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { ErrorFallback } from "@/components/shared/error-fallback";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useSmartShopping } from "@/shared/hooks/api/shopping";
import { useMarketsCompare } from "@/shared/hooks/api/markets";
import { cn } from "@/lib/utils";

function formatMoney(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function MarketsComparisonPanel() {
  const { activeListId, listsLoading } = useSmartShopping();
  const { data, isLoading, error, refetch, isFetching } = useMarketsCompare(
    activeListId,
    !listsLoading,
  );

  if (!activeListId && !listsLoading) {
    return (
      <EmptyState
        icon={ShoppingCart}
        title="Lista de compras vazia"
        description="Adicione itens à lista em Compras para comparar mercados do catálogo."
      />
    );
  }

  if (error) {
    return (
      <ErrorFallback
        message="Não foi possível comparar mercados."
        reset={() => refetch()}
      />
    );
  }

  if (isLoading || isFetching) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    );
  }

  if (!data || data.rankings.length === 0) {
    return (
      <EmptyState
        icon={Store}
        title="Sem preços no catálogo"
        description="Cadastre produtos e preços por mercado (Admin) ou ajuste os nomes dos itens da lista."
      />
    );
  }

  const { bestMarket, summary, comparisonTable, rankings, markets } = data;

  return (
    <div className="space-y-6">
      {bestMarket && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Trophy className="size-5 text-primary" />
              Melhor mercado: {bestMarket.marketName}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm sm:grid-cols-3">
            <p>
              <span className="text-muted-foreground">Total estimado: </span>
              <strong>{formatMoney(bestMarket.totalCost)}</strong>
            </p>
            <p>
              <span className="text-muted-foreground">Economia máxima: </span>
              <strong className="text-emerald-600 dark:text-emerald-400">
                {formatMoney(summary.savingsVsMostExpensive)}
              </strong>
            </p>
            <p>
              <span className="text-muted-foreground">Cobertura: </span>
              <strong>{bestMarket.coveragePercent}%</strong> dos itens
            </p>
          </CardContent>
        </Card>
      )}

      <section className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Ranking de mercados
        </h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {rankings.map((market) => (
            <Card
              key={market.marketName}
              className={cn(market.isBest && "ring-2 ring-primary")}
            >
              <CardContent className="flex items-start justify-between gap-2 p-4">
                <div>
                  <p className="font-medium">{market.marketName}</p>
                  <p className="text-xs text-muted-foreground">
                    #{market.rank} · {market.matchedIngredients}/
                    {summary.itemsTotal} itens
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">
                    {formatMoney(market.totalCost)}
                  </p>
                  {market.vsCheapest > 0 && (
                    <p className="text-xs text-muted-foreground">
                      +{formatMoney(market.vsCheapest)}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          <Store className="size-4" />
          Tabela comparativa
        </h3>
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-left">
                <th className="p-3 font-medium">Item</th>
                <th className="p-3 font-medium">Qtd</th>
                {markets.map((m) => (
                  <th key={m} className="p-3 font-medium text-right">
                    {m}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comparisonTable.map((row) => (
                <tr
                  key={row.itemId ?? row.itemName}
                  className="border-b last:border-0"
                >
                  <td className="p-3">
                    <span className="font-medium">{row.itemName}</span>
                    {row.productName && (
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        → {row.productName}
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-muted-foreground">
                    {row.quantity} {row.unit}
                  </td>
                  {row.pricesByMarket.map((cell) => (
                    <td
                      key={cell.marketName}
                      className={cn(
                        "p-3 text-right tabular-nums",
                        cell.marketName === row.cheapestMarket &&
                          cell.available &&
                          "font-semibold text-emerald-600 dark:text-emerald-400",
                      )}
                    >
                      {cell.available ? (
                        formatMoney(cell.lineCost)
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-muted/40 font-semibold">
                <td className="p-3" colSpan={2}>
                  Total
                </td>
                {markets.map((marketName) => {
                  const r = rankings.find((x) => x.marketName === marketName);
                  if (!r) return <td key={marketName} className="p-3" />;
                  return (
                    <td key={marketName} className="p-3 text-right">
                      {formatMoney(r.totalCost)}
                      {r.isBest && (
                        <Badge variant="secondary" className="ml-1 text-[10px]">
                          melhor
                        </Badge>
                      )}
                    </td>
                  );
                })}
              </tr>
            </tfoot>
          </table>
        </div>
      </section>
    </div>
  );
}
