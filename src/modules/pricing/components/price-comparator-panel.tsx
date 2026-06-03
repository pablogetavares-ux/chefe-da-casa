"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { List, Scale, ShoppingBasket } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { ErrorFallback } from "@/components/shared/error-fallback";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BASIC_BASKET_LABEL } from "@/modules/pricing/constants/basic-basket";
import { ComparisonSummaryBanner } from "@/modules/pricing/components/comparison-summary-banner";
import { ItemComparisonRow } from "@/modules/pricing/components/item-comparison-row";
import { StoreRankingCard } from "@/modules/pricing/components/store-ranking-card";
import { useOfferCityPreference } from "@/shared/hooks/use-offer-city";
import { useAddOfferToShoppingList } from "@/shared/hooks/api/offers";
import {
  usePriceComparison,
  type PricingCompareMode,
} from "@/shared/hooks/api/pricing";
import { cn } from "@/lib/utils";

const MODES: Array<{
  id: PricingCompareMode;
  label: string;
  icon: typeof Scale;
}> = [
  { id: "list", label: "Minha lista", icon: List },
  { id: "basket", label: "Cesta básica", icon: ShoppingBasket },
];

export function PriceComparatorPanel() {
  const searchParams = useSearchParams();
  const listId = searchParams.get("listId") ?? undefined;
  const initialMode = searchParams.get("mode") === "basket" ? "basket" : "list";

  const { city, setCity } = useOfferCityPreference();
  const [mode, setMode] = useState<PricingCompareMode>(initialMode);
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [addingOfferId, setAddingOfferId] = useState<string | null>(null);

  const { data, isLoading, error, refetch, isFetching } = usePriceComparison({
    city,
    mode,
    listId,
  });

  const addToShopping = useAddOfferToShoppingList();

  const filteredItems = useMemo(() => {
    if (!data || !selectedStoreId) return data?.items ?? [];
    return data.items.map((item) => {
      const candidate = item.candidates.find(
        (entry) => entry.storeId === selectedStoreId,
      );
      if (!candidate) return item;
      return {
        ...item,
        bestOffer: candidate,
        candidates: item.candidates.filter(
          (entry) => entry.storeId === selectedStoreId,
        ),
      };
    });
  }, [data, selectedStoreId]);

  async function handleAddToShopping(offerId: string) {
    setAddingOfferId(offerId);
    try {
      await addToShopping.mutateAsync(offerId);
    } finally {
      setAddingOfferId(null);
    }
  }

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          O que comparar?
        </p>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="grid grid-cols-2 gap-1 rounded-xl border bg-muted/40 p-1 sm:inline-flex sm:grid-cols-none">
            {MODES.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setMode(id);
                  setSelectedStoreId(null);
                }}
                className={cn(
                  "inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  mode === id
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="size-4 shrink-0" />
                {label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="compare-city" className="sr-only">
              Cidade
            </label>
            <input
              id="compare-city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="h-10 min-w-[160px] flex-1 rounded-xl border border-input bg-background px-3 text-sm sm:max-w-xs"
              placeholder="Cidade"
            />
            <Button
              variant="outline"
              size="sm"
              disabled={isFetching}
              onClick={() => refetch()}
            >
              Atualizar
            </Button>
          </div>
        </div>
      </section>

      {mode === "list" && (
        <p className="text-sm text-muted-foreground">
          Compara itens pendentes da sua lista de compras entre mercados
          regionais.{" "}
          <Link href="/app/shopping" className="text-primary hover:underline">
            Editar lista
          </Link>
        </p>
      )}

      {mode === "basket" && (
        <p className="text-sm text-muted-foreground">{BASIC_BASKET_LABEL}</p>
      )}

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
        </div>
      ) : error ? (
        <ErrorFallback
          compact
          title="Erro ao comparar preços"
          message={error.message}
        />
      ) : data ? (
        <>
          <ComparisonSummaryBanner summary={data.summary} city={data.city} />

          {data.storeRankings.length > 0 ? (
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold">
                  Mercados (menor total)
                </h2>
                {selectedStoreId && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedStoreId(null)}
                  >
                    Ver todos
                  </Button>
                )}
              </div>
              <div className="grid gap-3 lg:grid-cols-2">
                {data.storeRankings.map((store) => (
                  <StoreRankingCard
                    key={store.storeId}
                    store={store}
                    isCheapest={store.rank === 1}
                    onSelectOffers={(storeId) => setSelectedStoreId(storeId)}
                  />
                ))}
              </div>
            </section>
          ) : data.summary.totalItems === 0 ? (
            <EmptyState
              icon={Scale}
              title={
                mode === "list"
                  ? "Lista de compras vazia"
                  : "Nada para comparar"
              }
              description={
                mode === "list"
                  ? "Adicione itens à lista de compras ou use a cesta básica."
                  : "Selecione outra cidade com ofertas cadastradas."
              }
              action={
                mode === "list" ? (
                  <Link href="/app/shopping">
                    <Button variant="outline">Ir para compras</Button>
                  </Link>
                ) : (
                  <Link href="/app/offers">
                    <Button variant="outline">Ver ofertas</Button>
                  </Link>
                )
              }
            />
          ) : null}

          {filteredItems.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold">Por produto</h2>
              <ul className="grid gap-2">
                {filteredItems.map((item) => (
                  <ItemComparisonRow
                    key={item.itemId ?? item.itemName}
                    item={item}
                    onAddToShopping={handleAddToShopping}
                    addingOfferId={addingOfferId}
                  />
                ))}
              </ul>
            </section>
          )}

          <div className="flex flex-wrap gap-2 pt-2">
            <Link href="/app/offers">
              <Button variant="outline" size="sm">
                Explorar ofertas
              </Button>
            </Link>
            <Link
              href={listId ? `/app/shopping?listId=${listId}` : "/app/shopping"}
            >
              <Button variant="outline" size="sm">
                Lista de compras
              </Button>
            </Link>
          </div>
        </>
      ) : null}
    </div>
  );
}
