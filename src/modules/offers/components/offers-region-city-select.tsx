"use client";

import { listCatalogCityOptions } from "@/modules/offers/region/city-catalog";
import type { OfferRegionCityOption } from "@/modules/offers/region/types";
import { cn } from "@/lib/utils";

type OffersRegionCitySelectProps = {
  city: string;
  state: string;
  regionCities?: OfferRegionCityOption[];
  onSelect: (city: string, state: string) => void;
  className?: string;
  "aria-label"?: string;
};

const catalogFallback = listCatalogCityOptions().map((c) => ({
  city: c.city,
  state: c.state,
  label: c.label,
}));

export function OffersRegionCitySelect({
  city,
  state,
  regionCities = [],
  onSelect,
  className,
  "aria-label": ariaLabel = "Cidade das ofertas",
}: OffersRegionCitySelectProps) {
  const options = regionCities.length > 0 ? regionCities : catalogFallback;
  const selectedKey = `${city}|${state}`;

  return (
    <select
      value={selectedKey}
      onChange={(event) => {
        const [nextCity, nextState] = event.target.value.split("|");
        if (nextCity && nextState) onSelect(nextCity, nextState);
      }}
      className={cn(
        "h-11 min-h-11 rounded-xl border border-input bg-background px-3 text-base sm:text-sm",
        className,
      )}
      aria-label={ariaLabel}
    >
      {options.map((item) => (
        <option
          key={`${item.city}|${item.state}`}
          value={`${item.city}|${item.state}`}
        >
          {item.label}
        </option>
      ))}
    </select>
  );
}
