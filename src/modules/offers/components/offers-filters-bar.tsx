"use client";

import { Search, Tag } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  OFFER_CATEGORY_LABELS,
  type OfferCategory,
} from "@/modules/offers/types";
import { cn } from "@/lib/utils";

type OffersFiltersBarProps = {
  categories: OfferCategory[];
  category: OfferCategory | null;
  q: string;
  favoritesOnly: boolean;
  onCategoryChange: (category: OfferCategory | null) => void;
  onQueryChange: (q: string) => void;
  onFavoritesOnlyChange: (value: boolean) => void;
};

export function OffersFiltersBar({
  categories,
  category,
  q,
  favoritesOnly,
  onCategoryChange,
  onQueryChange,
  onFavoritesOnlyChange,
}: OffersFiltersBarProps) {
  return (
    <div className="space-y-4">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Buscar produto ou mercado..."
          className="pl-9"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant={favoritesOnly ? "default" : "outline"}
          className="gap-1.5"
          onClick={() => onFavoritesOnlyChange(!favoritesOnly)}
        >
          <Tag className="size-3.5" />
          Favoritas
        </Button>

        <Button
          type="button"
          size="sm"
          variant={category === null ? "default" : "outline"}
          onClick={() => onCategoryChange(null)}
        >
          Todas
        </Button>

        {categories.map((item) => (
          <Button
            key={item}
            type="button"
            size="sm"
            variant={category === item ? "default" : "outline"}
            className={cn("max-w-full truncate")}
            onClick={() => onCategoryChange(item)}
          >
            {OFFER_CATEGORY_LABELS[item]}
          </Button>
        ))}
      </div>
    </div>
  );
}
