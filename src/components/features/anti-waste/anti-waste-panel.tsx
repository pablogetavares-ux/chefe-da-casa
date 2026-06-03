"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Clock,
  Leaf,
  Loader2,
  Recycle,
  Sparkles,
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
import { Textarea } from "@/components/ui/textarea";
import { ErrorFallback } from "@/components/shared/error-fallback";
import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useAiUsage,
  useAntiWasteSummary,
  useGenerateAntiWasteRecipe,
} from "@/hooks/use-api";
import type { AntiWastePantryItem } from "@/lib/queries/anti-waste";
import { formatExpiryLabel, getExpiryStatus } from "@/lib/utils/pantry";
import { cn } from "@/lib/utils";

function ItemChip({
  item,
  selected,
  onToggle,
}: {
  item: AntiWastePantryItem;
  selected: boolean;
  onToggle: () => void;
}) {
  const expiryStatus = getExpiryStatus(item.expires_at);
  const isLeftover = item.item_kind === "leftover";

  return (
    <label
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors",
        selected
          ? "border-primary/50 bg-primary/5"
          : "border-border hover:bg-muted/40",
      )}
    >
      <input
        type="checkbox"
        checked={selected}
        onChange={onToggle}
        className="mt-1 size-4 rounded border-input accent-primary"
      />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium">{item.name}</span>
          {isLeftover && (
            <Badge variant="secondary" className="text-[10px]">
              Sobra
            </Badge>
          )}
          {expiryStatus === "expired" && (
            <Badge variant="destructive" className="text-[10px]">
              Vencido
            </Badge>
          )}
          {expiryStatus === "soon" && (
            <Badge className="border-amber-500/40 bg-amber-500/10 text-[10px] text-amber-800 dark:text-amber-300">
              Vence logo
            </Badge>
          )}
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {formatExpiryLabel(item.expires_at) ??
            (item.notes ? item.notes : "Sem validade cadastrada")}
        </p>
      </div>
    </label>
  );
}

export function AntiWastePanel() {
  const router = useRouter();
  const { data: summary, isLoading, error } = useAntiWasteSummary();
  const { data: usage } = useAiUsage();
  const generate = useGenerateAntiWasteRecipe();

  const atRiskItems = useMemo(() => {
    if (!summary) return [];
    const map = new Map<string, AntiWastePantryItem>();
    for (const item of [
      ...summary.expired,
      ...summary.expiringSoon,
      ...summary.leftovers,
    ]) {
      map.set(item.id, item);
    }
    return [...map.values()];
  }, [summary]);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [extraNotes, setExtraNotes] = useState("");
  const [maxPrepTime, setMaxPrepTime] = useState("");

  const effectiveSelected =
    selectedIds.size > 0
      ? selectedIds
      : new Set(atRiskItems.map((item) => item.id));

  function toggleItem(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleGenerate() {
    const ids = [...effectiveSelected];
    const result = await generate.mutateAsync({
      pantryItemIds: ids.length === atRiskItems.length ? undefined : ids,
      extraNotes: extraNotes.trim() || undefined,
      maxPrepTimeMinutes: maxPrepTime ? Number(maxPrepTime) : undefined,
      includeSupplementalPantry: true,
      servings: 4,
      forceRegenerate: false,
    });
    router.push(`/app/recipes/${result.recipe.id}`);
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-28 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorFallback compact title="Erro ao carregar" message={error.message} />
    );
  }

  if (!summary || summary.stats.totalAtRisk === 0) {
    return (
      <EmptyState
        icon={Leaf}
        title="Nada para reaproveitar agora"
        description="Cadastre validades na despensa ou marque sobras para receber sugestões anti-desperdício."
        action={
          <Link href="/app/pantry">
            <Button className="gap-2">
              <Recycle className="size-4" />
              Ir para despensa
            </Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="surface-card border-amber-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="size-4 text-amber-600" />
              Vencendo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">
              {summary.stats.expiringSoonCount}
            </p>
          </CardContent>
        </Card>
        <Card className="surface-card border-destructive/30">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="size-4 text-destructive" />
              Vencidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">
              {summary.stats.expiredCount}
            </p>
          </CardContent>
        </Card>
        <Card className="surface-card border-emerald-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Recycle className="size-4 text-emerald-600" />
              Sobras
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">
              {summary.stats.leftoverCount}
            </p>
          </CardContent>
        </Card>
      </div>

      {summary.suggestions.length > 0 && (
        <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-900 dark:text-emerald-200">
          <ul className="list-disc space-y-1 pl-5">
            {summary.suggestions.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        </div>
      )}

      <Card className="surface-card">
        <CardHeader>
          <CardTitle>Itens para reaproveitar</CardTitle>
          <CardDescription>
            Selecione o que entrar na receita (por padrão, todos os itens em
            risco).
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2 sm:grid-cols-2">
          {atRiskItems.map((item) => (
            <ItemChip
              key={item.id}
              item={item}
              selected={effectiveSelected.has(item.id)}
              onToggle={() => toggleItem(item.id)}
            />
          ))}
        </CardContent>
      </Card>

      <Card className="surface-card">
        <CardHeader>
          <CardTitle>Preferências</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="anti-waste-notes">Observações (opcional)</Label>
            <Textarea
              id="anti-waste-notes"
              placeholder="Ex: quero algo rápido para o jantar, tenho feijão de ontem..."
              value={extraNotes}
              onChange={(e) => setExtraNotes(e.target.value)}
              rows={3}
            />
          </div>
          <div className="space-y-1.5 max-w-xs">
            <Label htmlFor="anti-waste-time">Tempo máximo (min)</Label>
            <Input
              id="anti-waste-time"
              type="number"
              min={5}
              max={180}
              placeholder="Ex: 30"
              value={maxPrepTime}
              onChange={(e) => setMaxPrepTime(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          size="lg"
          className="gap-2"
          disabled={generate.isPending || effectiveSelected.size === 0}
          onClick={handleGenerate}
        >
          {generate.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Sparkles className="size-4" />
          )}
          Gerar receita anti-desperdício
        </Button>
        {usage && (
          <span className="text-sm text-muted-foreground">
            {usage.remaining} gerações IA restantes
          </span>
        )}
      </div>
    </div>
  );
}
