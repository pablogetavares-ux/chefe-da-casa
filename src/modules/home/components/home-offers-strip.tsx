"use client";

import Link from "next/link";
import { Percent } from "lucide-react";

import { formatOfferPrice, type RegionalOffer } from "@/modules/offers/types";

type HomeOffersStripProps = {
  offers: RegionalOffer[];
  city: string;
};

export function HomeOffersStrip({ offers, city }: HomeOffersStripProps) {
  if (offers.length === 0) {
    return (
      <div className="surface-card rounded-2xl border border-dashed p-5 text-center">
        <Percent className="mx-auto size-8 text-muted-foreground" />
        <p className="mt-2 text-sm font-medium">Nenhuma promoção em {city}</p>
        <Link
          href="/app/offers"
          className="mt-2 inline-block text-sm text-primary hover:underline"
        >
          Explorar ofertas
        </Link>
      </div>
    );
  }

  return (
    <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1 snap-x">
      {offers.map((offer) => (
        <Link
          key={offer.id}
          href="/app/offers"
          className="w-[240px] shrink-0 snap-start rounded-2xl border bg-card p-4 transition-all hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className="flex items-start justify-between gap-2">
            <p className="text-xs font-medium uppercase tracking-wide text-primary">
              {offer.store.chain}
            </p>
            {offer.discountPercent ? (
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
                -{offer.discountPercent}%
              </span>
            ) : null}
          </div>
          <p className="mt-2 line-clamp-2 font-medium leading-snug">
            {offer.title}
          </p>
          <p className="mt-2 text-lg font-bold text-primary">
            {formatOfferPrice(offer.current_price)}
            {offer.unit ? `/${offer.unit}` : ""}
          </p>
          {offer.previous_price != null &&
          offer.previous_price > offer.current_price ? (
            <p className="text-xs text-muted-foreground line-through">
              {formatOfferPrice(offer.previous_price)}
            </p>
          ) : null}
        </Link>
      ))}
    </div>
  );
}
