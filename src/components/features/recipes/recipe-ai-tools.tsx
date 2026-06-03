"use client";

import { useState } from "react";
import { Loader2, RefreshCw, Sparkles, Wand2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  useAdaptRecipe,
  useRecipeMacros,
  useRecipeSubstitutions,
  useRefineRecipe,
} from "@/hooks/use-api";
import type { IngredientSubstitution, NutritionInfo } from "@/types";

const DIET_PRESETS = [
  "Vegano",
  "Vegetariano",
  "Sem glúten",
  "Sem lactose",
  "Low carb",
  "Keto",
  "Fitness alto proteína",
];

type RecipeAiToolsProps = {
  recipeId: string;
  initialSubstitutions?: IngredientSubstitution[];
  initialNutrition?: NutritionInfo | null;
};

export function RecipeAiTools({
  recipeId,
  initialSubstitutions = [],
  initialNutrition,
}: RecipeAiToolsProps) {
  const adaptRecipe = useAdaptRecipe();
  const refineRecipe = useRefineRecipe();
  const substitutions = useRecipeSubstitutions();
  const macros = useRecipeMacros();

  const [targetDiet, setTargetDiet] = useState("Vegano");
  const [refineInstruction, setRefineInstruction] = useState("");
  const [substitutionReason, setSubstitutionReason] = useState("");
  const [items, setItems] = useState(initialSubstitutions);
  const [nutrition, setNutrition] = useState(initialNutrition);

  async function handleRefine() {
    if (!refineInstruction.trim()) return;
    await refineRecipe.mutateAsync({
      recipeId,
      instruction: refineInstruction.trim(),
    });
    window.location.reload();
  }

  async function handleAdapt() {
    await adaptRecipe.mutateAsync({
      recipeId,
      targetDiet,
    });
    window.location.reload();
  }

  async function handleSubstitutions() {
    const result = await substitutions.mutateAsync({
      recipeId,
      reason: substitutionReason || undefined,
    });
    setItems(result.substitutions);
  }

  async function handleMacros() {
    const result = await macros.mutateAsync({ recipeId });
    setNutrition(result.nutrition);
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="surface-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Wand2 className="size-4 text-primary" />
            Adaptar dieta
          </CardTitle>
          <CardDescription>
            Reescreve a receita para outra restrição ou objetivo.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {DIET_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setTargetDiet(preset)}
                className={`rounded-full border px-3 py-1 text-xs ${
                  targetDiet === preset
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground"
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
          <Button
            onClick={handleAdapt}
            disabled={adaptRecipe.isPending}
            className="gap-2"
          >
            {adaptRecipe.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Sparkles className="size-4" />
            )}
            Adaptar receita
          </Button>
        </CardContent>
      </Card>

      <Card className="surface-card">
        <CardHeader>
          <CardTitle className="text-base">Substituições com IA</CardTitle>
          <CardDescription>
            Alternativas criativas (dieta, sabor, restrições). Para preços do
            catálogo, use a seção &quot;Economizar no mercado&quot; acima.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            placeholder="Motivo (opcional): sem lactose, mais barato..."
            value={substitutionReason}
            onChange={(event) => setSubstitutionReason(event.target.value)}
          />
          <Button
            variant="outline"
            onClick={handleSubstitutions}
            disabled={substitutions.isPending}
            className="gap-2"
          >
            {substitutions.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <RefreshCw className="size-4" />
            )}
            Sugerir substituições
          </Button>
          {items.length > 0 && (
            <ul className="space-y-2 text-sm">
              {items.map((item) => (
                <li
                  key={`${item.original}-${item.substitute}`}
                  className="rounded-lg bg-muted/40 p-2"
                >
                  <strong>{item.original}</strong> → {item.substitute}
                  <p className="text-xs text-muted-foreground">{item.reason}</p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card className="surface-card md:col-span-2">
        <CardHeader>
          <CardTitle className="text-base">Refinar receita</CardTitle>
          <CardDescription>
            Ajustes em linguagem natural — ex: &quot;deixe mais picante&quot;,
            &quot;reduza o sal&quot;.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            placeholder="Como você quer ajustar esta receita?"
            value={refineInstruction}
            onChange={(event) => setRefineInstruction(event.target.value)}
          />
          <Button
            onClick={handleRefine}
            disabled={refineRecipe.isPending || !refineInstruction.trim()}
            className="gap-2"
          >
            {refineRecipe.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Sparkles className="size-4" />
            )}
            Refinar com IA
          </Button>
        </CardContent>
      </Card>

      <Card className="surface-card md:col-span-2">
        <CardHeader>
          <CardTitle className="text-base">Macros por porção</CardTitle>
          <CardDescription>
            Estimativa nutricional gerada por IA.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {nutrition ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              <MacroStat
                label="Calorias"
                value={`${nutrition.caloriesPerServing} kcal`}
              />
              <MacroStat
                label="Proteína"
                value={`${nutrition.proteinGrams} g`}
              />
              <MacroStat label="Carbos" value={`${nutrition.carbsGrams} g`} />
              <MacroStat label="Gorduras" value={`${nutrition.fatGrams} g`} />
              <MacroStat label="Fibras" value={`${nutrition.fiberGrams} g`} />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Nenhum macro calculado ainda.
            </p>
          )}
          <Button
            variant="outline"
            onClick={handleMacros}
            disabled={macros.isPending}
          >
            {macros.isPending ? "Calculando..." : "Calcular / atualizar macros"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function MacroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-muted/30 p-3 text-center">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-heading text-sm font-semibold">{value}</p>
    </div>
  );
}
