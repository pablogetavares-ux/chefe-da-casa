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
import {
  formatOfferPrice,
  OFFER_CATEGORY_LABELS,
  type OfferCategory,
} from "@/modules/offers/types";
import { useAdminOffers } from "@/shared/hooks/api/admin";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });
}

export function AdminOffersPanel() {
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

  const { data, isLoading, error } = useAdminOffers({
    page,
    q: debouncedQ || undefined,
  });

  if (error) {
    return (
      <p className="text-sm text-muted-foreground">
        Não foi possível carregar ofertas regionais.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <AdminSearchBar
        value={q}
        onChange={setQ}
        placeholder="Buscar por título ou produto…"
      />

      {isLoading ? (
        <Skeleton className="h-64 rounded-2xl" />
      ) : (
        <>
          <AdminTable>
            <AdminTableHead>
              <AdminTh>Produto</AdminTh>
              <AdminTh>Categoria</AdminTh>
              <AdminTh>Preço</AdminTh>
              <AdminTh>Loja</AdminTh>
              <AdminTh>Validade</AdminTh>
              <AdminTh>Status</AdminTh>
            </AdminTableHead>
            <AdminTableBody>
              {data?.items.length ? (
                data.items.map((offer) => (
                  <AdminTr key={offer.id}>
                    <AdminTd>
                      <p className="font-medium">{offer.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {offer.productName}
                      </p>
                    </AdminTd>
                    <AdminTd>
                      {OFFER_CATEGORY_LABELS[offer.category as OfferCategory] ??
                        offer.category}
                    </AdminTd>
                    <AdminTd>
                      <span className="font-medium text-primary">
                        {formatOfferPrice(offer.currentPrice)}
                      </span>
                      {offer.previousPrice != null ? (
                        <span className="ml-1 text-xs text-muted-foreground line-through">
                          {formatOfferPrice(offer.previousPrice)}
                        </span>
                      ) : null}
                    </AdminTd>
                    <AdminTd className="text-muted-foreground">
                      {offer.storeName}
                      <br />
                      <span className="text-xs">
                        {offer.storeCity} — {offer.storeState}
                      </span>
                    </AdminTd>
                    <AdminTd className="text-muted-foreground">
                      {formatDate(offer.validUntil)}
                    </AdminTd>
                    <AdminTd>
                      <Badge
                        variant={offer.isActive ? "default" : "secondary"}
                        className={offer.isActive ? "bg-primary" : ""}
                      >
                        {offer.isActive ? "Ativa" : "Inativa"}
                      </Badge>
                    </AdminTd>
                  </AdminTr>
                ))
              ) : (
                <AdminTr>
                  <AdminTd
                    colSpan={6}
                    className="py-8 text-center text-muted-foreground"
                  >
                    Nenhuma oferta encontrada.
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
