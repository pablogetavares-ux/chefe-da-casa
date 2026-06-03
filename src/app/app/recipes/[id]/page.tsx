import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, Sparkles, Users } from "lucide-react";

import { AddRecipeToShoppingListButton } from "@/components/features/shopping/add-recipe-to-list-button";
import { RecipeActions } from "@/components/features/recipes/recipe-actions";
import { RecipeAiTools } from "@/components/features/recipes/recipe-ai-tools";
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
import { RecipeMarketSavingsPanel } from "@/components/features/recipes/recipe-market-savings-panel";
import { RecipeOffersSection } from "@/modules/offers/components/recipe-offers-section";
import { createClient } from "@/lib/supabase/server";
import { parseRecipeAiMetadata } from "@/lib/ai/core/cache";
import { DIFFICULTY_LABELS, DIETARY_LABELS } from "@/lib/labels/recipe";
import { parseInstructions } from "@/lib/recipes/instructions";
import type { RecipeIngredient } from "@/types";

type RecipeDetailPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: RecipeDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { title: "Receita" };
  }

  const { data: recipe } = await supabase
    .from("recipes")
    .select("title, description")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!recipe) {
    return { title: "Receita não encontrada" };
  }

  return {
    title: recipe.title,
    description:
      recipe.description ?? `Receita ${recipe.title} — Chef da Casa AI`,
  };
}

function parseIngredients(raw: unknown): RecipeIngredient[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (item): item is RecipeIngredient =>
      typeof item === "object" &&
      item !== null &&
      "name" in item &&
      typeof (item as RecipeIngredient).name === "string",
  );
}

const costTierLabel = {
  LOW: "Baixo custo",
  MEDIUM: "Custo médio",
  HIGH: "Custo alto",
} as const;

export default async function RecipeDetailPage({
  params,
}: RecipeDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  const { data: recipe } = await supabase
    .from("recipes")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!recipe) {
    notFound();
  }

  const ingredients = parseIngredients(recipe.ingredients);
  const instructions = parseInstructions(recipe.instructions);
  const totalTime = recipe.prep_time_minutes + recipe.cook_time_minutes;
  const aiMeta = parseRecipeAiMetadata(recipe.ai_prompt_snapshot);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="flex flex-wrap items-center gap-3">
        <Link href="/app/recipes">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="size-4" />
            Voltar
          </Button>
        </Link>
        {recipe.is_ai_generated && (
          <Badge className="gap-1">
            <Sparkles className="size-3" />
            Gerada com IA
          </Badge>
        )}
        <RecipeActions recipeId={recipe.id} recipeTitle={recipe.title} />
      </div>

      <RecipeCover
        title={recipe.title}
        coverImageUrl={recipe.cover_image_url}
        className="shadow-md"
        priority
      />

      <div className="space-y-3">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          {recipe.title}
        </h1>
        {recipe.description && (
          <p className="text-muted-foreground">{recipe.description}</p>
        )}
        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="size-4" />
            {totalTime} min
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Users className="size-4" />
            {recipe.servings} porções
          </span>
          <Badge variant="outline">
            {DIFFICULTY_LABELS[recipe.difficulty]}
          </Badge>
          {recipe.dietary_tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {DIETARY_LABELS[tag]}
            </Badge>
          ))}
          {aiMeta?.costTier && (
            <Badge variant="outline">{costTierLabel[aiMeta.costTier]}</Badge>
          )}
        </div>

        {aiMeta?.nutrition && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            <MacroPill
              label="Calorias"
              value={`${aiMeta.nutrition.caloriesPerServing} kcal`}
            />
            <MacroPill
              label="Proteína"
              value={`${aiMeta.nutrition.proteinGrams} g`}
            />
            <MacroPill
              label="Carbos"
              value={`${aiMeta.nutrition.carbsGrams} g`}
            />
            <MacroPill
              label="Gorduras"
              value={`${aiMeta.nutrition.fatGrams} g`}
            />
            <MacroPill
              label="Fibras"
              value={`${aiMeta.nutrition.fiberGrams} g`}
            />
          </div>
        )}

        {aiMeta?.estimatedCostPerServing != null && (
          <p className="text-sm text-muted-foreground">
            Custo estimado: R${" "}
            {aiMeta.estimatedCostPerServing.toFixed(2).replace(".", ",")} /
            porção
          </p>
        )}

        <AddRecipeToShoppingListButton
          recipeId={recipe.id}
          recipeTitle={recipe.title}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="surface-card">
          <CardHeader>
            <CardTitle>Ingredientes</CardTitle>
            <CardDescription>{ingredients.length} itens</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {ingredients.map((item, index) => (
                <li
                  key={`${item.name}-${index}`}
                  className="flex justify-between gap-2"
                >
                  <span>
                    {item.name}
                    {item.optional ? " (opcional)" : ""}
                  </span>
                  {(item.quantity || item.unit) && (
                    <span className="shrink-0 text-muted-foreground">
                      {item.quantity ?? ""}
                      {item.unit ? ` ${item.unit}` : ""}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="surface-card md:col-span-2">
          <CardHeader>
            <CardTitle>Modo de preparo</CardTitle>
            <CardDescription>{instructions.length} passos</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="space-y-4">
              {instructions.map((step) => (
                <li key={step.step} className="flex gap-3 text-sm">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {step.step}
                  </span>
                  <p className="pt-0.5 leading-relaxed">{step.text}</p>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </div>

      <RecipeMarketSavingsPanel recipeId={recipe.id} />

      <RecipeOffersSection recipeId={recipe.id} />

      {aiMeta?.substitutions && aiMeta.substitutions.length > 0 && (
        <Card className="surface-card">
          <CardHeader>
            <CardTitle>Substituições sugeridas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {aiMeta.substitutions.map((item) => (
              <div
                key={`${item.original}-${item.substitute}`}
                className="rounded-lg bg-muted/30 p-3"
              >
                <strong>{item.original}</strong> → {item.substitute}
                <p className="text-xs text-muted-foreground">{item.reason}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {recipe.is_ai_generated && (
        <RecipeAiTools
          recipeId={recipe.id}
          initialSubstitutions={aiMeta?.substitutions ?? []}
          initialNutrition={aiMeta?.nutrition ?? null}
        />
      )}
    </div>
  );
}

function MacroPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-muted/20 px-3 py-2 text-center text-sm">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}
