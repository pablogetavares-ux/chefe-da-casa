"use client";

import { CheckCircle2, Circle, ExternalLink, ShieldAlert } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminLaunchChecklist } from "@/shared/hooks/api/admin";

const STATUS_LABEL = {
  done: "Concluído",
  pending: "Pendente",
  warning: "Atenção",
} as const;

export function AdminSystemPanel() {
  const { data, isLoading, error } = useAdminLaunchChecklist();

  if (error) {
    return (
      <p className="text-sm text-muted-foreground">
        Falha ao carregar checklist de sistema.
      </p>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  if (!data) return null;

  const { production, checklist, readyToLaunch, urls } = data;

  return (
    <div className="space-y-6">
      <div className="surface-card space-y-4 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-heading font-medium">
              Prontidão para produção
            </h3>
            <p className="text-sm text-muted-foreground">
              Ambiente: {production.environment}
            </p>
          </div>
          <Badge variant={readyToLaunch ? "default" : "secondary"}>
            {readyToLaunch ? "Pronto para lançar" : "Ajustes pendentes"}
          </Badge>
        </div>

        {production.blockers.length > 0 ? (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
            <p className="mb-2 flex items-center gap-2 text-sm font-medium text-destructive">
              <ShieldAlert className="size-4" />
              Bloqueios
            </p>
            <ul className="list-inside list-disc text-sm text-muted-foreground">
              {production.blockers.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {production.warnings.length > 0 ? (
          <ul className="text-sm text-muted-foreground">
            {production.warnings.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <a
            href={urls.health}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-7 items-center gap-1 rounded-lg border border-border bg-background px-2.5 text-sm hover:bg-muted"
          >
            Health <ExternalLink className="size-3" />
          </a>
          <a
            href={urls.supabase}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-7 items-center gap-1 rounded-lg border border-border bg-background px-2.5 text-sm hover:bg-muted"
          >
            Supabase <ExternalLink className="size-3" />
          </a>
        </div>
      </div>

      <div className="surface-card p-6">
        <h3 className="mb-4 font-heading font-medium">Checklist de go-live</h3>
        <ul className="space-y-3">
          {checklist.map((item) => (
            <li
              key={item.id}
              className="flex gap-3 rounded-lg border border-border/50 p-3"
            >
              {item.status === "done" ? (
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" />
              ) : (
                <Circle className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{item.title}</p>
                  <Badge variant="outline" className="text-xs">
                    {STATUS_LABEL[item.status]}
                  </Badge>
                </div>
                {item.detail ? (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.detail}
                  </p>
                ) : null}
                {item.url ? (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    Abrir <ExternalLink className="size-3" />
                  </a>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
