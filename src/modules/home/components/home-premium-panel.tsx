"use client";

import Link from "next/link";

import { EmptyState } from "@/components/shared/empty-state";
import {
  AnimatedPage,
  FadeIn,
  StaggerItem,
  StaggerList,
} from "@/components/shared/motion";
import { Button } from "@/components/ui/button";
import { HomeChatResume } from "@/modules/home/components/home-chat-resume";
import { HomeHero } from "@/modules/home/components/home-hero";
import { HomeOffersStrip } from "@/modules/home/components/home-offers-strip";
import { HomeQuickActions } from "@/modules/home/components/home-quick-actions";
import { HomeRecipeMiniCard } from "@/modules/home/components/home-recipe-mini-card";
import { HomeSection } from "@/modules/home/components/home-section";
import { HomeShoppingWeek } from "@/modules/home/components/home-shopping-week";
import { PlanUsageCard } from "@/components/shared/plan-usage-card";
import type { HomeFeedResponse } from "@/modules/home/types";
import { useHomeFeed } from "@/shared/hooks/api/home";
import { Sparkles } from "lucide-react";

type HomePremiumPanelProps = {
  initialData: HomeFeedResponse;
};

function RecipeCarousel({
  recipes,
  favoriteIds,
  badge,
}: {
  recipes: HomeFeedResponse["recipesOfTheDay"];
  favoriteIds: string[];
  badge?: string;
}) {
  if (recipes.length === 0) {
    return (
      <div className="surface-card rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">
        Gere sua primeira receita com IA para ver sugestões aqui.
      </div>
    );
  }

  return (
    <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1 snap-x">
      {recipes.map((recipe) => (
        <HomeRecipeMiniCard
          key={recipe.id}
          recipe={recipe}
          isFavorite={favoriteIds.includes(recipe.id)}
          badge={badge}
        />
      ))}
    </div>
  );
}

export function HomePremiumPanel({ initialData }: HomePremiumPanelProps) {
  const { data } = useHomeFeed(undefined, initialData);
  const feed = data ?? initialData;

  return (
    <AnimatedPage className="space-y-8">
      <FadeIn>
        <HomeHero greeting={feed.greeting} stats={feed.stats} />
      </FadeIn>

      <FadeIn delay={0.04}>
        <PlanUsageCard />
      </FadeIn>

      <FadeIn delay={0.05}>
        <HomeChatResume />
      </FadeIn>

      <FadeIn delay={0.08}>
        <HomeSection title="Atalhos rápidos">
          <HomeQuickActions />
        </HomeSection>
      </FadeIn>

      <StaggerList className="space-y-8">
        <StaggerItem>
          <HomeSection
            title="Receitas do dia"
            description="Seleção personalizada para hoje"
            href="/app/recipes"
          >
            <RecipeCarousel
              recipes={feed.recipesOfTheDay}
              favoriteIds={feed.favoriteIds}
              badge="Hoje"
            />
          </HomeSection>
        </StaggerItem>

        <StaggerItem>
          <div className="grid gap-6 lg:grid-cols-2">
            <HomeSection
              title="Lista da semana"
              description="Próximas compras"
              href="/app/shopping"
            >
              <HomeShoppingWeek shopping={feed.shopping} />
            </HomeSection>

            <HomeSection
              title="Promoções próximas"
              description={`Ofertas em ${feed.city}`}
              href="/app/offers"
            >
              <HomeOffersStrip offers={feed.nearbyOffers} city={feed.city} />
            </HomeSection>
          </div>
        </StaggerItem>

        <StaggerItem>
          <HomeSection
            title="Favoritas"
            description={
              feed.stats.favoritesCount > 0
                ? `${feed.stats.favoritesCount} receitas salvas`
                : "Salve receitas que você ama"
            }
            href="/app/favorites"
          >
            {feed.favoritesPreview.length > 0 ? (
              <RecipeCarousel
                recipes={feed.favoritesPreview}
                favoriteIds={feed.favoriteIds}
              />
            ) : (
              <EmptyState
                icon={Sparkles}
                title="Nenhuma favorita ainda"
                description="Toque no coração em uma receita para vê-la aqui."
                action={
                  <Link href="/app/recipes">
                    <Button variant="outline" size="sm">
                      Ver receitas
                    </Button>
                  </Link>
                }
              />
            )}
          </HomeSection>
        </StaggerItem>

        <StaggerItem>
          <HomeSection
            title="Receitas econômicas"
            description="Rápidas, fáceis e leves no bolso"
            href="/app/compare?mode=basket"
            actionLabel="Comparar cesta"
          >
            <RecipeCarousel
              recipes={feed.economicalRecipes}
              favoriteIds={feed.favoriteIds}
              badge="Econômica"
            />
          </HomeSection>
        </StaggerItem>
      </StaggerList>
    </AnimatedPage>
  );
}
