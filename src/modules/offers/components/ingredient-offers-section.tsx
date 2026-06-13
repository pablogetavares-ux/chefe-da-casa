"use client";

import Link from "next/link";
import { ArrowRight, Percent, Tag } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { OfferCard } from "@/modules/offers/components/offer-card";
import { OffersPersonalizationHint } from "@/modules/offers/components/offers-personalization-hint";
import { OffersRegionCitySelect } from "@/modules/offers/components/offers-region-city-select";
import { DEFAULT_OFFER_VERTICAL_SLUG } from "@/modules/offers/services/catalog";
import type { IngredientOffersResponse } from "@/modules/offers/types";
import { AsyncPanel } from "@/shared/components/async-panel";
import {
  useAddOfferToShoppingList,
  useToggleOfferFavorite,
} from "@/shared/hooks/api/offers";
import { useOfferRegionPreference } from "@/shared/hooks/use-offer-region";

type IngredientOffersSectionProps = {
  title: string;
  description: string;
  data?: IngredientOffersResponse | null;
  isLoading: boolean;
  error?: Error | null;
  emptyMessage?: string;
  id?: string;
  onRegionChange?: () => void;
  onRetry?: () => void;
};

export function IngredientOffersSection({
  title,
  description,
  data,
  isLoading,
  error,
  emptyMessage,
  id,
  onRetry,
}: IngredientOffersSectionProps) {
  const { region, patchRegion } = useOfferRegionPreference();
  const toggleFavorite = useToggleOfferFavorite();
  const addToShopping = useAddOfferToShoppingList();

  const city = data?.city ?? region.city;

  return (
    <Card className="surface-card" id={id}>
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <CardTitle className="flex items-center gap-2 font-heading text-xl">
            <Percent className="size-5 text-primary" />
            {title}
          </CardTitle>
          <p className="text-sm text-muted-foreground">{description}</p>
          <OffersPersonalizationHint userContext={data?.userContext} />
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <OffersRegionCitySelect
            city={region.city}
            state={region.state}
            regionCities={[
              { city: region.city, state: region.state, label: region.city },
            ]}
            onSelect={(c, s) => patchRegion({ city: c, state: s })}
            className="w-full sm:min-w-[12rem]"
          />
          <Link
            href={`/app/offers/${DEFAULT_OFFER_VERTICAL_SLUG}`}
            className="inline-flex h-11 min-h-11 items-center justify-center gap-1.5 rounded-xl border border-border bg-background px-3 text-[0.8rem] font-medium hover:bg-muted"
          >
            Ver supermercados
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {data?.ingredientNames.length ? (
          <div className="flex flex-wrap gap-2">
            {data.ingredientNames.slice(0, 10).map((name) => (
              <Badge key={name} variant="outline" className="gap-1 font-normal">
                <Tag className="size-3" />
                {name}
              </Badge>
            ))}
          </div>
        ) : null}

        <AsyncPanel
          isLoading={isLoading}
          error={error ?? null}
          onRetry={onRetry}
          loadingFallback={
            <div className="grid gap-4 lg:grid-cols-2">
              <Skeleton className="h-72 rounded-2xl" />
              <Skeleton className="h-72 rounded-2xl" />
            </div>
          }
        >
          {data?.offers.length ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {data.offers.map((offer) => (
                <OfferCard
                  key={offer.id}
                  offer={offer}
                  compact
                  showMatchBadges
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
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                {emptyMessage ??
                  (data?.ingredientNames.length
                    ? `Nenhuma promoção ativa para esses itens em ${city}.`
                    : "Nenhum ingrediente para buscar ofertas no momento.")}
              </p>
              {data?.ingredientNames.length ? (
                <Link
                  href="/app/offers"
                  className="inline-flex font-medium text-primary hover:underline"
                >
                  Explorar Central de Ofertas
                </Link>
              ) : null}
            </div>
          )}
        </AsyncPanel>
      </CardContent>
    </Card>
  );
}
