import Link from "next/link";
import { Clock, Sparkles } from "lucide-react";

import { RecipeCover } from "@/components/features/recipes/recipe-cover";
import { Badge } from "@/components/ui/badge";
import { formatDifficulty } from "@/lib/labels/recipe";
import type { Recipe } from "@/types/database";

type HomeRecipeMiniCardProps = {
  recipe: Recipe;
  isFavorite?: boolean;
  badge?: string;
};

export function HomeRecipeMiniCard({
  recipe,
  isFavorite,
  badge,
}: HomeRecipeMiniCardProps) {
  const totalTime = recipe.prep_time_minutes + recipe.cook_time_minutes;

  return (
    <Link
      href={`/app/recipes/${recipe.id}`}
      className="group flex w-[220px] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border bg-card transition-all hover:-translate-y-0.5 hover:shadow-lg sm:w-[240px]"
    >
      <RecipeCover
        title={recipe.title}
        coverImageUrl={recipe.cover_image_url}
        className="aspect-[4/3] rounded-none"
      />
      <div className="flex flex-1 flex-col gap-2 p-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 font-medium leading-snug transition-colors group-hover:text-primary">
            {recipe.title}
          </h3>
          {isFavorite ? (
            <Badge variant="secondary" className="shrink-0 text-[10px]">
              ♥
            </Badge>
          ) : null}
        </div>
        <div className="mt-auto flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          {badge ? (
            <Badge variant="outline" className="text-[10px]">
              {badge}
            </Badge>
          ) : null}
          {recipe.is_ai_generated ? (
            <span className="inline-flex items-center gap-1">
              <Sparkles className="size-3" />
              IA
            </span>
          ) : null}
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3" />
            {totalTime} min
          </span>
          <span>{formatDifficulty(recipe.difficulty)}</span>
        </div>
      </div>
    </Link>
  );
}
