import type { OfferCategoryCatalogItem } from "@/modules/offers/types";
import type { RegionalOffer } from "@/modules/offers/types";

import {
  normalizeOfferText,
  termsMatch,
} from "@/modules/offers/utils/matching";

export type OfferSearchScope = "all" | "product" | "store" | "category";

export type OfferSortBy = "relevance" | "price_asc" | "discount_desc";

export const OFFER_SEARCH_SCOPE_LABELS: Record<OfferSearchScope, string> = {
  all: "Tudo",
  product: "Produto",
  store: "Loja",
  category: "Categoria",
};

export const OFFER_SORT_LABELS: Record<OfferSortBy, string> = {
  relevance: "Relevância",
  price_asc: "Menor preço",
  discount_desc: "Maior desconto",
};

function tokenizeQuery(query: string): string[] {
  return normalizeOfferText(query)
    .split(" ")
    .filter((token) => token.length >= 2);
}

function productFields(offer: RegionalOffer): string[] {
  return [
    offer.title,
    offer.product_name,
    offer.description ?? "",
    ...(offer.ingredient_keywords ?? []),
  ];
}

function storeFields(offer: RegionalOffer): string[] {
  return [
    offer.store.name,
    offer.store.chain,
    offer.store.neighborhood ?? "",
    offer.store.city,
  ];
}

export function offerMatchesProductSearch(
  offer: RegionalOffer,
  query: string,
): boolean {
  const normalizedQuery = normalizeOfferText(query);
  if (!normalizedQuery) return true;

  return productFields(offer).some((field) => termsMatch(query, field));
}

export function offerMatchesStoreSearch(
  offer: RegionalOffer,
  query: string,
): boolean {
  const normalizedQuery = normalizeOfferText(query);
  if (!normalizedQuery) return true;

  return storeFields(offer).some((field) => termsMatch(query, field));
}

export function offerMatchesCategorySearch(
  offer: RegionalOffer,
  query: string,
  categoryCatalog: OfferCategoryCatalogItem[],
): boolean {
  const normalizedQuery = normalizeOfferText(query);
  if (!normalizedQuery) return true;

  const category = categoryCatalog.find(
    (item) =>
      item.id === offer.category_id || item.legacyEnum === offer.category,
  );

  if (category && termsMatch(query, category.name)) {
    return true;
  }

  return termsMatch(query, offer.category);
}

export function offerMatchesSearch(
  offer: RegionalOffer,
  query: string,
  scope: OfferSearchScope,
  categoryCatalog: OfferCategoryCatalogItem[],
): boolean {
  const trimmed = query.trim();
  if (!trimmed) return true;

  switch (scope) {
    case "product":
      return offerMatchesProductSearch(offer, trimmed);
    case "store":
      return offerMatchesStoreSearch(offer, trimmed);
    case "category":
      return offerMatchesCategorySearch(offer, trimmed, categoryCatalog);
    default:
      return (
        offerMatchesProductSearch(offer, trimmed) ||
        offerMatchesStoreSearch(offer, trimmed) ||
        offerMatchesCategorySearch(offer, trimmed, categoryCatalog)
      );
  }
}

/** Pontuação 0–100 para ordenação por relevância. */
export function scoreOfferSearchRelevance(
  offer: RegionalOffer,
  query: string,
  scope: OfferSearchScope,
  categoryCatalog: OfferCategoryCatalogItem[],
): number {
  const trimmed = query.trim();
  if (!trimmed) return 0;

  const tokens = tokenizeQuery(trimmed);
  let score = 0;

  const bump = (value: number) => {
    score += value;
  };

  const productNorm = normalizeOfferText(offer.product_name);
  const titleNorm = normalizeOfferText(offer.title);
  const queryNorm = normalizeOfferText(trimmed);

  if (scope === "all" || scope === "product") {
    if (productNorm === queryNorm || titleNorm === queryNorm) bump(50);
    else if (productNorm.includes(queryNorm) || titleNorm.includes(queryNorm)) {
      bump(35);
    }

    for (const token of tokens) {
      if (productNorm.includes(token)) bump(12);
      if (titleNorm.includes(token)) bump(8);
      if (
        (offer.ingredient_keywords ?? []).some((kw) => termsMatch(token, kw))
      ) {
        bump(10);
      }
    }

    if ((offer.discountPercent ?? 0) >= 20) bump(5);
  }

  if (scope === "all" || scope === "store") {
    for (const field of storeFields(offer)) {
      if (termsMatch(trimmed, field)) bump(28);
      for (const token of tokens) {
        if (termsMatch(token, field)) bump(8);
      }
    }
  }

  if (scope === "all" || scope === "category") {
    const category = categoryCatalog.find(
      (item) =>
        item.id === offer.category_id || item.legacyEnum === offer.category,
    );
    if (category && termsMatch(trimmed, category.name)) bump(22);
  }

  return Math.min(100, score);
}

export function sortRegionalOffers(
  offers: RegionalOffer[],
  sortBy: OfferSortBy,
  options?: { hasQuery?: boolean; preferDistance?: boolean },
): RegionalOffer[] {
  const list = [...offers];

  if (sortBy === "price_asc") {
    return list.sort(
      (a, b) =>
        a.current_price - b.current_price ||
        (b.discountPercent ?? 0) - (a.discountPercent ?? 0),
    );
  }

  if (sortBy === "discount_desc") {
    return list.sort(
      (a, b) =>
        (b.discountPercent ?? 0) - (a.discountPercent ?? 0) ||
        a.current_price - b.current_price,
    );
  }

  // relevance (default)
  if (options?.hasQuery) {
    return list.sort(
      (a, b) =>
        (b.searchRelevance ?? 0) - (a.searchRelevance ?? 0) ||
        (b.discountPercent ?? 0) - (a.discountPercent ?? 0) ||
        a.current_price - b.current_price,
    );
  }

  if (options?.preferDistance) {
    return list.sort(
      (a, b) =>
        (a.distanceKm ?? 999) - (b.distanceKm ?? 999) ||
        (b.discountPercent ?? 0) - (a.discountPercent ?? 0),
    );
  }

  return list.sort(
    (a, b) =>
      (b.discountPercent ?? 0) - (a.discountPercent ?? 0) ||
      a.current_price - b.current_price,
  );
}

/** Filtro PostgREST `.or()` para busca inicial no banco (produto). */
export function buildProductSearchOrFilter(query: string): string | null {
  const trimmed = query.trim();
  if (trimmed.length < 2) return null;

  const escaped = trimmed.replace(/[%_,"]/g, "");
  if (!escaped) return null;

  const pattern = `%${escaped}%`;
  return [
    `title.ilike.${pattern}`,
    `product_name.ilike.${pattern}`,
    `description.ilike.${pattern}`,
  ].join(",");
}

export function filterStoreIdsBySearch(
  stores: {
    id: string;
    name: string;
    chain: string;
    neighborhood: string | null;
  }[],
  query: string,
): string[] {
  const trimmed = query.trim();
  if (!trimmed) return [];

  return stores
    .filter((store) =>
      [store.name, store.chain, store.neighborhood ?? ""].some((field) =>
        termsMatch(trimmed, field),
      ),
    )
    .map((store) => store.id);
}
