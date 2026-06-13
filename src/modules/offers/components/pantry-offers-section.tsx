"use client";

import Link from "next/link";
import { ArrowRight, PackageOpen, Percent } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { OfferCard } from "@/modules/offers/components/offer-card";
import { OffersPersonalizationHint } from "@/modules/offers/components/offers-personalization-hint";
import { OffersRegionCitySelect } from "@/modules/offers/components/offers-region-city-select";
import { DEFAULT_OFFER_VERTICAL_SLUG } from "@/modules/offers/services/catalog";
import { AsyncPanel } from "@/shared/components/async-panel";
import {
  useAddOfferToShoppingList,
  useOffersForPantry,
  useToggleOfferFavorite,
} from "@/shared/hooks/api/offers";
import { useOfferRegionPreference } from "@/shared/hooks/use-offer-region";

export function PantryOffersSection() {
  const { region, patchRegion } = useOfferRegionPreference();
  const { data, isLoading, error, refetch } = useOffersForPantry({
    city: region.city,
    state: region.state,
    radiusKm: region.radiusKm,
  });
  const toggleFavorite = useToggleOfferFavorite();
  const addToShopping = useAddOfferToShoppingList();

  return (
    <Card className="surface-card" id="ofertas-despensa">
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <CardTitle className="flex items-center gap-2 font-heading text-xl">
            <Percent className="size-5 text-primary" />
            Promoções para itens em falta
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Ingredientes das suas receitas e lista que ainda não estão na
            despensa — com ofertas na sua região.
          </p>
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
        {data?.gaps.length ? (
          <div className="flex flex-wrap gap-2">
            {data.gaps.slice(0, 8).map((gap) => (
              <Badge
                key={`${gap.source}-${gap.ingredientName}`}
                variant="outline"
                className="gap-1 font-normal"
              >
                <PackageOpen className="size-3" />
                {gap.ingredientName}
              </Badge>
            ))}
          </div>
        ) : null}

        <AsyncPanel
          isLoading={isLoading}
          error={error}
          onRetry={() => void refetch()}
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
                {data?.gaps.length
                  ? `Nenhuma promoção ativa para os itens em falta em ${region.city}.`
                  : "Sua despensa cobre os ingredientes recentes — nada em falta no momento."}
              </p>
              {data?.gaps.length ? (
                <Link
                  href={`/app/offers/${DEFAULT_OFFER_VERTICAL_SLUG}`}
                  className="inline-flex font-medium text-primary hover:underline"
                >
                  Explorar ofertas do supermercado
                </Link>
              ) : (
                <Link href="/app/generate">
                  <Button size="sm" variant="outline">
                    Gerar receita com IA
                  </Button>
                </Link>
              )}
            </div>
          )}
        </AsyncPanel>
      </CardContent>
    </Card>
  );
}
