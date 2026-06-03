"use client";

import Link from "next/link";
import { Percent, Tag } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatShoppingMoney } from "@/modules/shopping/services/savings";
import type { ShoppingOfferMatch } from "@/modules/shopping/types";

type ShoppingOfferMatchesProps = {
  matches: ShoppingOfferMatch[];
  onLink: (itemId: string, offerId: string) => void;
  linking?: boolean;
};

export function ShoppingOfferMatches({
  matches,
  onLink,
  linking,
}: ShoppingOfferMatchesProps) {
  if (matches.length === 0) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <Percent className="size-4 text-primary" />
        <h2 className="text-sm font-semibold">Ofertas para seus itens</h2>
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
              <Link href="/app/offers">
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
