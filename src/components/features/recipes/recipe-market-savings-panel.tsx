"use client";

import Link from "next/link";
import {
  ArrowRight,
  PiggyBank,
  RefreshCw,
  Store,
  TrendingDown,
} from "lucide-react";

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
import { ErrorFallback } from "@/components/shared/error-fallback";
import type { IngredientSubstitutionSuggestion } from "@/lib/substitutions/suggest-cheaper";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useRecipeCatalogSubstitutions } from "@/shared/hooks/api/substitutions";

type RecipeMarketSavingsPanelProps = {
  recipeId: string;
};

function formatMoney(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function RecipeMarketSavingsPanel({
  recipeId,
}: RecipeMarketSavingsPanelProps) {
  const { user, loading: authLoading } = useAuth();
  const { data, isLoading, error, refetch, isFetching, isFetched } =
    useRecipeCatalogSubstitutions(recipeId);

  if (!user && !authLoading) {
    return null;
  }

  if (authLoading || (isLoading && !isFetched)) {
    return (
      <Card className="surface-card" id="economia-mercado">
        <CardHeader>
          <Skeleton className="h-6 w-56" />
          <Skeleton className="h-4 w-full max-w-md" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="surface-card" id="economia-mercado">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <PiggyBank className="size-5 text-primary" />
            Economizar no mercado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ErrorFallback
            compact
            message="Não foi possível carregar substituições do catálogo."
            reset={() => refetch()}
          />
        </CardContent>
      </Card>
    );
  }

  const suggestions = data?.suggestions ?? [];
  const baseCost = data?.recipeCost;
  const optimizedCost = data?.recipeCostWithSubstitutions;
  const baseTotal = baseCost?.summary.cheapestTotal ?? 0;
  const optimizedTotal = optimizedCost?.summary.cheapestTotal ?? 0;
  const marketSavings =
    baseTotal > 0 && optimizedTotal > 0
      ? Math.max(0, Math.round((baseTotal - optimizedTotal) * 100) / 100)
      : 0;
  const catalogSavings = data?.estimatedTotalSavings ?? 0;
  const displaySavings = marketSavings > 0 ? marketSavings : catalogSavings;

  if (suggestions.length === 0) {
    return (
      <Card className="surface-card border-dashed" id="economia-mercado">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <PiggyBank className="size-5 text-muted-foreground" />
            Economizar no mercado
          </CardTitle>
          <CardDescription>
            Nenhuma troca cadastrada para os ingredientes desta receita. Confira
            as ofertas regionais abaixo ou compare mercados na lista de compras.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link
            href="/app/compare"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "gap-2",
            )}
          >
            Comparar mercados
            <ArrowRight className="size-4" />
          </Link>
        </CardContent>
      </Card>
    );
  }

  const bestMarket =
    optimizedCost?.cheapestMarket?.marketName ??
    baseCost?.cheapestMarket?.marketName ??
    null;

  return (
    <Card className="surface-card" id="economia-mercado">
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2 font-heading text-xl">
            <PiggyBank className="size-5 text-primary" />
            Economizar no mercado
          </CardTitle>
          <CardDescription>
            Trocas baseadas no catálogo de produtos e preços por mercado — sem
            gastar créditos de IA.
          </CardDescription>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="shrink-0 gap-2"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <RefreshCw className={cn("size-4", isFetching && "animate-spin")} />
          Atualizar
        </Button>
      </CardHeader>

      <CardContent className="space-y-6">
        {(displaySavings > 0 || bestMarket) && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1">
                {displaySavings > 0 && (
                  <p className="flex items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-400">
                    <TrendingDown className="size-4" />
                    Economia estimada: {formatMoney(displaySavings)}
                  </p>
                )}
                {bestMarket && (
                  <p className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Store className="size-4 shrink-0" />
                    Melhor referência: <strong>{bestMarket}</strong>
                    {baseTotal > 0 && (
                      <>
                        {" "}
                        · custo atual{" "}
                        <span className="tabular-nums">
                          {formatMoney(baseTotal)}
                        </span>
                        {optimizedTotal > 0 && marketSavings > 0 && (
                          <>
                            {" "}
                            → com trocas{" "}
                            <span className="font-medium text-foreground tabular-nums">
                              {formatMoney(optimizedTotal)}
                            </span>
                          </>
                        )}
                      </>
                    )}
                  </p>
                )}
              </div>
              <Link
                href="/app/compare"
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "gap-2",
                )}
              >
                Ver comparador
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        )}

        <ul className="space-y-3">
          {suggestions.map((item) => (
            <SubstitutionRow
              key={`${item.id}-${item.ingredientName}`}
              item={item}
            />
          ))}
        </ul>

        <p className="text-xs text-muted-foreground">
          Valores estimados com preços cadastrados (Admin). Ingredientes sem
          produto no catálogo aparecem como dica, sem valor de economia.
        </p>
      </CardContent>
    </Card>
  );
}

function SubstitutionRow({ item }: { item: IngredientSubstitutionSuggestion }) {
  const hasCatalogPrice =
    item.confidence === "catalog" &&
    item.estimatedSavingsPerLine != null &&
    item.estimatedSavingsPerLine > 0;

  return (
    <li className="rounded-xl border bg-muted/20 p-4 text-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 space-y-1">
          <p className="text-xs text-muted-foreground">
            Na receita:{" "}
            <span className="text-foreground">{item.ingredientName}</span>
          </p>
          <p>
            <strong>{item.originalName}</strong>
            <span className="text-muted-foreground"> → </span>
            <strong>{item.substituteName}</strong>
          </p>
          {item.substituteProductName &&
            item.substituteProductName !== item.substituteName && (
              <p className="text-xs text-muted-foreground">
                Produto no catálogo: {item.substituteProductName}
              </p>
            )}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          {hasCatalogPrice ? (
            <Badge className="bg-emerald-600/90 hover:bg-emerald-600/90">
              −{formatMoney(item.estimatedSavingsPerLine!)}
            </Badge>
          ) : (
            <Badge variant="secondary">Dica</Badge>
          )}
          {item.cheapestMarketName && (
            <span className="text-xs text-muted-foreground">
              ref. {item.cheapestMarketName}
            </span>
          )}
        </div>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
        {item.reason}
      </p>
    </li>
  );
}
