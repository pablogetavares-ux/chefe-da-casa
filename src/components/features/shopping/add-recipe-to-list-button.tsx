"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, ShoppingCart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAddRecipeToShoppingList } from "@/hooks/use-api";

type AddRecipeToShoppingListButtonProps = {
  recipeId: string;
  recipeTitle: string;
};

export function AddRecipeToShoppingListButton({
  recipeId,
  recipeTitle,
}: AddRecipeToShoppingListButtonProps) {
  const router = useRouter();
  const addFromRecipe = useAddRecipeToShoppingList();

  async function handleClick() {
    const result = await addFromRecipe.mutateAsync(recipeId);

    if (result.added > 0) {
      router.push("/app/shopping");
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5"
        disabled={addFromRecipe.isPending}
        onClick={handleClick}
      >
        {addFromRecipe.isPending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <ShoppingCart className="size-4" />
        )}
        Adicionar faltantes à lista
      </Button>
      <Link href="/app/shopping">
        <Button variant="ghost" size="sm">
          Ver lista
        </Button>
      </Link>
      <span className="sr-only">Receita: {recipeTitle}</span>
    </div>
  );
}
