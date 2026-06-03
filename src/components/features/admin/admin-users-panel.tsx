"use client";

import { useEffect, useState } from "react";

import { AdminPagination } from "@/components/features/admin/admin-pagination";
import { AdminSearchBar } from "@/components/features/admin/admin-search-bar";
import {
  AdminTable,
  AdminTableBody,
  AdminTableHead,
  AdminTd,
  AdminTh,
  AdminTr,
} from "@/components/features/admin/admin-table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminUsers } from "@/shared/hooks/api/admin";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function AdminUsersPanel() {
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQ(q);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [q]);

  const { data, isLoading, error } = useAdminUsers({
    page,
    q: debouncedQ || undefined,
  });

  if (error) {
    return (
      <p className="text-sm text-muted-foreground">
        Não foi possível carregar usuários. Verifique SUPABASE_SERVICE_ROLE_KEY.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <AdminSearchBar
        value={q}
        onChange={setQ}
        placeholder="Buscar por e-mail ou nome…"
      />

      {isLoading ? (
        <Skeleton className="h-64 rounded-2xl" />
      ) : (
        <>
          <AdminTable>
            <AdminTableHead>
              <AdminTh>E-mail</AdminTh>
              <AdminTh>Nome</AdminTh>
              <AdminTh>Plano</AdminTh>
              <AdminTh>Região ofertas</AdminTh>
              <AdminTh>Cadastro</AdminTh>
            </AdminTableHead>
            <AdminTableBody>
              {data?.items.length ? (
                data.items.map((user) => (
                  <AdminTr key={user.id}>
                    <AdminTd className="font-medium">{user.email}</AdminTd>
                    <AdminTd>{user.fullName ?? "—"}</AdminTd>
                    <AdminTd>
                      <Badge variant="secondary">{user.plan}</Badge>
                    </AdminTd>
                    <AdminTd className="text-muted-foreground">
                      {user.offerCity && user.offerState
                        ? `${user.offerCity} — ${user.offerState}${user.offerRadiusKm ? ` · ${user.offerRadiusKm} km` : ""}`
                        : "Padrão (BH)"}
                    </AdminTd>
                    <AdminTd className="text-muted-foreground">
                      {formatDate(user.createdAt)}
                    </AdminTd>
                  </AdminTr>
                ))
              ) : (
                <AdminTr>
                  <AdminTd
                    colSpan={5}
                    className="py-8 text-center text-muted-foreground"
                  >
                    Nenhum usuário encontrado.
                  </AdminTd>
                </AdminTr>
              )}
            </AdminTableBody>
          </AdminTable>

          {data && data.total > 0 ? (
            <AdminPagination
              page={data.page}
              totalPages={data.totalPages}
              total={data.total}
              onPageChange={setPage}
            />
          ) : null}
        </>
      )}
    </div>
  );
}
