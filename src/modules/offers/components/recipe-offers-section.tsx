"use client";

import Link from "next/link";
import { ArrowRight, MapPin, Percent } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { OfferCard } from "@/modules/offers/components/offer-card";
import { OffersRegionCitySelect } from "@/modules/offers/components/offers-region-city-select";
import { OFFER_REGION_SCOPE_LABELS } from "@/modules/offers/region/constants";
import {
  DEFAULT_OFFER_CITY,
  describeRecipeOffersScope,
} from "@/modules/offers/types";
import { AsyncPanel } from "@/shared/components/async-panel";
import {
  useAddOfferToShoppingList,
  useOffersForRecipe,
  useToggleOfferFavorite,
} from "@/shared/hooks/api/offers";
import { useOfferRegionPreference } from "@/shared/hooks/use-offer-region";

type RecipeOffersSectionProps = {
  recipeId: string;
};

export function RecipeOffersSection({ recipeId }: RecipeOffersSectionProps) {
  const { region, patchRegion } = useOfferRegionPreference();
  const { data, isLoading, error } = useOffersForRecipe(recipeId, {
    city: region.city,
    state: region.state,
    radiusKm: region.radiusKm,
    scope: region.scope,
  });
  const toggleFavorite = useToggleOfferFavorite();
  const addToShopping = useAddOfferToShoppingList();

  const cityOptions =
    data?.regionCities && data.regionCities.length > 0
      ? data.regionCities
      : (data?.cities ?? [DEFAULT_OFFER_CITY]).map((c) => ({
          city: c,
          state: region.state,
          label: c,
        }));

  const city = region.city;

  const description =
    data &&
    describeRecipeOffersScope({
      matchScope: data.matchScope,
      city: data.city,
      ingredientNames: data.ingredientNames,
      alternateCities: data.alternateCities,
    });

  return (
    <Card className="surface-card" id="ofertas-receita">
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <CardTitle className="flex items-center gap-2 font-heading text-xl">
            <Percent className="size-5 text-primary" />
            Ofertas para esta receita
          </CardTitle>
          {description ? (
            <p className="text-sm text-muted-foreground">{description}</p>
          ) : null}
          {data?.matchScope === "cross_city" ? (
            <Badge variant="secondary" className="gap-1 font-normal">
              <MapPin className="size-3.5" />
              Ofertas de outras cidades
            </Badge>
          ) : null}
          <p className="text-xs text-muted-foreground">
            {region.radiusKm} km · {OFFER_REGION_SCOPE_LABELS[region.scope]}
          </p>
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <OffersRegionCitySelect
            city={region.city}
            state={region.state}
            regionCities={cityOptions}
            onSelect={(c, s) => patchRegion({ city: c, state: s })}
            className="w-full sm:min-w-[12rem]"
          />

          <Link
            href="/app/offers"
            className="inline-flex h-11 min-h-11 items-center justify-center gap-1.5 rounded-xl border border-border bg-background px-3 text-[0.8rem] font-medium hover:bg-muted"
          >
            Ver todas
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <AsyncPanel
          isLoading={isLoading}
          error={error}
          loadingFallback={
            <div className="grid gap-4 lg:grid-cols-2">
              <Skeleton className="h-72 rounded-2xl" />
              <Skeleton className="h-72 rounded-2xl" />
            </div>
          }
        >
          {data?.offers.length ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {data.offers.slice(0, 4).map((offer) => (
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
            <div className="space-y-4 text-sm text-muted-foreground">
              <p>
                Não encontramos promoções ativas para os ingredientes desta
                receita em {city}.
              </p>

              {data?.alternateCities.length ? (
                <div className="flex flex-wrap gap-2">
                  {data.alternateCities.map((item) => (
                    <Button
                      key={item.city}
                      type="button"
                      size="sm"
                      variant="outline"
                      className="min-h-11 gap-1.5"
                      onClick={() => {
                        const match = cityOptions.find(
                          (opt) => opt.city === item.city,
                        );
                        patchRegion({
                          city: item.city,
                          state: match?.state ?? region.state,
                          scope: "within_radius",
                        });
                      }}
                    >
                      <MapPin className="size-3.5" />
                      Ver em {item.city}
                      <span className="text-muted-foreground">
                        ({item.matchCount})
                      </span>
                    </Button>
                  ))}
                </div>
              ) : (
                <Link
                  href="/app/offers"
                  className="inline-flex font-medium text-primary hover:underline"
                >
                  Explorar todas as ofertas
                </Link>
              )}
            </div>
          )}
        </AsyncPanel>
      </CardContent>
    </Card>
  );
}
