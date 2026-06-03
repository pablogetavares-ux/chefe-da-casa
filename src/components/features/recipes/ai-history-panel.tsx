"use client";

import Link from "next/link";
import { Clock, History, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAiHistory } from "@/hooks/use-api";
import { ErrorFallback } from "@/components/shared/error-fallback";

const statusLabel = {
  COMPLETED: "Concluída",
  FAILED: "Falhou",
  PENDING: "Pendente",
  CANCELED: "Cancelada",
} as const;

export function AiHistoryPanel() {
  const { data, isLoading, error } = useAiHistory();

  if (isLoading) {
    return (
      <Card className="surface-card">
        <CardContent className="py-8">
          <div className="h-24 animate-pulse rounded-xl bg-muted" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <ErrorFallback
        compact
        title="Erro ao carregar histórico"
        message={error.message}
      />
    );
  }

  const items = data?.items ?? [];

  return (
    <Card className="surface-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="size-5 text-primary" />
          Histórico de IA
        </CardTitle>
        <CardDescription>Últimas gerações e refinamentos.</CardDescription>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhuma geração ainda. Crie sua primeira receita acima.
          </p>
        ) : (
          <ul className="space-y-3">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex flex-wrap items-start justify-between gap-3 rounded-xl border bg-muted/20 p-3 text-sm"
              >
                <div className="space-y-1">
                  <p className="font-medium">
                    {item.recipeTitle ?? "Sem receita vinculada"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.summary}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="size-3" />
                      {new Date(item.createdAt).toLocaleString("pt-BR")}
                    </span>
                    {item.totalTokens > 0 && (
                      <span>{item.totalTokens} tokens</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      item.status === "COMPLETED" ? "secondary" : "outline"
                    }
                  >
                    {statusLabel[item.status as keyof typeof statusLabel] ??
                      item.status}
                  </Badge>
                  {item.recipeId && (
                    <Link
                      href={`/app/recipes/${item.recipeId}`}
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      <Sparkles className="size-3" />
                      Ver
                    </Link>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
