"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Clock, Percent } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { OfferCard } from "@/modules/offers/components/offer-card";
import { OffersFiltersBar } from "@/modules/offers/components/offers-filters-bar";
import { OffersRegionBar } from "@/modules/offers/components/offers-region-bar";
import { OfferVerticalIcon } from "@/modules/offers/constants/vertical-icons";
import { DEFAULT_OFFER_VERTICAL_SLUG } from "@/modules/offers/services/catalog";
import { AsyncPanel } from "@/shared/components/async-panel";
import {
  useAddOfferToShoppingList,
  useOffers,
  useOffersHub,
  useToggleOfferFavorite,
  useUpdateOfferRegion,
} from "@/shared/hooks/api/offers";
import type { StoredOfferRegion } from "@/modules/offers/utils/region-preference";
import { useOfferRegionPreference } from "@/shared/hooks/use-offer-region";

type OffersPanelProps = {
  verticalSlug?: string;
  verticalName?: string;
};

export function OffersPanel({
  verticalSlug = DEFAULT_OFFER_VERTICAL_SLUG,
  verticalName,
}: OffersPanelProps) {
  const { data: hubData } = useOffersHub();
  const hubVertical = hubData?.verticals.find(
    (item) => item.slug === verticalSlug,
  );
  const isVerticalActive =
    hubVertical?.isActive ?? verticalSlug === "supermarket";

  const {
    region,
    patchRegion: patchRegionBase,
    applyApiRegion,
  } = useOfferRegionPreference({
    syncServerConfig: true,
  });
  const syncedApiRegionRef = useRef(false);
  const regionRef = useRef(region);

  useEffect(() => {
    regionRef.current = region;
  }, [region]);

  const persistTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [categorySlug, setCategorySlug] = useState<string | null>(null);
  const [qInput, setQInput] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [searchScope, setSearchScope] =
    useState<import("@/modules/offers/utils/search").OfferSearchScope>("all");
  const [sortBy, setSortBy] =
    useState<import("@/modules/offers/utils/search").OfferSortBy>("relevance");
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  const handleQueryChange = useCallback((value: string) => {
    setQInput(value);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      const trimmed = value.trim();
      if (trimmed.length === 0 || trimmed.length >= 2) {
        setDebouncedQ(value);
      }
    }, 350);
  }, []);

  useEffect(
    () => () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    },
    [],
  );

  const filters = useMemo(
    () => ({
      city: region.city,
      state: region.state,
      radiusKm: region.radiusKm,
      scope: region.scope,
      verticalSlug,
      categorySlug,
      q: debouncedQ,
      searchScope,
      sortBy,
      favoritesOnly,
    }),
    [
      region,
      verticalSlug,
      categorySlug,
      debouncedQ,
      searchScope,
      sortBy,
      favoritesOnly,
    ],
  );

  const isSearchPending = qInput.trim() !== debouncedQ.trim();

  const { data, isLoading, error, isFetching, refetch } = useOffers(filters, {
    enabled: isVerticalActive,
  });

  useEffect(() => {
    if (!data?.region || syncedApiRegionRef.current) return;
    applyApiRegion(data.region);
    syncedApiRegionRef.current = true;
  }, [data?.region, applyApiRegion]);
  const updateRegion = useUpdateOfferRegion();
  const toggleFavorite = useToggleOfferFavorite();
  const addToShopping = useAddOfferToShoppingList();

  const schedulePersistRegion = useCallback(() => {
    if (persistTimerRef.current) clearTimeout(persistTimerRef.current);
    persistTimerRef.current = setTimeout(() => {
      const current = regionRef.current;
      updateRegion.mutate({
        city: current.city,
        state: current.state,
        radiusKm: current.radiusKm,
      });
    }, 700);
  }, [updateRegion]);

  const patchRegion = useCallback(
    (patch: Partial<StoredOfferRegion>) => {
      patchRegionBase(patch);
      if (
        patch.city !== undefined ||
        patch.state !== undefined ||
        patch.radiusKm !== undefined
      ) {
        schedulePersistRegion();
      }
    },
    [patchRegionBase, schedulePersistRegion],
  );

  useEffect(
    () => () => {
      if (persistTimerRef.current) clearTimeout(persistTimerRef.current);
    },
    [],
  );

  const categoryCatalog = useMemo(
    () => data?.categoryCatalog ?? [],
    [data?.categoryCatalog],
  );

  const emptyOffersCopy = useMemo(() => {
    if (categorySlug) {
      const label =
        categoryCatalog.find((item) => item.slug === categorySlug)?.name ??
        "esta categoria";
      return {
        title: `Nenhuma oferta em ${label}`,
        description:
          "Não há promoções ativas nessa categoria na sua região. Toque em Todas ou escolha outra categoria.",
      };
    }
    if (favoritesOnly) {
      return {
        title: "Nenhuma favorita na região",
        description:
          "Favorite ofertas nos cards (ícone de coração) para vê-las aqui.",
      };
    }
    if (debouncedQ.trim()) {
      return {
        title: "Nenhum resultado na busca",
        description: data?.meta?.searchExpanded
          ? `Não há “${debouncedQ.trim()}” na região atual nem em outras cidades com ofertas ativas.`
          : `Não encontramos “${debouncedQ.trim()}” perto de ${region.city}. Tente Produto/Loja, aumente o raio ou escolha “Todo o Brasil”.`,
      };
    }
    return {
      title: "Nenhuma oferta nesta região",
      description:
        "Ajuste o raio, troque o escopo (Dentro do raio / Todo o Brasil) ou escolha outra cidade.",
    };
  }, [
    categorySlug,
    categoryCatalog,
    favoritesOnly,
    debouncedQ,
    data?.meta?.searchExpanded,
    region.city,
  ]);

  if (!isVerticalActive) {
    const label = verticalName ?? hubVertical?.name ?? "Esta categoria";
    return (
      <EmptyState
        icon={Clock}
        title={`${label} — em breve`}
        description={
          hubVertical?.description ??
          "Estamos preparando parceiros e ofertas para esta categoria. Enquanto isso, explore os supermercados."
        }
        action={
          <Link
            href="/app/offers/supermarket"
            className={cn(buttonVariants({ variant: "default", size: "sm" }))}
          >
            Ver supermercados
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      {hubVertical && (
        <div className="flex items-center gap-3 rounded-2xl border bg-card/60 px-4 py-3">
          <OfferVerticalIcon
            slug={hubVertical.slug}
            iconKey={hubVertical.iconKey}
            size="sm"
          />
          <div className="min-w-0">
            <p className="text-sm font-medium">{hubVertical.name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {hubVertical.description}
            </p>
          </div>
        </div>
      )}

      <OffersRegionBar
        region={region}
        regionCities={data?.regionCities}
        onChange={patchRegion}
        onPersist={() =>
          updateRegion.mutate({
            city: region.city,
            state: region.state,
            radiusKm: region.radiusKm,
          })
        }
        persistPending={updateRegion.isPending}
      />

      {data?.meta?.searchExpanded &&
        debouncedQ.trim() &&
        (data?.offers.length ?? 0) > 0 && (
          <p className="rounded-xl border border-amber-500/30 bg-amber-500/8 px-4 py-2.5 text-sm text-amber-900 dark:text-amber-100">
            Não encontramos “{debouncedQ.trim()}” em {region.city}. Exibindo
            ofertas de outras cidades.
          </p>
        )}

      <OffersFiltersBar
        categories={categoryCatalog}
        categorySlug={categorySlug}
        q={qInput}
        searchScope={searchScope}
        sortBy={sortBy}
        favoritesOnly={favoritesOnly}
        resultCount={data?.meta?.total ?? data?.offers.length}
        isSearching={isSearchPending || (isFetching && Boolean(debouncedQ))}
        onCategoryChange={setCategorySlug}
        onQueryChange={handleQueryChange}
        onSearchScopeChange={setSearchScope}
        onSortChange={setSortBy}
        onFavoritesOnlyChange={setFavoritesOnly}
      />

      <AsyncPanel
        isLoading={isLoading || isSearchPending}
        error={error}
        onRetry={() => void refetch()}
        loadingFallback={
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <Skeleton key={item} className="h-80 rounded-2xl" />
            ))}
          </div>
        }
      >
        {data?.offers.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {data.offers.map((offer, index) => (
              <OfferCard
                key={offer.id}
                offer={offer}
                priority={index < 3}
                favoritePending={toggleFavorite.isPending}
                shoppingPending={addToShopping.isPending}
                onToggleFavorite={(item) =>
                  toggleFavorite.mutate({
                    offerId: item.id,
                    isFavorite: Boolean(item.isFavorite),
                  })
                }
                onAddToShopping={(item) => addToShopping.mutate(item.id)}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Percent}
            title={emptyOffersCopy.title}
            description={emptyOffersCopy.description}
          />
        )}
      </AsyncPanel>
    </div>
  );
}
