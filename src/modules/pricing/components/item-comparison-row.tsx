"use client";

import { ChevronDown, ChevronUp, ShoppingCart } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { formatShoppingMoney } from "@/modules/shopping/services/savings";
import type { ItemComparisonResult } from "@/modules/pricing/types";
import { cn } from "@/lib/utils";

type ItemComparisonRowProps = {
  item: ItemComparisonResult;
  onAddToShopping?: (offerId: string) => void;
  addingOfferId?: string | null;
};

export function ItemComparisonRow({
  item,
  onAddToShopping,
  addingOfferId,
}: ItemComparisonRowProps) {
  const [expanded, setExpanded] = useState(false);
  const hasCandidates = item.candidates.length > 0;

  return (
    <li className="surface-card overflow-hidden">
      <div className="flex items-center gap-3 p-4">
        <div className="min-w-0 flex-1">
          <p className="font-medium">{item.itemName}</p>
          {item.bestOffer ? (
            <p className="mt-0.5 text-sm text-muted-foreground">
              Melhor:{" "}
              <span className="font-semibold text-primary">
                {formatShoppingMoney(item.bestOffer.currentPrice)}
              </span>{" "}
              · {item.bestOffer.storeChain}
            </p>
          ) : (
            <p className="mt-0.5 text-sm text-muted-foreground">
              Sem oferta encontrada
            </p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {item.bestOffer && onAddToShopping && (
            <Button
              size="sm"
              variant="outline"
              className="gap-1"
              disabled={addingOfferId === item.bestOffer.offerId}
              onClick={() => onAddToShopping(item.bestOffer!.offerId)}
            >
              <ShoppingCart className="size-3.5" />
              Lista
            </Button>
          )}
          {hasCandidates && item.candidates.length > 1 && (
            <Button
              size="icon-sm"
              variant="ghost"
              aria-label={expanded ? "Recolher" : "Ver mercados"}
              onClick={() => setExpanded((value) => !value)}
            >
              {expanded ? (
                <ChevronUp className="size-4" />
              ) : (
                <ChevronDown className="size-4" />
              )}
            </Button>
          )}
        </div>
      </div>

      {expanded && hasCandidates && (
        <ul className="border-t bg-muted/30 px-4 py-2">
          {item.candidates.map((candidate) => (
            <li
              key={candidate.offerId}
              className={cn(
                "flex items-center justify-between gap-3 py-2 text-sm",
                candidate.offerId === item.bestOffer?.offerId &&
                  "font-medium text-primary",
              )}
            >
              <span className="min-w-0 truncate">
                {candidate.storeChain} · {candidate.productName}
              </span>
              <span className="shrink-0">
                {formatShoppingMoney(candidate.currentPrice)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}
