"use client";

import Link from "next/link";
import { Heart, Sparkles } from "lucide-react";

import { RecipeCard } from "@/components/features/recipes/recipe-card";
import { PageHeader } from "@/components/shared/page-header";
import {
  AnimatedPage,
  StaggerItem,
  StaggerList,
} from "@/components/shared/motion";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { useDeleteRecipe, useFavorites } from "@/modules/favorites";
import { AsyncPanel } from "@/shared/components/async-panel";
import type { Recipe } from "@/types/database";

export function FavoritesPanel() {
  const { data: favorites, isLoading, error, refetch } = useFavorites();
  const deleteRecipe = useDeleteRecipe();
  const { confirm, dialog } = useConfirmDialog();

  async function handleDelete(recipe: Recipe) {
    const confirmed = await confirm({
      title: "Excluir receita?",
      description: `"${recipe.title}" será removida permanentemente.`,
      confirmLabel: "Excluir",
      destructive: true,
    });
    if (!confirmed) return;
    await deleteRecipe.mutateAsync(recipe.id);
  }

  const recipes = favorites?.recipes ?? [];
  const favoriteIds = new Set(favorites?.recipeIds ?? []);

  return (
    <AnimatedPage>
      <PageHeader
        title="Receitas favoritas"
        description="Suas receitas salvas com um toque — acesse rápido o que mais gosta."
      >
        <Link href="/app/generate">
          <Button size="sm" className="gap-2">
            <Sparkles className="size-4" />
            Gerar nova
          </Button>
        </Link>
      </PageHeader>

      <AsyncPanel
        isLoading={isLoading}
        error={error}
        onRetry={() => void refetch()}
        loadingFallback={
          <div className="grid gap-4 sm:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-36 rounded-2xl" />
            ))}
          </div>
        }
      >
        {recipes.length > 0 ? (
          <StaggerList className="grid gap-4 sm:grid-cols-2">
            {recipes.map((recipe) => (
              <StaggerItem key={recipe.id}>
                <RecipeCard
                  recipe={recipe}
                  isFavorite={favoriteIds.has(recipe.id)}
                  onDelete={handleDelete}
                />
              </StaggerItem>
            ))}
          </StaggerList>
        ) : (
          <EmptyState
            icon={Heart}
            title="Nenhuma favorita ainda"
            description="Toque no coração em qualquer receita para salvá-la aqui."
            action={
              <Link href="/app/recipes">
                <Button variant="outline">Ver receitas</Button>
              </Link>
            }
          />
        )}
      </AsyncPanel>
      {dialog}
    </AnimatedPage>
  );
}
