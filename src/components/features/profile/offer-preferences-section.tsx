"use client";

import Link from "next/link";
import { Percent, Sparkles } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

import { ErrorFallback } from "@/components/shared/error-fallback";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { OFFERS_HUB_MARKETING_VERTICALS } from "@/config/offers-hub-marketing";
import { cn } from "@/lib/utils";
import { DEFAULT_OFFER_VERTICAL_SLUG } from "@/modules/offers/services/catalog";
import type { OfferPreferences } from "@/modules/offers/types/offer-preferences";
import { useOffersIntegrationContext } from "@/shared/hooks/api/offers";
import { useUpdateProfile } from "@/shared/hooks/api/identity";

export function OfferPreferencesSection() {
  const { data, isLoading, error, refetch } = useOffersIntegrationContext();
  const updateProfile = useUpdateProfile();
  const [pending, setPending] = useState(false);

  const favoriteSlugs = useMemo(
    () =>
      new Set(data?.userContext.offerPreferences.favoriteVerticalSlugs ?? []),
    [data?.userContext.offerPreferences.favoriteVerticalSlugs],
  );

  const savePreferences = useCallback(
    async (patch: OfferPreferences) => {
      setPending(true);
      try {
        await updateProfile.mutateAsync({ offerPreferences: patch });
        await refetch();
      } finally {
        setPending(false);
      }
    },
    [refetch, updateProfile],
  );

  const toggleVertical = useCallback(
    (slug: string) => {
      const current = [
        ...(data?.userContext.offerPreferences.favoriteVerticalSlugs ?? []),
      ];
      const next = current.includes(slug)
        ? current.filter((item) => item !== slug)
        : [...current, slug];
      void savePreferences({ favoriteVerticalSlugs: next });
    },
    [data?.userContext.offerPreferences.favoriteVerticalSlugs, savePreferences],
  );

  if (isLoading) {
    return <Skeleton className="h-40 rounded-2xl" />;
  }

  if (error) {
    return (
      <ErrorFallback
        title="Ofertas personalizadas"
        message="Não foi possível carregar suas preferências de ofertas."
      />
    );
  }

  if (!data) return null;

  const { userContext, extensions } = data;
  const hideRoadmap = userContext.offerPreferences.hideRoadmapHints ?? false;
  const activeExtensions = extensions.filter((ext) => ext.status !== "planned");

  return (
    <Card className="surface-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Percent className="size-5 text-primary" />
          Ofertas personalizadas
        </CardTitle>
        <CardDescription>
          Categorias priorizadas com base no seu plano, metas de fitness e modo
          sênior. Marque verticais favoritas para destacar no hub.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {userContext.personalizationReason ? (
          <p className="flex items-start gap-2 text-sm text-muted-foreground">
            <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" />
            {userContext.personalizationReason}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            Complete seu perfil fitness ou ative o modo sênior para refinar as
            ofertas exibidas em receitas, despensa e lista de compras.
          </p>
        )}

        {userContext.priorityLabels.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {userContext.priorityLabels.map((label) => (
              <Badge key={label} variant="secondary">
                {label}
              </Badge>
            ))}
          </div>
        ) : null}

        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Verticais favoritas
          </p>
          <div className="flex flex-col gap-2">
            {OFFERS_HUB_MARKETING_VERTICALS.filter((v) => v.isActive).map(
              (vertical) => (
                <label
                  key={vertical.slug}
                  className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-border/60 px-3 py-2"
                >
                  <span className="text-sm">{vertical.name}</span>
                  <input
                    type="checkbox"
                    checked={favoriteSlugs.has(vertical.slug)}
                    disabled={pending || updateProfile.isPending}
                    onChange={() => toggleVertical(vertical.slug)}
                    aria-label={`Favoritar ${vertical.name}`}
                    className={cn(
                      "size-4 rounded border border-input accent-primary",
                      (pending || updateProfile.isPending) && "opacity-50",
                    )}
                  />
                </label>
              ),
            )}
          </div>
        </div>

        {activeExtensions.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {activeExtensions.map((ext) => (
              <Badge key={ext.slug} variant="outline">
                {ext.name}
              </Badge>
            ))}
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <Link href={`/app/offers/${DEFAULT_OFFER_VERTICAL_SLUG}`}>
            <Button size="sm" variant="outline">
              Ver ofertas
            </Button>
          </Link>
          <Link href="/app/pantry">
            <Button size="sm" variant="ghost">
              Despensa
            </Button>
          </Link>
        </div>

        {!hideRoadmap && extensions.length > 0 ? (
          <p className="text-xs text-muted-foreground">
            Em breve:{" "}
            {extensions
              .filter((ext) => ext.status === "planned")
              .map((ext) => ext.name.toLowerCase())
              .join(", ") || "novas integrações"}
            .
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
