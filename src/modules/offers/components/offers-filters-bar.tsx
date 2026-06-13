"use client";

import { ArrowUpDown, Search, Tag } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { OfferCategoryCatalogItem } from "@/modules/offers/types";
import {
  OFFER_SEARCH_SCOPE_LABELS,
  OFFER_SORT_LABELS,
  type OfferSearchScope,
  type OfferSortBy,
} from "@/modules/offers/utils/search";
import { cn } from "@/lib/utils";

type OffersFiltersBarProps = {
  categories: OfferCategoryCatalogItem[];
  categorySlug: string | null;
  q: string;
  searchScope: OfferSearchScope;
  sortBy: OfferSortBy;
  favoritesOnly: boolean;
  resultCount?: number;
  isSearching?: boolean;
  onCategoryChange: (categorySlug: string | null) => void;
  onQueryChange: (q: string) => void;
  onSearchScopeChange: (scope: OfferSearchScope) => void;
  onSortChange: (sort: OfferSortBy) => void;
  onFavoritesOnlyChange: (value: boolean) => void;
};

const SEARCH_SCOPES: OfferSearchScope[] = [
  "all",
  "product",
  "store",
  "category",
];

const SORT_OPTIONS: OfferSortBy[] = ["relevance", "price_asc", "discount_desc"];

const selectClassName =
  "h-10 min-h-10 w-full rounded-xl border border-input bg-background px-3 text-sm";

export function OffersFiltersBar({
  categories,
  categorySlug,
  q,
  searchScope,
  sortBy,
  favoritesOnly,
  resultCount,
  isSearching,
  onCategoryChange,
  onQueryChange,
  onSearchScopeChange,
  onSortChange,
  onFavoritesOnlyChange,
}: OffersFiltersBarProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Ex.: café, leite, Extra, laticínios…"
            className="h-11 pl-9 text-base sm:text-sm"
            inputMode="search"
            enterKeyHint="search"
            autoComplete="off"
            aria-label="Buscar ofertas"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {SEARCH_SCOPES.map((scope) => (
            <Button
              key={scope}
              type="button"
              size="sm"
              variant={searchScope === scope ? "default" : "outline"}
              className="shrink-0"
              aria-pressed={searchScope === scope}
              onClick={() => onSearchScopeChange(scope)}
            >
              {OFFER_SEARCH_SCOPE_LABELS[scope]}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex min-w-0 flex-1 items-center gap-2 text-xs text-muted-foreground">
          <ArrowUpDown className="size-3.5 shrink-0" />
          <span className="shrink-0">Ordenar</span>
          <select
            value={sortBy}
            onChange={(event) =>
              onSortChange(event.target.value as OfferSortBy)
            }
            className={cn(selectClassName, "sm:max-w-[200px]")}
            aria-label="Ordenação das ofertas"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {OFFER_SORT_LABELS[option]}
              </option>
            ))}
          </select>
        </label>
        {q.trim().length >= 2 && (
          <p className="text-xs text-muted-foreground">
            {isSearching
              ? "Buscando…"
              : `${resultCount ?? 0} resultado${resultCount === 1 ? "" : "s"}`}
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant={favoritesOnly ? "default" : "outline"}
          className="gap-1.5"
          aria-pressed={favoritesOnly}
          onClick={() => onFavoritesOnlyChange(!favoritesOnly)}
        >
          <Tag className="size-3.5" />
          Favoritas
        </Button>

        <Button
          type="button"
          size="sm"
          variant={categorySlug === null ? "default" : "outline"}
          aria-pressed={categorySlug === null}
          onClick={() => onCategoryChange(null)}
        >
          Todas
        </Button>

        {categories.map((item) => (
          <Button
            key={item.id}
            type="button"
            size="sm"
            variant={categorySlug === item.slug ? "default" : "outline"}
            className={cn("max-w-full truncate")}
            aria-pressed={categorySlug === item.slug}
            onClick={() => onCategoryChange(item.slug)}
          >
            {item.name}
          </Button>
        ))}
      </div>
    </div>
  );
}
