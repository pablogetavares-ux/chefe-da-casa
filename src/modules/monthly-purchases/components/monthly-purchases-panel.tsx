"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import {
  ArrowLeft,
  Copy,
  History,
  ListPlus,
  Plus,
  Search,
  ShoppingBag,
} from "lucide-react";
import { toast } from "sonner";

import { AnimatedPage, FadeIn } from "@/components/shared/motion";
import { PageHeader } from "@/components/shared/page-header";
import { PanelSkeleton } from "@/components/shared/panel-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { MonthPeriodPicker } from "@/modules/monthly-purchases/components/month-period-picker";
import { MonthlyCopyPreviousDialog } from "@/modules/monthly-purchases/components/monthly-copy-previous-dialog";
import { MonthlyPurchaseFilterTabs } from "@/modules/monthly-purchases/components/monthly-purchase-filter-tabs";
import { MonthlyPurchaseFormDialog } from "@/modules/monthly-purchases/components/monthly-purchase-form-dialog";
import { MonthlyPurchaseItemRow } from "@/modules/monthly-purchases/components/monthly-purchase-item-row";
import { MonthlyPurchaseDashboardPanel } from "@/modules/monthly-purchases/components/monthly-purchase-dashboard";
import { MonthlyPurchaseDashboardSkeleton } from "@/modules/monthly-purchases/components/monthly-purchase-dashboard-skeleton";
import { MONTHLY_QUICK_ITEMS } from "@/modules/monthly-purchases/constants/quick-items";
import type { MonthlyQuickItem } from "@/modules/monthly-purchases/constants/quick-items";
import {
  currentPeriod,
  periodLabel,
} from "@/modules/monthly-purchases/constants/period";
import { MONTH_PURCHASE_CATEGORY_LABELS } from "@/modules/monthly-purchases/constants/categories";
import type { MonthlyPurchaseFormValues } from "@/modules/monthly-purchases/hooks/use-monthly-purchase-form";
import { formValuesToInput } from "@/modules/monthly-purchases/hooks/use-monthly-purchase-form";
import {
  isCopyPromptResolved,
  markCopyPromptResolved,
} from "@/modules/monthly-purchases/lib/copy-prompt-storage";
import type { MonthPurchaseItemUpdateInput } from "@/lib/validations/monthly-purchases";
import type {
  MonthListFilter,
  MonthShoppingItem,
} from "@/modules/monthly-purchases/types";
import {
  buildMonthPurchaseInsights,
  filterMonthItems,
} from "@/modules/monthly-purchases/utils/insights";
import {
  useMonthlyCopySuggestion,
  useMonthlyPurchaseDashboard,
  useMonthlyPurchaseMutations,
  useMonthlyPurchases,
} from "@/shared/hooks/api/monthly-purchases";

type MonthlyPurchasesPanelProps = {
  readOnly?: boolean;
  initialMonth?: number;
  initialYear?: number;
  backHref?: string;
  backLabel?: string;
};

export function MonthlyPurchasesPanel({
  readOnly = false,
  initialMonth,
  initialYear,
  backHref,
  backLabel = "Voltar",
}: MonthlyPurchasesPanelProps = {}) {
  const initial = currentPeriod();
  const [month, setMonth] = useState(initialMonth ?? initial.month);
  const [year, setYear] = useState(initialYear ?? initial.year);
  const [search, setSearch] = useState("");
  const [listFilter, setListFilter] = useState<MonthListFilter>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MonthShoppingItem | null>(
    null,
  );
  const [quickPreset, setQuickPreset] = useState<MonthlyQuickItem | null>(null);
  const [copyDialogOpen, setCopyDialogOpen] = useState(false);
  const [copySourceMonth, setCopySourceMonth] = useState<number | null>(null);
  const [copySourceYear, setCopySourceYear] = useState<number | null>(null);

  const { data, isLoading, error, isFetching } = useMonthlyPurchases(
    month,
    year,
  );
  const { data: copySuggestion } = useMonthlyCopySuggestion(month, year);
  const showDashboard = (data?.items.length ?? 0) > 0;
  const {
    data: dashboard,
    isLoading: dashboardLoading,
    isFetching: dashboardFetching,
  } = useMonthlyPurchaseDashboard(month, year, {
    enabled: showDashboard,
  });
  const mutations = useMonthlyPurchaseMutations(month, year);
  const copyMutation = mutations.copyFromMonth ?? mutations.copyFromPrevious;
  const { confirm, dialog: confirmDialog } = useConfirmDialog();

  const label = periodLabel(month, year);
  const insights = useMemo(
    () => buildMonthPurchaseInsights(data?.items ?? []),
    [data?.items],
  );

  const filteredItems = useMemo(
    () =>
      filterMonthItems(data?.items ?? [], {
        query: search,
        listFilter,
      }),
    [data?.items, search, listFilter],
  );

  const displayGroups = useMemo(
    () => buildMonthPurchaseInsights(filteredItems).groups,
    [filteredItems],
  );

  const listExists = Boolean(data?.list);
  const showEmptyMonth = listExists && data?.items.length === 0;
  const copySources = copySuggestion?.sources ?? [];
  const hasCopySources = copySources.length > 0;
  const canCopyFromOtherMonth =
    hasCopySources && (data?.items.length ?? 0) === 0;

  const periodKey = `${month}-${year}`;
  const autoPromptedRef = useRef<string | null>(null);
  const copyPromptReady = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const effectiveCopySourceMonth =
    copySourceMonth ?? copySuggestion?.defaultSource?.month ?? null;
  const effectiveCopySourceYear =
    copySourceYear ?? copySuggestion?.defaultSource?.year ?? null;

  const shouldAutoPrompt =
    copyPromptReady &&
    !readOnly &&
    copySuggestion?.shouldPrompt &&
    !isCopyPromptResolved(month, year);

  useEffect(() => {
    if (!shouldAutoPrompt || autoPromptedRef.current === periodKey) return;
    autoPromptedRef.current = periodKey;
    setCopyDialogOpen(true);
  }, [shouldAutoPrompt, periodKey]);

  function resetCopyUiForNewPeriod() {
    setCopyDialogOpen(false);
    setCopySourceMonth(null);
    setCopySourceYear(null);
    autoPromptedRef.current = null;
  }

  function openCopyDialog() {
    const defaultSource = copySuggestion?.defaultSource;
    if (defaultSource) {
      setCopySourceMonth(defaultSource.month);
      setCopySourceYear(defaultSource.year);
    }
    setCopyDialogOpen(true);
  }

  function openCreate(preset?: MonthlyQuickItem) {
    setEditingItem(null);
    setQuickPreset(preset ?? null);
    setDialogOpen(true);
  }

  function openEdit(item: MonthShoppingItem) {
    setQuickPreset(null);
    setEditingItem(item);
    setDialogOpen(true);
  }

  async function handleCreate(values: MonthlyPurchaseFormValues) {
    const input = formValuesToInput(values);
    try {
      await mutations.addItem.mutateAsync({
        month,
        year,
        ...input,
      });
      toast.success("Item adicionado à lista");
      setDialogOpen(false);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Não foi possível adicionar",
      );
    }
  }

  const handleAutoSave = useCallback(
    async (payload: MonthPurchaseItemUpdateInput) => {
      if (!editingItem) return;
      await mutations.updateItem.mutateAsync({
        id: editingItem.id,
        body: payload,
      });
    },
    [editingItem, mutations.updateItem],
  );

  async function handleToggle(item: MonthShoppingItem, purchased: boolean) {
    try {
      await mutations.togglePurchased.mutateAsync({
        id: item.id,
        is_purchased: purchased,
      });
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Não foi possível atualizar",
      );
    }
  }

  async function handleDelete(item: MonthShoppingItem) {
    const ok = await confirm({
      title: "Remover da lista?",
      description: `"${item.name}" será excluído de ${label}.`,
      confirmLabel: "Remover",
      destructive: true,
    });
    if (!ok) return;

    try {
      await mutations.deleteItem.mutateAsync(item.id);
      toast.success("Item removido");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Não foi possível remover",
      );
    }
  }

  async function handleCreateList() {
    try {
      await mutations.createList.mutateAsync();
      toast.success(`Lista de ${label} pronta`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Não foi possível criar a lista",
      );
    }
  }

  async function handleCopyFromSelected() {
    if (effectiveCopySourceMonth == null || effectiveCopySourceYear == null) {
      return;
    }

    markCopyPromptResolved(month, year, "copied");
    setCopyDialogOpen(false);
    const sourceLabel =
      copySources.find(
        (s) =>
          s.month === effectiveCopySourceMonth &&
          s.year === effectiveCopySourceYear,
      )?.label ?? "mês selecionado";

    try {
      if (!copyMutation) {
        throw new Error("Ação de cópia indisponível. Recarregue a página.");
      }
      await copyMutation.mutateAsync({
        sourceMonth: effectiveCopySourceMonth,
        sourceYear: effectiveCopySourceYear,
      });
      toast.success(`Lista copiada de ${sourceLabel}`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Não foi possível copiar a lista",
      );
    }
  }

  async function handleCreateEmptyFromPrompt() {
    markCopyPromptResolved(month, year, "empty");
    setCopyDialogOpen(false);
    if (data?.list) {
      toast.success(`Lista de ${label} pronta para você preencher`);
      return;
    }
    try {
      await mutations.createList.mutateAsync();
      toast.success(`Lista vazia de ${label} criada`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Não foi possível criar a lista",
      );
    }
  }

  if (error) {
    return (
      <AnimatedPage>
        <PageHeader
          title={readOnly ? `Consulta — ${label}` : "Compras do Mês"}
          description={
            readOnly
              ? "Visualização somente leitura desta lista."
              : "Sua lista fixa de compras do mercado, feira e farmácia."
          }
        />
        <div className="surface-card p-8 text-center text-muted-foreground">
          Não foi possível carregar. Faça login e tente novamente.
        </div>
      </AnimatedPage>
    );
  }

  if (isLoading || !data) {
    return (
      <AnimatedPage>
        <PageHeader
          title={readOnly ? `Consulta — ${label}` : "Compras do Mês"}
          description={
            readOnly
              ? "Carregando lista para consulta…"
              : "Organize o que comprar e o que já comprou neste mês."
          }
        />
        <PanelSkeleton rows={5} label="Carregando lista do mês..." />
      </AnimatedPage>
    );
  }

  return (
    <AnimatedPage>
      {confirmDialog}

      {!readOnly && (
        <MonthlyCopyPreviousDialog
          open={copyDialogOpen}
          targetLabel={label}
          sources={copySources}
          sourceMonth={effectiveCopySourceMonth}
          sourceYear={effectiveCopySourceYear}
          onSourceChange={(m, y) => {
            setCopySourceMonth(m);
            setCopySourceYear(y);
          }}
          copying={copyMutation?.isPending ?? false}
          creatingEmpty={mutations.createList?.isPending ?? false}
          onCopy={handleCopyFromSelected}
          onCreateEmpty={handleCreateEmptyFromPrompt}
        />
      )}

      {!readOnly && (
        <MonthlyPurchaseFormDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          mode={editingItem ? "edit" : "create"}
          item={editingItem}
          quickPreset={quickPreset}
          saving={mutations.addItem.isPending}
          onCreate={handleCreate}
          onAutoSave={editingItem ? handleAutoSave : undefined}
        />
      )}

      {backHref && (
        <div className="mb-4">
          <Link
            href={backHref}
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "gap-2 -ml-2",
            )}
          >
            <ArrowLeft className="size-4" />
            {backLabel}
          </Link>
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader
          title={readOnly ? `Consulta — ${label}` : "Compras do Mês"}
          description={
            readOnly
              ? "Esta lista é somente para consulta. Para editar, use o mês atual em Compras do Mês."
              : "Monte a lista do mês, marque o que já comprou e veja quanto gastou. Simples como anotar no caderno."
          }
        />
        {!readOnly && (
          <div className="flex shrink-0 flex-wrap gap-2">
            {canCopyFromOtherMonth && (
              <Button
                variant="outline"
                className="gap-2"
                onClick={openCopyDialog}
              >
                <Copy className="size-4" />
                Copiar de outro mês
              </Button>
            )}
            <Link
              href="/compras-do-mes/historico"
              className={cn(buttonVariants({ variant: "outline" }), "gap-2")}
            >
              <History className="size-4" />
              Histórico
            </Link>
            <Button
              variant="outline"
              className="gap-2"
              disabled={mutations.createList.isPending}
              onClick={handleCreateList}
            >
              <ListPlus className="size-4" />
              {listExists ? "Atualizar lista" : "Criar lista do mês"}
            </Button>
            <Button
              className="hidden gap-2 sm:inline-flex"
              onClick={() => openCreate()}
            >
              <Plus className="size-4" />
              Novo item
            </Button>
          </div>
        )}
      </div>

      {isFetching && !isLoading && (
        <p className="text-xs text-muted-foreground" aria-live="polite">
          Atualizando lista…
        </p>
      )}

      {!readOnly && (
        <FadeIn className="mt-2">
          <MonthPeriodPicker
            month={month}
            year={year}
            onChange={(m, y) => {
              setMonth(m);
              setYear(y);
              resetCopyUiForNewPeriod();
            }}
          />
        </FadeIn>
      )}

      {readOnly && (
        <p className="mt-2 text-sm text-muted-foreground capitalize">{label}</p>
      )}

      {showDashboard && (
        <>
          {(dashboardLoading || (dashboardFetching && !dashboard)) && (
            <MonthlyPurchaseDashboardSkeleton />
          )}
          {dashboard && !dashboardLoading && (
            <MonthlyPurchaseDashboardPanel
              dashboard={dashboard}
              periodLabel={label}
            />
          )}
        </>
      )}

      {!readOnly && (
        <FadeIn className="mt-6 surface-card p-4 sm:p-5">
          <p className="mb-3 text-sm font-medium">Adicionar rápido</p>
          <div className="flex flex-wrap gap-2">
            {MONTHLY_QUICK_ITEMS.map((preset) => (
              <Button
                key={preset.name}
                type="button"
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={() => openCreate(preset)}
              >
                {preset.name}
              </Button>
            ))}
          </div>
        </FadeIn>
      )}

      {insights.itemCount > 0 && (
        <div className="mt-6 space-y-3">
          <MonthlyPurchaseFilterTabs
            value={listFilter}
            counts={{
              all: insights.itemCount,
              pending: insights.pendingCount,
              purchased: insights.purchasedCount,
            }}
            onChange={setListFilter}
          />
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Buscar na lista…"
              aria-label="Buscar itens na lista de compras do mês"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      )}

      <div className="mt-6 space-y-6 pb-20 sm:pb-6">
        {showEmptyMonth ? (
          <EmptyState
            icon={ShoppingBag}
            title={`Lista de ${label} criada`}
            description={
              readOnly
                ? hasCopySources
                  ? `Esta lista está vazia. Há ${copySources.length} ${copySources.length === 1 ? "mês" : "meses"} no ano com itens — abra em Compras do Mês para copiar.`
                  : "Esta lista não tinha itens registrados."
                : hasCopySources
                  ? `Sua lista está vazia. Copie itens de qualquer outro mês de ${year} ou comece do zero.`
                  : "Sua lista está vazia. Toque em um item rápido ou em Novo item para começar a anotar."
            }
            action={
              readOnly ? (
                hasCopySources ? (
                  <Link
                    href={`/compras-do-mes?month=${month}&year=${year}`}
                    className={cn(buttonVariants(), "gap-2")}
                  >
                    <Copy className="size-4" />
                    Copiar de outro mês
                  </Link>
                ) : undefined
              ) : (
                <div className="flex flex-col items-center gap-2 sm:flex-row">
                  {hasCopySources && (
                    <Button className="gap-2" onClick={openCopyDialog}>
                      <Copy className="size-4" />
                      Copiar de outro mês
                    </Button>
                  )}
                  <Button
                    variant={hasCopySources ? "outline" : "default"}
                    onClick={() => openCreate()}
                    className="gap-2"
                  >
                    <Plus className="size-4" />
                    Primeiro item
                  </Button>
                </div>
              )
            }
          />
        ) : insights.itemCount === 0 ? (
          <EmptyState
            icon={ShoppingBag}
            title={
              readOnly ? "Lista não encontrada" : "Comece sua lista do mês"
            }
            description={
              readOnly
                ? hasCopySources
                  ? `Não há lista salva para ${label}, mas outros meses de ${year} têm itens. Abra em Compras do Mês para copiar.`
                  : `Não há lista salva para ${label}.`
                : hasCopySources
                  ? `Outros meses de ${year} já têm itens. Copie para ${label} ou crie uma lista vazia.`
                  : "Crie a lista deste mês e anote o que costuma comprar no mercado, na feira ou na farmácia."
            }
            action={
              readOnly ? (
                hasCopySources ? (
                  <Link
                    href={`/compras-do-mes?month=${month}&year=${year}`}
                    className={cn(buttonVariants(), "gap-2")}
                  >
                    <Copy className="size-4" />
                    Copiar de outro mês
                  </Link>
                ) : (
                  <Link
                    href={backHref ?? "/compras-do-mes/historico"}
                    className={buttonVariants({ variant: "outline" })}
                  >
                    Voltar ao histórico
                  </Link>
                )
              ) : (
                <div className="flex flex-col items-center gap-2 sm:flex-row">
                  {hasCopySources && (
                    <>
                      <Button className="gap-2" onClick={openCopyDialog}>
                        <Copy className="size-4" />
                        Copiar de outro mês
                      </Button>
                      <Button
                        variant="outline"
                        className="gap-2"
                        disabled={mutations.createList.isPending}
                        onClick={handleCreateEmptyFromPrompt}
                      >
                        <ListPlus className="size-4" />
                        Lista vazia
                      </Button>
                    </>
                  )}
                  {!hasCopySources && (
                    <Button onClick={handleCreateList} className="gap-2">
                      <ListPlus className="size-4" />
                      Criar lista de {label}
                    </Button>
                  )}
                </div>
              )
            }
          />
        ) : filteredItems.length === 0 ? (
          <div className="surface-card p-8 text-center text-sm text-muted-foreground">
            Nenhum item neste filtro.
          </div>
        ) : (
          displayGroups.map((group) => (
            <section key={group.category}>
              {!search.trim() && listFilter === "all" && (
                <div className="mb-3 flex items-center justify-between gap-2">
                  <h2 className="font-heading text-lg font-semibold">
                    {MONTH_PURCHASE_CATEGORY_LABELS[group.category]}
                  </h2>
                  <span className="text-xs text-muted-foreground">
                    {group.purchasedCount}/{group.items.length} comprados
                    {group.subtotal > 0 &&
                      ` · ${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(group.subtotal)}`}
                  </span>
                </div>
              )}
              <div className="space-y-2">
                {group.items.map((item) => (
                  <MonthlyPurchaseItemRow
                    key={item.id}
                    item={item}
                    readOnly={readOnly}
                    onTogglePurchased={(purchased) =>
                      handleToggle(item, purchased)
                    }
                    onEdit={() => openEdit(item)}
                    onDelete={() => handleDelete(item)}
                    toggling={mutations.togglePurchased.isPending}
                    deleting={mutations.deleteItem.isPending}
                  />
                ))}
              </div>
            </section>
          ))
        )}
      </div>

      {!readOnly && (
        <div className="fixed bottom-20 right-4 z-40 sm:hidden">
          <Button
            size="lg"
            className="size-14 rounded-full shadow-lg"
            aria-label="Novo item"
            onClick={() => openCreate()}
          >
            <Plus className="size-6" />
          </Button>
        </div>
      )}
    </AnimatedPage>
  );
}
