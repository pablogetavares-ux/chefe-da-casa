"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Check,
  Dumbbell,
  HeartHandshake,
  Leaf,
  Loader2,
  PiggyBank,
  Sparkles,
  Salad,
  Wheat,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  RECIPE_GENERATION_MODES,
  RECIPE_MODE_LABELS,
  type RecipeGenerationMode,
} from "@/lib/ai/constants/recipe-modes";
import {
  useAiStatus,
  useAiUsage,
  useGenerateRecipeStream,
  usePantryItems,
  useProfile,
} from "@/hooks/use-api";
import {
  calculateFitnessTargets,
  hasCompleteBodyProfile,
} from "@/lib/fitness/calculate-targets";
import { buildFitnessGoalsRequest } from "@/lib/fitness/build-request-goals";
import {
  FITNESS_GOAL_LABELS,
  type FitnessGoalType,
} from "@/lib/fitness/constants";
import { ErrorFallback } from "@/components/shared/error-fallback";
import type { GenerateRecipeInput } from "@/lib/validations";
import { cn } from "@/lib/utils";

const PREPARATION_STYLE_OPTIONS: {
  value: GenerateRecipeInput["preparationStyle"] | null;
  label: string;
}[] = [
  { value: null, label: "IA escolhe" },
  { value: "bolo", label: "Bolo" },
  { value: "pudim", label: "Pudim" },
  { value: "torta", label: "Torta" },
  { value: "mingau", label: "Mingau" },
  { value: "mousse", label: "Mousse" },
  { value: "creme", label: "Creme" },
  { value: "vitamina", label: "Vitamina" },
  { value: "refogado", label: "Refogado" },
  { value: "assado", label: "Assado" },
];

const DIETARY_OPTIONS = [
  { value: "VEGETARIAN", label: "Vegetariano" },
  { value: "VEGAN", label: "Vegano" },
  { value: "GLUTEN_FREE", label: "Sem glúten" },
  { value: "LACTOSE_FREE", label: "Sem lactose" },
  { value: "LOW_CARB", label: "Low carb" },
  { value: "KETO", label: "Keto" },
] as const;

const MODE_ICONS: Record<RecipeGenerationMode, LucideIcon> = {
  STANDARD: Salad,
  ECONOMIC: PiggyBank,
  FITNESS: Dumbbell,
  SENIOR: HeartHandshake,
  LOW_CARB: Wheat,
  VEGAN: Leaf,
};

const MODES = RECIPE_GENERATION_MODES.map((id) => ({
  id,
  ...RECIPE_MODE_LABELS[id],
  icon: MODE_ICONS[id],
}));

type GenerateRecipePanelProps = {
  initialIngredients?: string[];
};

export function GenerateRecipePanel({
  initialIngredients = [],
}: GenerateRecipePanelProps) {
  const router = useRouter();
  const {
    data: pantryItems,
    isLoading: pantryLoading,
    error: pantryError,
  } = usePantryItems();
  const { data: usage } = useAiUsage();
  const { data: aiStatus } = useAiStatus();
  const { data: profile } = useProfile();
  const generateStream = useGenerateRecipeStream();

  const [selected, setSelected] = useState<Set<string> | null>(null);
  const [customIngredient, setCustomIngredient] = useState("");
  const [extraIngredients, setExtraIngredients] =
    useState<string[]>(initialIngredients);
  const [servings, setServings] = useState(4);
  const [maxTime, setMaxTime] = useState("");
  const [dietary, setDietary] = useState<Set<string>>(new Set());
  const [preparationStyle, setPreparationStyle] = useState<
    GenerateRecipeInput["preparationStyle"] | null
  >(null);
  const [mode, setMode] = useState<RecipeGenerationMode>("STANDARD");
  const [calorieTarget, setCalorieTarget] = useState("");
  const [proteinMin, setProteinMin] = useState("");
  const [forceRegenerate, setForceRegenerate] = useState(false);
  const [streamPreview, setStreamPreview] = useState("");

  const bodyProfile = useMemo(
    () =>
      profile
        ? {
            body_weight_kg: profile.body_weight_kg,
            body_height_cm: profile.body_height_cm,
            fitness_goal: profile.fitness_goal as FitnessGoalType | null,
          }
        : null,
    [profile],
  );

  const fitnessTargets = useMemo(() => {
    if (!hasCompleteBodyProfile(bodyProfile)) return null;
    return calculateFitnessTargets({
      weightKg: Number(bodyProfile.body_weight_kg),
      heightCm: Number(bodyProfile.body_height_cm),
      goal: bodyProfile.fitness_goal,
    });
  }, [bodyProfile]);

  const seniorMode = profile?.senior_mode_enabled ?? false;
  const activeMode: RecipeGenerationMode = seniorMode ? "SENIOR" : mode;

  function selectMode(id: RecipeGenerationMode) {
    if (seniorMode) return;
    setMode(id);
    if (id === "FITNESS" && fitnessTargets) {
      setCalorieTarget(String(fitnessTargets.calorieTarget));
      setProteinMin(String(fitnessTargets.proteinMinGrams));
    }
  }

  const pantryNames = useMemo(
    () => pantryItems?.map((item) => item.name) ?? [],
    [pantryItems],
  );

  const effectiveSelected =
    selected ?? new Set([...pantryNames, ...extraIngredients]);

  const allIngredients = useMemo(() => {
    const names = pantryItems?.map((item) => item.name) ?? [];
    return [...new Set([...names, ...extraIngredients])];
  }, [pantryItems, extraIngredients]);

  const selectedIngredients = allIngredients.filter((name) =>
    effectiveSelected.has(name),
  );

  function toggleIngredient(name: string) {
    const current = selected ?? new Set([...pantryNames, ...extraIngredients]);
    setSelected((prev) => {
      const base = prev ?? current;
      const next = new Set(base);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  function toggleDietary(value: string) {
    setDietary((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  }

  function addCustomIngredient() {
    const name = customIngredient.trim();
    if (!name) return;
    setExtraIngredients((prev) =>
      prev.includes(name) ? prev : [...prev, name],
    );
    setSelected((prev) => {
      const base = prev ?? new Set([...pantryNames, ...extraIngredients]);
      return new Set(base).add(name);
    });
    setCustomIngredient("");
  }

  async function handleGenerate() {
    if (selectedIngredients.length === 0) return;

    setStreamPreview("");

    const result = await generateStream.mutateAsync({
      payload: {
        ingredients: selectedIngredients,
        dietaryPreferences: [...dietary],
        ...(preparationStyle ? { preparationStyle } : {}),
        servings,
        maxPrepTimeMinutes: maxTime ? Number(maxTime) : undefined,
        mode: activeMode,
        forceRegenerate,
        fitnessGoals:
          activeMode === "FITNESS"
            ? buildFitnessGoalsRequest(
                calorieTarget,
                proteinMin,
                fitnessTargets,
              )
            : undefined,
      },
      onDelta: (text) => setStreamPreview(text.slice(-120)),
    });

    router.push(`/app/recipes/${result.recipe.id}`);
  }

  const limitReached = usage ? usage.remaining <= 0 : false;
  const aiDisabled = aiStatus?.configured === false;

  if (pantryLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
    );
  }

  if (pantryError) {
    return (
      <ErrorFallback
        title="Erro ao carregar despensa"
        message={pantryError.message}
      />
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <Card className="surface-card">
          <CardHeader>
            <CardTitle>Tipo de receita</CardTitle>
            <CardDescription>Escolha o estilo da geração.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {MODES.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => selectMode(item.id)}
                disabled={seniorMode && item.id !== "SENIOR"}
                className={cn(
                  "rounded-xl border p-4 text-left transition-colors",
                  activeMode === item.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/30",
                )}
              >
                <item.icon className="mb-2 size-5 text-primary" />
                <p className="font-medium">{item.label}</p>
                <p className="text-xs text-muted-foreground">
                  {item.description}
                </p>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card className="surface-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="size-5 text-primary" />
              Ingredientes
            </CardTitle>
            <CardDescription>
              Selecione o que você tem disponível para a receita.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {allIngredients.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {allIngredients.map((name) => {
                  const isActive = effectiveSelected.has(name);
                  return (
                    <button
                      key={name}
                      type="button"
                      onClick={() => toggleIngredient(name)}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors",
                        isActive
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-background text-muted-foreground hover:border-primary/40",
                      )}
                    >
                      {isActive && <Check className="size-3.5" />}
                      {name}
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Sua despensa está vazia. Adicione ingredientes abaixo ou na{" "}
                <Link href="/app/pantry" className="text-primary underline">
                  despensa
                </Link>
                .
              </p>
            )}

            <div className="flex gap-2">
              <Input
                value={customIngredient}
                onChange={(e) => setCustomIngredient(e.target.value)}
                placeholder="Adicionar ingrediente extra..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCustomIngredient();
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={addCustomIngredient}
              >
                Adicionar
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="surface-card">
          <CardHeader>
            <CardTitle>Preferências</CardTitle>
            <CardDescription>Opcional — personalize a receita.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="servings">Porções</Label>
                <Input
                  id="servings"
                  type="number"
                  min={1}
                  max={12}
                  value={servings}
                  onChange={(e) => setServings(Number(e.target.value) || 4)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxTime">Tempo máximo (min)</Label>
                <Input
                  id="maxTime"
                  type="number"
                  min={5}
                  max={180}
                  placeholder="Ex: 45"
                  value={maxTime}
                  onChange={(e) => setMaxTime(e.target.value)}
                />
              </div>
            </div>

            {activeMode === "FITNESS" && (
              <div className="space-y-4">
                {fitnessTargets && bodyProfile?.fitness_goal ? (
                  <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm">
                    <p className="font-medium text-primary">
                      Metas do seu perfil (
                      {FITNESS_GOAL_LABELS[bodyProfile.fitness_goal].label})
                    </p>
                    <p className="mt-1 text-muted-foreground">
                      {profile?.body_weight_kg} kg · {profile?.body_height_cm}{" "}
                      cm · ~{fitnessTargets.calorieTarget} kcal/porção ·{" "}
                      {fitnessTargets.proteinMinGrams} g proteína/porção
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      A IA adaptará proteínas, calorias e quantidades. Você pode
                      ajustar os valores abaixo.
                    </p>
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
                    Configure peso, altura e objetivo em{" "}
                    <Link
                      href="/app/profile"
                      className="font-medium text-primary underline-offset-4 hover:underline"
                    >
                      Perfil
                    </Link>{" "}
                    para receitas fitness personalizadas.
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="calories">Meta calórica / porção</Label>
                    <Input
                      id="calories"
                      type="number"
                      min={200}
                      max={1500}
                      placeholder="Ex: 450"
                      value={calorieTarget}
                      onChange={(e) => setCalorieTarget(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="protein">Proteína mínima (g)</Label>
                    <Input
                      id="protein"
                      type="number"
                      min={10}
                      max={120}
                      placeholder="Ex: 35"
                      value={proteinMin}
                      onChange={(e) => setProteinMin(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Formato do prato</Label>
              <p className="text-xs text-muted-foreground">
                Bolo, pudim, mingau, refogado… A IA adapta os passos (forno,
                forma, geladeira).
              </p>
              <div className="flex flex-wrap gap-2">
                {PREPARATION_STYLE_OPTIONS.map((option) => (
                  <button
                    key={option.label}
                    type="button"
                    onClick={() => setPreparationStyle(option.value)}
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs transition-colors",
                      preparationStyle === option.value
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/40",
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {DIETARY_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => toggleDietary(option.value)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs transition-colors",
                    dietary.has(option.value)
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/40",
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input
                type="checkbox"
                checked={forceRegenerate}
                onChange={(event) => setForceRegenerate(event.target.checked)}
              />
              Ignorar cache e gerar nova receita
            </label>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <Card className="surface-card sticky top-4">
          <CardHeader>
            <CardTitle>Gerar receita</CardTitle>
            <CardDescription>
              {selectedIngredients.length} ingrediente
              {selectedIngredients.length !== 1 ? "s" : ""} selecionado
              {selectedIngredients.length !== 1 ? "s" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {usage && (
              <div className="rounded-xl bg-muted/50 p-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Uso mensal</span>
                  <Badge variant="secondary">
                    {usage.used}/{usage.limit}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Plano {usage.plan} · {usage.remaining} restante
                  {usage.remaining !== 1 ? "s" : ""}
                </p>
              </div>
            )}

            {generateStream.isPending && streamPreview && (
              <p className="rounded-lg bg-muted/40 p-2 font-mono text-[11px] text-muted-foreground">
                {streamPreview}
              </p>
            )}

            <Button
              className="w-full gap-2"
              size="lg"
              disabled={
                generateStream.isPending ||
                selectedIngredients.length === 0 ||
                limitReached ||
                aiDisabled
              }
              onClick={handleGenerate}
            >
              {generateStream.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Gerando com streaming...
                </>
              ) : (
                <>
                  <Sparkles className="size-4" />
                  Gerar com IA
                </>
              )}
            </Button>

            {aiDisabled && (
              <p className="text-center text-xs text-amber-700 dark:text-amber-400">
                Configure OPENAI_API_KEY no .env para habilitar a IA.
              </p>
            )}

            {limitReached && !aiDisabled && (
              <p className="text-center text-xs text-muted-foreground">
                Limite atingido.{" "}
                <Link href="/pricing" className="text-primary underline">
                  Ver planos
                </Link>
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
