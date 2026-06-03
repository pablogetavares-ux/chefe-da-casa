"use client";

import Link from "next/link";
import { Heart, Sparkles, Trash2 } from "lucide-react";

import { RecipeCover } from "@/components/features/recipes/recipe-cover";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useDeleteRecipe, useToggleFavorite } from "@/hooks/use-api";
import { formatDifficulty } from "@/lib/labels/recipe";
import { cn } from "@/lib/utils";
import type { Recipe } from "@/types/database";

type RecipeCardProps = {
  recipe: Recipe;
  isFavorite: boolean;
  onDelete?: (recipe: Recipe) => void;
};

export function RecipeCard({ recipe, isFavorite, onDelete }: RecipeCardProps) {
  const toggleFavorite = useToggleFavorite();
  const deleteRecipe = useDeleteRecipe();

  async function handleFavorite() {
    await toggleFavorite.mutateAsync({ recipeId: recipe.id, isFavorite });
  }

  async function handleDelete() {
    onDelete?.(recipe);
  }

  return (
    <Card className="surface-card h-full overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
      <Link href={`/app/recipes/${recipe.id}`} className="block">
        <RecipeCover
          title={recipe.title}
          coverImageUrl={recipe.cover_image_url}
          className="rounded-none rounded-t-xl"
        />
      </Link>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <Link
            href={`/app/recipes/${recipe.id}`}
            className="min-w-0 flex-1 group/title"
          >
            <CardTitle className="transition-colors group-hover/title:text-primary">
              {recipe.title}
            </CardTitle>
          </Link>
          <div className="flex shrink-0 items-center gap-1">
            {recipe.is_ai_generated && (
              <Badge variant="secondary" className="gap-1">
                <Sparkles className="size-3" />
                IA
              </Badge>
            )}
            <Button
              size="icon-sm"
              variant="ghost"
              aria-label={isFavorite ? "Remover dos favoritos" : "Favoritar"}
              className={cn(isFavorite && "text-rose-500 hover:text-rose-600")}
              disabled={toggleFavorite.isPending}
              onClick={handleFavorite}
            >
              <Heart className={cn("size-4", isFavorite && "fill-current")} />
            </Button>
            {onDelete && (
              <Button
                size="icon-sm"
                variant="ghost"
                aria-label="Excluir receita"
                className="text-destructive hover:text-destructive"
                disabled={deleteRecipe.isPending}
                onClick={handleDelete}
              >
                <Trash2 className="size-4" />
              </Button>
            )}
          </div>
        </div>
        {recipe.description && (
          <CardDescription className="line-clamp-2">
            {recipe.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <Link
          href={`/app/recipes/${recipe.id}`}
          className="text-sm text-muted-foreground hover:text-primary"
        >
          {recipe.prep_time_minutes + recipe.cook_time_minutes} min ·{" "}
          {recipe.servings} porções · {formatDifficulty(recipe.difficulty)}
        </Link>
      </CardContent>
    </Card>
  );
}
