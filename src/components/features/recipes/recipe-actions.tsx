"use client";

import { useRouter } from "next/navigation";
import { Heart, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  useDeleteRecipe,
  useFavorites,
  useToggleFavorite,
} from "@/hooks/use-api";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { cn } from "@/lib/utils";

type RecipeActionsProps = {
  recipeId: string;
  recipeTitle: string;
};

export function RecipeActions({ recipeId, recipeTitle }: RecipeActionsProps) {
  const router = useRouter();
  const { data: favorites } = useFavorites();
  const toggleFavorite = useToggleFavorite();
  const deleteRecipe = useDeleteRecipe();
  const { confirm, dialog } = useConfirmDialog();

  const isFavorite = favorites?.recipeIds.includes(recipeId) ?? false;

  async function handleFavorite() {
    await toggleFavorite.mutateAsync({ recipeId, isFavorite });
  }

  async function handleDelete() {
    const confirmed = await confirm({
      title: "Excluir receita?",
      description: `"${recipeTitle}" será removida permanentemente.`,
      confirmLabel: "Excluir",
      destructive: true,
    });
    if (!confirmed) return;
    await deleteRecipe.mutateAsync(recipeId);
    router.push("/app/recipes");
  }

  return (
    <>
      <div className="ml-auto flex gap-1">
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "gap-1.5",
            isFavorite && "text-rose-500 border-rose-500/30",
          )}
          disabled={toggleFavorite.isPending}
          onClick={handleFavorite}
        >
          <Heart className={cn("size-4", isFavorite && "fill-current")} />
          {isFavorite ? "Favorita" : "Favoritar"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 text-destructive hover:text-destructive"
          disabled={deleteRecipe.isPending}
          onClick={handleDelete}
        >
          <Trash2 className="size-4" />
          Excluir
        </Button>
      </div>
      {dialog}
    </>
  );
}
