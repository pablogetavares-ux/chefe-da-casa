"use client";

import Link from "next/link";
import { HeartHandshake } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useUpdateProfile } from "@/hooks/use-api";
import type { Profile } from "@/types/database";

type SeniorModeSectionProps = {
  profile: Profile;
};

export function SeniorModeSection({ profile }: SeniorModeSectionProps) {
  const updateProfile = useUpdateProfile();
  const enabled = profile.senior_mode_enabled ?? false;

  function handleToggle() {
    updateProfile.mutate({ seniorModeEnabled: !enabled });
  }

  return (
    <Card className="surface-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HeartHandshake className="size-5 text-primary" />
          Modo idoso
        </CardTitle>
        <CardDescription>
          Receitas simples, fáceis de mastigar e nutritivas — ideal para idosos
          ou quem prefere texturas macias.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors hover:bg-muted/30">
          <input
            type="checkbox"
            checked={enabled}
            onChange={handleToggle}
            disabled={updateProfile.isPending}
            className="mt-1 size-4 rounded border-input accent-primary"
          />
          <div>
            <p className="font-medium">Ativar modo idoso</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Ao gerar receitas, o app prioriza preparo simples, ingredientes
              bem cozidos e porções nutritivas.
            </p>
          </div>
        </label>

        <Link
          href="/app/generate"
          className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium transition-colors hover:bg-muted"
        >
          Gerar receita no modo idoso
        </Link>
      </CardContent>
    </Card>
  );
}
