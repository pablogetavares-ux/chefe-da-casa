"use client";

import Link from "next/link";
import { Percent, Sparkles, Tag } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DEFAULT_OFFER_VERTICAL_SLUG } from "@/modules/offers/services/catalog";
import { formatShoppingMoney } from "@/modules/shopping/services/savings";
import type { ShoppingOfferMatch } from "@/modules/shopping/types";

type ShoppingOfferMatchesProps = {
  matches: ShoppingOfferMatch[];
  onLink: (itemId: string, offerId: string) => void;
  linking?: boolean;
  personalizationHint?: string | null;
};

export function ShoppingOfferMatches({
  matches,
  onLink,
  linking,
  personalizationHint,
}: ShoppingOfferMatchesProps) {
  if (matches.length === 0) return null;

  const totalSavings = matches.reduce(
    (sum, match) => sum + match.estimatedSavings,
    0,
  );

  return (
    <section className="space-y-3 rounded-2xl border border-primary/20 bg-primary/5 p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Percent className="size-4 text-primary" />
            <h2 className="text-sm font-semibold">
              {matches.length} item{matches.length !== 1 ? "s" : ""} da lista em
              promoção
            </h2>
          </div>
          {totalSavings > 0 ? (
            <p className="text-xs text-muted-foreground">
              Economia potencial de{" "}
              <span className="font-medium text-emerald-700 dark:text-emerald-400">
                {formatShoppingMoney(totalSavings)}
              </span>
            </p>
          ) : null}
          {personalizationHint ? (
            <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
              <Sparkles className="mt-0.5 size-3 shrink-0 text-primary" />
              {personalizationHint}
            </p>
          ) : null}
        </div>
        <Link href={`/app/offers/${DEFAULT_OFFER_VERTICAL_SLUG}`}>
          <Button size="sm" variant="ghost" className="h-8">
            Ver todas
          </Button>
        </Link>
      </div>

      <ul className="grid gap-2">
        {matches.map((match) => (
          <li
            key={`${match.itemId}-${match.offerId}`}
            className="surface-card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0 space-y-1">
              <p className="text-sm font-medium">{match.itemName}</p>
              <p className="text-xs text-muted-foreground">
                {match.offerTitle} · {match.storeChain} ({match.storeCity})
              </p>
              <p className="flex flex-wrap items-center gap-2 text-sm">
                <span className="font-semibold text-primary">
                  {formatShoppingMoney(match.currentPrice)}
                </span>
                {match.previousPrice != null &&
                  match.previousPrice > match.currentPrice && (
                    <span className="text-xs text-muted-foreground line-through">
                      {formatShoppingMoney(match.previousPrice)}
                    </span>
                  )}
                {match.estimatedSavings > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                    <Tag className="size-3" />
                    Economize {formatShoppingMoney(match.estimatedSavings)}
                  </span>
                )}
              </p>
            </div>

            <div className="flex shrink-0 flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={linking}
                onClick={() => onLink(match.itemId, match.offerId)}
              >
                Vincular à lista
              </Button>
              <Link href={`/app/offers/${DEFAULT_OFFER_VERTICAL_SLUG}`}>
                <Button size="sm" variant="ghost">
                  Ver ofertas
                </Button>
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
