"use client";

import { useState } from "react";
import Image from "next/image";
import { Heart, MapPin, ShoppingCart, Store } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  resolveOfferImageSrc,
  resolveOfferImageUrl,
  shouldUnoptimizeOfferImage,
} from "@/modules/offers/constants/offer-images";
import {
  formatOfferPrice,
  formatOfferValidity,
  OFFER_CATEGORY_LABELS,
  type RegionalOffer,
} from "@/modules/offers/types";
import { cn } from "@/lib/utils";

type OfferCardProps = {
  offer: RegionalOffer;
  onToggleFavorite: (offer: RegionalOffer) => void;
  onAddToShopping: (offer: RegionalOffer) => void;
  compact?: boolean;
  showMatchBadges?: boolean;
  priority?: boolean;
  favoritePending?: boolean;
  shoppingPending?: boolean;
};

function OfferCardImage({
  primarySrc,
  fallbackSrc,
  alt,
  priority,
}: {
  primarySrc: string;
  fallbackSrc: string;
  alt: string;
  priority: boolean;
}) {
  const [src, setSrc] = useState(primarySrc);

  return (
    <Image
      src={src}
      alt={alt}
      fill
      unoptimized={shouldUnoptimizeOfferImage(src)}
      priority={priority}
      fetchPriority={priority ? "high" : "auto"}
      loading={priority ? "eager" : "lazy"}
      className={cn(
        src.endsWith(".svg") ? "object-contain p-6" : "object-cover",
      )}
      sizes="(max-width: 768px) 100vw, 33vw"
      onError={() => {
        if (src !== fallbackSrc) setSrc(fallbackSrc);
      }}
    />
  );
}

export function OfferCard({
  offer,
  onToggleFavorite,
  onAddToShopping,
  compact = false,
  showMatchBadges = false,
  priority = false,
  favoritePending = false,
  shoppingPending = false,
}: OfferCardProps) {
  const hasDiscount =
    offer.previous_price != null && offer.previous_price > offer.current_price;

  const primarySrc = resolveOfferImageSrc(
    offer.image_url,
    offer.product_name,
    offer.ingredient_keywords,
    offer.description ?? "",
    offer.title,
  );
  const fallbackSrc = resolveOfferImageUrl(
    offer.product_name,
    offer.ingredient_keywords,
    offer.description ?? "",
    offer.title,
  );

  return (
    <Card className="surface-card overflow-hidden transition-shadow hover:shadow-md">
      {!compact ? (
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
          <OfferCardImage
            key={primarySrc}
            primarySrc={primarySrc}
            fallbackSrc={fallbackSrc}
            alt={offer.title}
            priority={priority}
          />
          {offer.discountPercent ? (
            <span className="absolute left-3 top-3 rounded-full bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white">
              -{offer.discountPercent}%
            </span>
          ) : null}
        </div>
      ) : null}

      <CardHeader className={cn("space-y-2", compact ? "pb-2" : "pb-3")}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <p className="text-xs font-medium uppercase tracking-wide text-primary">
              {OFFER_CATEGORY_LABELS[offer.category]}
            </p>
            <h3 className="font-heading text-lg font-semibold leading-tight">
              {offer.title}
            </h3>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0"
            aria-label={
              offer.isFavorite
                ? "Remover dos favoritos"
                : "Salvar nos favoritos"
            }
            disabled={favoritePending}
            onClick={() => onToggleFavorite(offer)}
          >
            <Heart
              className={cn(
                "size-5",
                offer.isFavorite && "fill-rose-500 text-rose-500",
              )}
            />
          </Button>
        </div>

        {offer.description ? (
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {offer.description}
          </p>
        ) : null}

        {showMatchBadges ? (
          <div className="flex flex-wrap gap-2">
            {offer.isCrossCity ? (
              <Badge variant="secondary" className="text-xs font-normal">
                Outra cidade · {offer.store.city}
              </Badge>
            ) : null}
            {offer.matchedIngredients?.map((ingredient) => (
              <Badge
                key={ingredient}
                variant="outline"
                className="border-emerald-200 text-xs font-normal text-emerald-800 dark:border-emerald-900 dark:text-emerald-300"
              >
                Combina: {ingredient}
              </Badge>
            ))}
          </div>
        ) : null}
      </CardHeader>

      <CardContent className="space-y-3 pt-0">
        <div className="flex flex-wrap items-end gap-2">
          <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
            {formatOfferPrice(offer.current_price)}
          </span>
          {hasDiscount ? (
            <span className="text-sm text-muted-foreground line-through">
              {formatOfferPrice(offer.previous_price!)}
            </span>
          ) : null}
          {offer.unit ? (
            <span className="text-xs text-muted-foreground">/{offer.unit}</span>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1">
            <Store className="size-3.5" />
            {offer.store.chain} · {offer.store.name}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1">
            <MapPin className="size-3.5" />
            {offer.store.city}
            {offer.store.state ? ` — ${offer.store.state}` : ""}
            {offer.store.neighborhood ? ` · ${offer.store.neighborhood}` : ""}
            {offer.distanceKm != null ? ` · ${offer.distanceKm} km` : ""}
          </span>
        </div>

        <Badge variant="outline" className="w-fit text-xs font-normal">
          {formatOfferValidity(offer.valid_until)}
        </Badge>
      </CardContent>

      <CardFooter className="pt-0">
        <Button
          type="button"
          className="w-full gap-2"
          disabled={shoppingPending}
          onClick={() => onAddToShopping(offer)}
        >
          <ShoppingCart className="size-4" />
          Adicionar à lista de compras
        </Button>
      </CardFooter>
    </Card>
  );
}
