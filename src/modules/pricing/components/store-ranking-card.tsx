"use client";

import { Crown, MapPin, Store } from "lucide-react";

import { formatShoppingMoney } from "@/modules/shopping/services/savings";
import type { StoreBasketTotal } from "@/modules/pricing/types";
import { cn } from "@/lib/utils";

type StoreRankingCardProps = {
  store: StoreBasketTotal;
  isCheapest?: boolean;
  onSelectOffers?: (storeId: string) => void;
};

export function StoreRankingCard({
  store,
  isCheapest,
  onSelectOffers,
}: StoreRankingCardProps) {
  return (
    <article
      className={cn(
        "surface-card relative overflow-hidden p-4 transition-shadow sm:p-5",
        isCheapest && "ring-2 ring-primary/40",
      )}
    >
      {isCheapest && (
        <div className="absolute right-0 top-0 rounded-bl-xl bg-primary px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-primary-foreground">
          Mais barato
        </div>
      )}

      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold",
            isCheapest
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground",
          )}
        >
          {store.rank === 1 ? <Crown className="size-4" /> : `#${store.rank}`}
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <div>
            <h3 className="font-semibold leading-tight">{store.storeChain}</h3>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <Store className="size-3" />
              {store.storeName}
            </p>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="size-3" />
              {store.storeCity}
            </p>
          </div>

          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-2xl font-bold tracking-tight text-primary">
                {formatShoppingMoney(store.subtotal)}
              </p>
              <p className="text-xs text-muted-foreground">
                {store.matchedItems}/{store.totalItems} itens encontrados (
                {store.coveragePercent}%)
              </p>
            </div>

            {store.estimatedSavings > 0 && (
              <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                +{formatShoppingMoney(store.estimatedSavings)} vs. mais barato
              </p>
            )}
          </div>

          {store.missingItems > 0 && (
            <p className="text-xs text-amber-600 dark:text-amber-400">
              {store.missingItems} item{store.missingItems !== 1 ? "s" : ""} sem
              oferta neste mercado
            </p>
          )}

          {onSelectOffers && store.lineItems.length > 0 && (
            <button
              type="button"
              className="text-xs font-medium text-primary hover:underline"
              onClick={() => onSelectOffers(store.storeId)}
            >
              Ver {store.lineItems.length} produto
              {store.lineItems.length !== 1 ? "s" : ""} mapeados
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
