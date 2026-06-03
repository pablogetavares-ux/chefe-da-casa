"use client";

import { MapPin, Navigation } from "lucide-react";

import { OffersRegionCitySelect } from "@/modules/offers/components/offers-region-city-select";
import {
  BRAZIL_STATE_OPTIONS,
  OFFER_REGION_SCOPE_LABELS,
  OFFER_SEARCH_RADIUS_OPTIONS,
} from "@/modules/offers/region/constants";
import type { OfferRegionScope } from "@/modules/offers/region/types";
import type { StoredOfferRegion } from "@/modules/offers/utils/region-preference";
import { cn } from "@/lib/utils";

type OffersRegionBarProps = {
  region: StoredOfferRegion;
  regionCities?: { city: string; state: string; label: string }[];
  onChange: (patch: Partial<StoredOfferRegion>) => void;
  onPersist?: () => void;
  persistPending?: boolean;
  className?: string;
};

const selectClassName =
  "h-11 min-h-11 w-full rounded-xl border border-input bg-background px-3 text-base sm:text-sm";

export function OffersRegionBar({
  region,
  regionCities = [],
  onChange,
  onPersist,
  persistPending,
  className,
}: OffersRegionBarProps) {
  return (
    <div className={cn("surface-card space-y-3 p-4 sm:p-5", className)}>
      <div className="flex items-start gap-2">
        <Navigation className="mt-0.5 size-4 shrink-0 text-primary" />
        <div>
          <p className="text-sm font-medium">Sua região de compras</p>
          <p className="text-xs text-muted-foreground">
            Hub padrão: Belo Horizonte (MG). Raio 300 km cobre o leste de Minas;
            &quot;Todo o Brasil&quot; mostra ofertas em todo o território.
            Cidade e raio salvam automaticamente na conta.
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="space-y-1.5 text-xs">
          <span className="text-muted-foreground">Cidade</span>
          <OffersRegionCitySelect
            city={region.city}
            state={region.state}
            regionCities={regionCities}
            onSelect={(city, state) => onChange({ city, state })}
            aria-label="Cidade"
          />
        </label>

        <label className="space-y-1.5 text-xs">
          <span className="text-muted-foreground">Estado (UF)</span>
          <select
            value={region.state}
            onChange={(event) => {
              const nextState = event.target.value;
              const match = regionCities.find((c) => c.state === nextState);
              onChange({
                state: nextState,
                city: match?.city ?? region.city,
              });
            }}
            className={selectClassName}
            aria-label="Estado"
          >
            {BRAZIL_STATE_OPTIONS.map((uf) => (
              <option key={uf.uf} value={uf.uf}>
                {uf.uf} — {uf.name}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1.5 text-xs">
          <span className="text-muted-foreground">Raio de busca</span>
          <select
            value={region.radiusKm}
            onChange={(event) =>
              onChange({
                radiusKm: Number(
                  event.target.value,
                ) as StoredOfferRegion["radiusKm"],
              })
            }
            className={selectClassName}
            aria-label="Raio de busca"
          >
            {OFFER_SEARCH_RADIUS_OPTIONS.map((km) => (
              <option key={km} value={km}>
                {km} km
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1.5 text-xs">
          <span className="text-muted-foreground">Exibir</span>
          <select
            value={region.scope}
            onChange={(event) =>
              onChange({ scope: event.target.value as OfferRegionScope })
            }
            className={selectClassName}
            aria-label="Escopo regional"
          >
            {(Object.keys(OFFER_REGION_SCOPE_LABELS) as OfferRegionScope[]).map(
              (key) => (
                <option key={key} value={key}>
                  {OFFER_REGION_SCOPE_LABELS[key]}
                </option>
              ),
            )}
          </select>
        </label>
      </div>

      {onPersist && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-3">
          <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="size-3.5" />
            {region.city} — {region.state} · {region.radiusKm} km ·{" "}
            {OFFER_REGION_SCOPE_LABELS[region.scope]}
          </p>
          <button
            type="button"
            disabled={persistPending}
            onClick={onPersist}
            className="min-h-11 rounded-lg px-2 text-xs font-medium text-primary hover:underline disabled:opacity-50"
          >
            {persistPending ? "Salvando…" : "Salvar na conta"}
          </button>
        </div>
      )}
    </div>
  );
}
