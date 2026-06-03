"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BookOpen, Heart, Sparkles } from "lucide-react";

import { RecipeCard } from "@/components/features/recipes/recipe-card";
import { PageHeader } from "@/components/shared/page-header";
import {
  AnimatedPage,
  StaggerItem,
  StaggerList,
} from "@/components/shared/motion";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorFallback } from "@/components/shared/error-fallback";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDeleteRecipe, useFavorites, useRecipes } from "@/hooks/use-api";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import type { Recipe } from "@/types/database";

type Tab = "all" | "favorites";

export function RecipesPanel() {
  const [tab, setTab] = useState<Tab>("all");
  const {
    recipes,
    isLoading: recipesLoading,
    error: recipesError,
    hasMore,
    loadMore,
    isLoadingMore,
  } = useRecipes();
  const {
    data: favorites,
    isLoading: favoritesLoading,
    error: favoritesError,
  } = useFavorites();
  const deleteRecipe = useDeleteRecipe();
  const { confirm, dialog } = useConfirmDialog();

  const favoriteIds = useMemo(
    () => new Set(favorites?.recipeIds ?? []),
    [favorites?.recipeIds],
  );

  const displayed = tab === "all" ? recipes : (favorites?.recipes ?? []);

  const isLoading = tab === "all" ? recipesLoading : favoritesLoading;
  const queryError = tab === "all" ? recipesError : favoritesError;

  async function handleDeleteRecipe(recipe: Recipe) {
    const confirmed = await confirm({
      title: "Excluir receita?",
      description: `"${recipe.title}" será removida permanentemente.`,
      confirmLabel: "Excluir",
      destructive: true,
    });
    if (!confirmed) return;
    await deleteRecipe.mutateAsync(recipe.id);
  }

  return (
    <AnimatedPage>
      <PageHeader
        title="Receitas"
        description="Todas as suas receitas geradas e salvas."
      >
        <Link href="/app/generate">
          <Button size="sm" className="gap-2">
            <Sparkles className="size-4" />
            Gerar receita
          </Button>
        </Link>
      </PageHeader>

      <div className="flex gap-2">
        <Button
          variant={tab === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setTab("all")}
        >
          Todas
          {recipes && (
            <span className="ml-1.5 text-xs opacity-70">
              ({recipes.length})
            </span>
          )}
        </Button>
        <Button
          variant={tab === "favorites" ? "default" : "outline"}
          size="sm"
          className="gap-1.5"
          onClick={() => setTab("favorites")}
        >
          <Heart className="size-3.5" />
          Favoritas
          {favorites && (
            <span className="text-xs opacity-70">
              ({favorites.recipeIds.length})
            </span>
          )}
        </Button>
      </div>

      {queryError ? (
        <ErrorFallback
          compact
          title="Erro ao carregar receitas"
          message={queryError.message}
        />
      ) : isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-36 rounded-2xl" />
          ))}
        </div>
      ) : displayed.length > 0 ? (
        <div className="space-y-4">
          <StaggerList className="grid gap-4 sm:grid-cols-2">
            {displayed.map((recipe) => (
              <StaggerItem key={recipe.id}>
                <RecipeCard
                  recipe={recipe}
                  isFavorite={favoriteIds.has(recipe.id)}
                  onDelete={handleDeleteRecipe}
                />
              </StaggerItem>
            ))}
          </StaggerList>
          {tab === "all" && hasMore ? (
            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={() => loadMore()}
                disabled={isLoadingMore}
              >
                {isLoadingMore ? "Carregando…" : "Carregar mais"}
              </Button>
            </div>
          ) : null}
        </div>
      ) : (
        <EmptyState
          icon={BookOpen}
          title={
            tab === "favorites"
              ? "Nenhuma receita favorita"
              : "Nenhuma receita ainda"
          }
          description={
            tab === "favorites"
              ? "Toque no coração em uma receita para salvá-la aqui."
              : "Adicione ingredientes na despensa e gere sua primeira receita com IA."
          }
          action={
            tab === "all" ? (
              <Link href="/app/generate">
                <Button className="gap-2">
                  <Sparkles className="size-4" />
                  Gerar receita
                </Button>
              </Link>
            ) : (
              <Link href="/app/generate">
                <Button variant="outline">Gerar receita</Button>
              </Link>
            )
          }
        />
      )}
      {dialog}
    </AnimatedPage>
  );
}
