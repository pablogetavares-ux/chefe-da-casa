"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Dumbbell } from "lucide-react";

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
  calculateFitnessTargets,
  hasCompleteBodyProfile,
} from "@/lib/fitness/calculate-targets";
import {
  FITNESS_GOALS,
  FITNESS_GOAL_LABELS,
  type FitnessGoalType,
} from "@/lib/fitness/constants";
import { useUpdateProfile } from "@/hooks/use-api";
import type { Profile } from "@/types/database";
import { cn } from "@/lib/utils";

type FitnessProfileSectionProps = {
  profile: Profile;
};

function FitnessProfileForm({ profile }: FitnessProfileSectionProps) {
  const updateProfile = useUpdateProfile();
  const [weight, setWeight] = useState(() =>
    profile.body_weight_kg != null ? String(profile.body_weight_kg) : "",
  );
  const [height, setHeight] = useState(() =>
    profile.body_height_cm != null ? String(profile.body_height_cm) : "",
  );
  const [goal, setGoal] = useState<FitnessGoalType | "">(
    () => (profile.fitness_goal as FitnessGoalType | null) ?? "",
  );

  const preview = useMemo(() => {
    const weightKg = Number(weight);
    const heightCm = Number(height);
    if (
      !weight ||
      !height ||
      !goal ||
      Number.isNaN(weightKg) ||
      Number.isNaN(heightCm)
    ) {
      return null;
    }

    return calculateFitnessTargets({
      weightKg,
      heightCm,
      goal,
    });
  }, [weight, height, goal]);

  const isComplete = hasCompleteBodyProfile({
    body_weight_kg: weight ? Number(weight) : null,
    body_height_cm: height ? Number(height) : null,
    fitness_goal: goal || null,
  });

  function handleSave() {
    if (!goal || !isComplete) return;

    updateProfile.mutate({
      bodyWeightKg: Number(weight),
      bodyHeightCm: Number(height),
      fitnessGoal: goal,
    });
  }

  return (
    <Card className="surface-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Dumbbell className="size-5 text-primary" />
          Objetivo físico
        </CardTitle>
        <CardDescription>
          Informe peso, altura e objetivo para receitas fitness personalizadas.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="bodyWeight">Peso (kg)</Label>
            <Input
              id="bodyWeight"
              type="number"
              min={30}
              max={300}
              step={0.1}
              placeholder="Ex: 72"
              value={weight}
              onChange={(event) => setWeight(event.target.value)}
              className="h-10"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bodyHeight">Altura (cm)</Label>
            <Input
              id="bodyHeight"
              type="number"
              min={100}
              max={250}
              step={0.5}
              placeholder="Ex: 175"
              value={height}
              onChange={(event) => setHeight(event.target.value)}
              className="h-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Objetivo</Label>
          <div className="grid gap-2 sm:grid-cols-3">
            {FITNESS_GOALS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setGoal(option)}
                className={cn(
                  "rounded-xl border p-3 text-left transition-colors",
                  goal === option
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/40",
                )}
              >
                <p className="text-sm font-medium">
                  {FITNESS_GOAL_LABELS[option].label}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {FITNESS_GOAL_LABELS[option].description}
                </p>
              </button>
            ))}
          </div>
        </div>

        {preview && (
          <div className="rounded-xl border bg-muted/30 p-4 text-sm">
            <p className="font-medium">Metas estimadas (por refeição)</p>
            <p className="mt-1 text-muted-foreground">
              ~{preview.calorieTarget} kcal · {preview.proteinMinGrams} g
              proteína
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Diário: ~{preview.dailyCalories} kcal ·{" "}
              {preview.dailyProteinGrams} g proteína
            </p>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <Button
            onClick={handleSave}
            disabled={!isComplete || updateProfile.isPending}
          >
            {updateProfile.isPending ? "Salvando..." : "Salvar objetivo físico"}
          </Button>
          <Link
            href="/app/generate"
            className="inline-flex h-9 items-center justify-center rounded-md px-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Gerar receita fitness
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export function FitnessProfileSection({ profile }: FitnessProfileSectionProps) {
  return <FitnessProfileForm key={profile.updated_at} profile={profile} />;
}
