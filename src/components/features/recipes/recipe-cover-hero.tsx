import { RecipeCover } from "@/components/features/recipes/recipe-cover";
import { RecipeCoverOffersHero } from "@/components/features/recipes/recipe-cover-offers-hero";
import { cn } from "@/lib/utils";

type RecipeCoverHeroProps = {
  recipeId: string;
  title: string;
  coverImageUrl?: string | null;
  className?: string;
  priority?: boolean;
};

/**
 * Capa da receita: foto quando existir; senão hero comercial com ofertas regionais.
 */
export function RecipeCoverHero({
  recipeId,
  title,
  coverImageUrl,
  className,
  priority,
}: RecipeCoverHeroProps) {
  if (coverImageUrl) {
    return (
      <RecipeCover
        title={title}
        coverImageUrl={coverImageUrl}
        className={className}
        priority={priority}
      />
    );
  }

  return (
    <RecipeCoverOffersHero
      recipeId={recipeId}
      recipeTitle={title}
      className={cn(className)}
    />
  );
}
