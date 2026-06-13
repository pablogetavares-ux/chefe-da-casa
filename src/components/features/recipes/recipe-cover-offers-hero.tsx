"use client";

import Link from "next/link";
import {
  ArrowRight,
  ChevronRight,
  MapPin,
  Percent,
  ShoppingCart,
  Sparkles,
  Store,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { OfferVerticalIcon } from "@/modules/offers/constants/vertical-icons";
import { DEFAULT_OFFER_VERTICAL_SLUG } from "@/modules/offers/services/catalog";
import {
  collectMatchedIngredientLabels,
  describeRecipeHeroMode,
  formatOfferPrice,
  type RegionalOffer,
} from "@/modules/offers/types";
import {
  useAddOfferToShoppingList,
  useOffersForRecipe,
  useOffersHub,
} from "@/shared/hooks/api/offers";
import { useOfferRegionPreference } from "@/shared/hooks/use-offer-region";
import { cn } from "@/lib/utils";

type RecipeCoverOffersHeroProps = {
  recipeId: string;
  recipeTitle: string;
  className?: string;
};

function HeroOfferTile({
  offer,
  onAddToShopping,
  pending,
}: {
  offer: RegionalOffer;
  onAddToShopping: (offer: RegionalOffer) => void;
  pending: boolean;
}) {
  const hasDiscount =
    offer.previous_price != null && offer.previous_price > offer.current_price;

  return (
    <article className="flex min-w-0 flex-1 flex-col rounded-xl border border-white/15 bg-background/90 p-3 shadow-sm backdrop-blur-sm dark:bg-background/80">
      <div className="flex items-start justify-between gap-2">
        <p className="line-clamp-2 text-sm font-semibold leading-snug">
          {offer.title}
        </p>
        {offer.discountPercent ? (
          <Badge className="shrink-0 bg-emerald-600 text-[10px] hover:bg-emerald-600">
            −{offer.discountPercent}%
          </Badge>
        ) : null}
      </div>

      <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
        <span className="text-lg font-bold tabular-nums text-primary">
          {formatOfferPrice(offer.current_price)}
        </span>
        {hasDiscount ? (
          <span className="text-xs text-muted-foreground line-through tabular-nums">
            {formatOfferPrice(offer.previous_price!)}
          </span>
        ) : null}
      </div>

      <p className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
        <Store className="size-3 shrink-0" aria-hidden />
        <span className="truncate">
          {offer.store.chain} · {offer.store.name}
        </span>
      </p>

      {offer.matchedIngredients && offer.matchedIngredients.length > 0 ? (
        <p className="mt-1 text-[10px] text-emerald-700 dark:text-emerald-400">
          Combina com: {offer.matchedIngredients.slice(0, 2).join(", ")}
        </p>
      ) : null}

      <Button
        type="button"
        size="sm"
        variant="secondary"
        className="mt-3 h-9 w-full gap-1.5 text-xs"
        disabled={pending}
        onClick={() => onAddToShopping(offer)}
      >
        <ShoppingCart className="size-3.5" aria-hidden />
        Adicionar à lista
      </Button>
    </article>
  );
}

function HeroExploreFallback({ city }: { city: string }) {
  const { data: hub } = useOffersHub();
  const activeVerticals = (hub?.verticals ?? []).filter((v) => v.isActive);

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Explore promoções em {city} — mercado, farmácia, pet shop e mais.
      </p>
      <div className="flex flex-wrap gap-2">
        {activeVerticals.slice(0, 4).map((vertical) => (
          <Link
            key={vertical.id}
            href={`/app/offers/${vertical.slug}`}
            className="inline-flex items-center gap-2 rounded-xl border bg-background/80 px-3 py-2 text-xs font-medium transition-colors hover:border-primary/40 hover:bg-background"
          >
            <OfferVerticalIcon
              slug={vertical.slug}
              iconKey={vertical.iconKey}
              size="sm"
            />
            {vertical.name}
            {vertical.activeOfferCount && vertical.activeOfferCount > 0 ? (
              <span className="text-muted-foreground">
                ({vertical.activeOfferCount})
              </span>
            ) : null}
          </Link>
        ))}
      </div>
      <Link
        href="/app/offers"
        className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
      >
        Abrir Central de Ofertas
        <ArrowRight className="size-4" />
      </Link>
    </div>
  );
}

export function RecipeCoverOffersHero({
  recipeId,
  recipeTitle,
  className,
}: RecipeCoverOffersHeroProps) {
  const { region, hydrated } = useOfferRegionPreference({
    syncServerConfig: true,
  });
  const { data, isLoading, error } = useOffersForRecipe(recipeId, {
    city: region.city,
    state: region.state,
    radiusKm: region.radiusKm,
    scope: region.scope,
    enabled: hydrated,
  });
  const addToShopping = useAddOfferToShoppingList();

  const heroOffers = data?.heroOffers ?? [];
  const heroMode = data?.heroMode ?? "explore";
  const matchedLabels = collectMatchedIngredientLabels(
    heroMode === "ingredients" ? (data?.offers ?? heroOffers) : heroOffers,
  );
  const subtitle = data
    ? describeRecipeHeroMode(heroMode, data.city, {
        heroOfferCount: heroOffers.length,
        matchedIngredientLabels:
          heroMode === "ingredients"
            ? matchedLabels
            : collectMatchedIngredientLabels(heroOffers),
        totalOfferCount: data.offers.length,
      })
    : "Carregando ofertas da sua região…";

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-xl border shadow-md",
        "min-h-[280px] w-full sm:aspect-[16/10] sm:min-h-[220px]",
        className,
      )}
      aria-label={`Ofertas para ${recipeTitle}`}
    >
      <div
        className="absolute inset-0 bg-gradient-to-br from-primary/20 via-emerald-500/10 to-accent/25 dark:from-primary/25 dark:via-emerald-950/40 dark:to-background"
        aria-hidden
      />
      <div
        className="absolute inset-0 opacity-[0.07] dark:opacity-[0.12]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
          backgroundSize: "24px 24px",
        }}
        aria-hidden
      />

      <div className="relative flex h-full flex-col p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <Badge
              variant="secondary"
              className="gap-1 border-emerald-500/30 bg-emerald-500/15 text-emerald-800 dark:text-emerald-300"
            >
              <Percent className="size-3" aria-hidden />
              Central de Ofertas
            </Badge>
            <h2 className="font-heading text-base font-semibold leading-tight sm:text-lg">
              Economize nos ingredientes
            </h2>
            <p className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground sm:text-sm">
              <Sparkles
                className="size-3.5 shrink-0 text-primary"
                aria-hidden
              />
              {subtitle}
            </p>
            {data ? (
              <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <MapPin className="size-3" aria-hidden />
                {data.city} — {data.radiusKm} km
              </p>
            ) : null}
          </div>

          <Link
            href="#ofertas-receita"
            className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-background/80 px-3 py-2 text-xs font-medium shadow-sm backdrop-blur-sm transition-colors hover:bg-background"
          >
            Ver todas
            <ChevronRight className="size-4" aria-hidden />
          </Link>
        </div>

        <div className="mt-3 flex flex-1 flex-col justify-end">
          {isLoading ? (
            <div className="grid gap-2 sm:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-[132px] rounded-xl" />
              ))}
            </div>
          ) : error ? (
            <p className="rounded-xl border border-dashed bg-background/60 p-4 text-sm text-muted-foreground">
              Não foi possível carregar ofertas.{" "}
              <Link href="/app/offers" className="text-primary hover:underline">
                Ver Central de Ofertas
              </Link>
            </p>
          ) : heroOffers.length > 0 ? (
            <div className="flex flex-col gap-2 sm:grid sm:grid-cols-3">
              {heroOffers.map((offer) => (
                <HeroOfferTile
                  key={offer.id}
                  offer={offer}
                  pending={addToShopping.isPending}
                  onAddToShopping={(item) => addToShopping.mutate(item.id)}
                />
              ))}
            </div>
          ) : (
            <HeroExploreFallback city={data?.city ?? region.city} />
          )}

          {heroMode === "regional" && heroOffers.length > 0 ? (
            <p className="mt-2 text-[10px] text-muted-foreground">
              Destaques do mercado na sua região — role para ver ofertas dos
              ingredientes.
            </p>
          ) : null}

          {heroMode === "ingredients" && heroOffers.length > 0 ? (
            <Link
              href={`/app/offers/${DEFAULT_OFFER_VERTICAL_SLUG}`}
              className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
            >
              Mais promoções em supermercados
              <ArrowRight className="size-3" />
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
