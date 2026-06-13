"use client";

import Link from "next/link";
import { ChevronRight, Store } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { OffersIntegrationBanner } from "@/components/shared/offers-integration-banner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { OfferVerticalIcon } from "@/modules/offers/constants/vertical-icons";
import type { OfferVerticalCatalogItem } from "@/modules/offers/types";
import { AsyncPanel } from "@/shared/components/async-panel";
import { useOffersHub } from "@/shared/hooks/api/offers";
import { cn } from "@/lib/utils";

function VerticalCard({ vertical }: { vertical: OfferVerticalCatalogItem }) {
  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        <OfferVerticalIcon
          slug={vertical.slug}
          iconKey={vertical.iconKey}
          size="lg"
        />
        {vertical.isActive ? (
          <Badge
            variant="secondary"
            className="shrink-0 border-emerald-500/30 bg-emerald-500/10 text-[10px] uppercase tracking-wide text-emerald-700 dark:text-emerald-300"
          >
            {vertical.activeOfferCount && vertical.activeOfferCount > 0
              ? `${vertical.activeOfferCount} oferta${vertical.activeOfferCount === 1 ? "" : "s"}`
              : "Disponível"}
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="shrink-0 text-[10px] uppercase tracking-wide text-muted-foreground"
          >
            Em breve
          </Badge>
        )}
      </div>

      <div className="mt-4 min-w-0 space-y-1.5">
        <p className="font-heading text-base font-semibold leading-tight">
          {vertical.name}
        </p>
        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
          {vertical.description ??
            "Promoções regionais selecionadas para você."}
        </p>
      </div>

      {vertical.isActive && (
        <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
          Ver ofertas
          <ChevronRight className="size-4" aria-hidden />
        </span>
      )}
    </>
  );

  const cardClass = cn(
    "group relative flex min-h-[168px] flex-col rounded-2xl border bg-card p-4 text-left shadow-sm transition-all",
    vertical.isActive
      ? "hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md active:scale-[0.99]"
      : "opacity-80",
  );

  if (!vertical.isActive) {
    return (
      <div
        className={cardClass}
        role="group"
        aria-label={`${vertical.name} — em breve`}
      >
        {content}
      </div>
    );
  }

  return (
    <Link
      href={`/app/offers/${vertical.slug}`}
      className={cardClass}
      aria-label={`Ver ofertas de ${vertical.name}`}
    >
      {content}
    </Link>
  );
}

function HubSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {[1, 2, 3, 4, 5, 6, 7].map((item) => (
        <Skeleton key={item} className="h-[168px] rounded-2xl" />
      ))}
    </div>
  );
}

export function OffersHub() {
  const { data, isLoading, error, refetch } = useOffersHub();

  return (
    <div className="space-y-6">
      <OffersIntegrationBanner />

      <AsyncPanel
        isLoading={isLoading}
        error={error}
        onRetry={() => void refetch()}
        loadingFallback={<HubSkeleton />}
      >
        {(data?.verticals ?? []).length === 0 ? (
          <EmptyState
            icon={Store}
            title="Nenhuma vertical disponível"
            description="Ainda não há categorias de ofertas na sua região. Ajuste cidade e raio no perfil ou tente novamente mais tarde."
            action={
              <div className="flex flex-wrap justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => void refetch()}
                >
                  Atualizar
                </Button>
                <Link href="/app/profile">
                  <Button size="sm">Ajustar região</Button>
                </Link>
              </div>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {(data?.verticals ?? []).map((vertical) => (
              <VerticalCard key={vertical.id} vertical={vertical} />
            ))}
          </div>
        )}
      </AsyncPanel>
    </div>
  );
}
