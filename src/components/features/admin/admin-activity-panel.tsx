"use client";

import { Activity } from "lucide-react";

import {
  AdminTable,
  AdminTableBody,
  AdminTableHead,
  AdminTd,
  AdminTh,
  AdminTr,
} from "@/components/features/admin/admin-table";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminActivity } from "@/shared/hooks/api/admin";

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function AdminActivityPanel() {
  const { data, isLoading, error } = useAdminActivity(50);

  if (error) {
    return (
      <p className="text-sm text-muted-foreground">
        Não foi possível carregar o log de atividade.
      </p>
    );
  }

  if (isLoading) {
    return <Skeleton className="h-64 rounded-2xl" />;
  }

  const items = data?.items ?? [];

  return (
    <div className="space-y-4">
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <Activity className="size-4" />
        Últimos eventos registrados em{" "}
        <code className="text-xs">usage_logs</code>
      </p>

      <AdminTable>
        <AdminTableHead>
          <AdminTh>Quando</AdminTh>
          <AdminTh>Ação</AdminTh>
          <AdminTh>Usuário</AdminTh>
        </AdminTableHead>
        <AdminTableBody>
          {items.length ? (
            items.map((row) => (
              <AdminTr key={row.id}>
                <AdminTd className="text-muted-foreground whitespace-nowrap">
                  {formatDateTime(row.createdAt)}
                </AdminTd>
                <AdminTd>
                  <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                    {row.action}
                  </code>
                </AdminTd>
                <AdminTd>
                  {row.userEmail ?? (
                    <span className="text-xs text-muted-foreground">
                      {row.userId.slice(0, 8)}…
                    </span>
                  )}
                </AdminTd>
              </AdminTr>
            ))
          ) : (
            <AdminTr>
              <AdminTd
                colSpan={3}
                className="py-8 text-center text-muted-foreground"
              >
                Sem eventos recentes ou modo demo sem service role.
              </AdminTd>
            </AdminTr>
          )}
        </AdminTableBody>
      </AdminTable>
    </div>
  );
}
