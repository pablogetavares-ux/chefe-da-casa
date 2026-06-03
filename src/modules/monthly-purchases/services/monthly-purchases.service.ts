import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  MonthPurchaseItemCreateInput,
  MonthPurchaseItemUpdateInput,
} from "@/lib/validations/monthly-purchases";
import {
  shiftPeriod,
  periodLabel,
} from "@/modules/monthly-purchases/constants/period";
import { MonthlyPurchaseItemsRepository } from "@/modules/monthly-purchases/repositories/items.repository";
import { MonthlyPurchaseListsRepository } from "@/modules/monthly-purchases/repositories/lists.repository";
import { roundMoney } from "@/modules/shopping/services/savings";
import type {
  MonthCopySource,
  MonthCopySuggestion,
  MonthPeriod,
  MonthPurchaseDashboard,
  MonthPurchaseHistoryEntry,
  MonthPurchaseHistoryResponse,
  MonthShoppingListSummary,
  MonthShoppingListWithItems,
  MonthShoppingItem,
} from "@/modules/monthly-purchases/types";
import { buildMonthPurchaseDashboard } from "@/modules/monthly-purchases/utils/dashboard";
import type { Database } from "@/types/database";

type Client = SupabaseClient<Database>;

function summarizeItems(items: MonthShoppingItem[]): MonthShoppingListSummary {
  const purchased = items.filter((item) => item.is_purchased);
  const pending = items.filter((item) => !item.is_purchased);

  const totalSpent = roundMoney(
    items.reduce((sum, item) => sum + (item.price_paid ?? 0), 0),
  );

  const spentOnPurchased = roundMoney(
    purchased.reduce((sum, item) => sum + (item.price_paid ?? 0), 0),
  );

  return {
    itemCount: items.length,
    purchasedCount: purchased.length,
    pendingCount: pending.length,
    totalSpent,
    spentOnPurchased,
  };
}

function toPayload(
  list: MonthShoppingListWithItems["list"],
  items: MonthShoppingItem[],
  period: MonthPeriod,
): MonthShoppingListWithItems {
  return {
    list,
    items,
    summary: summarizeItems(items),
    period,
  };
}

export class MonthlyPurchasesService {
  private readonly lists: MonthlyPurchaseListsRepository;
  private readonly items: MonthlyPurchaseItemsRepository;

  constructor(client: Client) {
    this.lists = new MonthlyPurchaseListsRepository(client);
    this.items = new MonthlyPurchaseItemsRepository(client);
  }

  async fetchMonthList(
    userId: string,
    period: MonthPeriod,
    options?: { ensure?: boolean },
  ): Promise<MonthShoppingListWithItems> {
    if (options?.ensure) {
      return this.getOrCreateMonthList(userId, period);
    }

    const list = await this.lists.findByPeriod(
      userId,
      period.month,
      period.year,
    );

    if (!list) {
      return toPayload(null, [], period);
    }

    const items = await this.items.listByListId(list.id);
    return toPayload(list, items, period);
  }

  async getMonthList(
    userId: string,
    period: MonthPeriod,
  ): Promise<MonthShoppingListWithItems | null> {
    const list = await this.lists.findByPeriod(
      userId,
      period.month,
      period.year,
    );

    if (!list) return null;

    const items = await this.items.listByListId(list.id);

    return toPayload(list, items, period);
  }

  async getOrCreateMonthList(
    userId: string,
    period: MonthPeriod,
  ): Promise<MonthShoppingListWithItems> {
    const existing = await this.getMonthList(userId, period);
    if (existing) return existing;

    const list = await this.lists.create(userId, period.month, period.year);

    return toPayload(list, [], period);
  }

  async createMonthList(
    userId: string,
    period: MonthPeriod,
  ): Promise<MonthShoppingListWithItems> {
    return this.getOrCreateMonthList(userId, period);
  }

  async getCopySuggestion(
    userId: string,
    period: MonthPeriod,
  ): Promise<MonthCopySuggestion> {
    const current = await this.fetchMonthList(userId, period, {
      ensure: false,
    });
    const listsInYear = await this.lists.listByYear(userId, period.year);
    const sources: MonthCopySource[] = [];

    for (const list of listsInYear) {
      if (list.month === period.month) continue;

      const items = await this.items.listByListId(list.id);
      if (items.length === 0) continue;

      sources.push({
        month: list.month,
        year: list.year,
        label: periodLabel(list.month, list.year),
        itemCount: items.length,
      });
    }

    sources.sort((a, b) => b.month - a.month);

    const previous = shiftPeriod(period.month, period.year, -1);
    const defaultEntry =
      sources.find(
        (entry) =>
          entry.month === previous.month && entry.year === previous.year,
      ) ??
      sources[0] ??
      null;

    const defaultSource = defaultEntry
      ? { month: defaultEntry.month, year: defaultEntry.year }
      : null;

    const currentItemCount = current.items.length;
    const currentHasList = Boolean(current.list);

    return {
      shouldPrompt: currentItemCount === 0 && sources.length > 0,
      current: period,
      sources,
      defaultSource,
      defaultSourceLabel: defaultEntry?.label ?? "",
      defaultSourceItemCount: defaultEntry?.itemCount ?? 0,
      currentHasList,
      currentItemCount,
    };
  }

  async copyFromMonth(
    userId: string,
    target: MonthPeriod,
    source: MonthPeriod,
  ): Promise<MonthShoppingListWithItems> {
    if (target.month === source.month && target.year === source.year) {
      throw new Error("Escolha um mês de origem diferente do destino");
    }

    if (target.year !== source.year) {
      throw new Error("Só é possível copiar entre meses do mesmo ano");
    }

    const sourceList = await this.getMonthList(userId, source);

    if (!sourceList?.list || sourceList.items.length === 0) {
      throw new Error("Lista do mês de origem não encontrada ou vazia");
    }

    let targetList = await this.lists.findByPeriod(
      userId,
      target.month,
      target.year,
    );

    if (!targetList) {
      targetList = await this.lists.create(userId, target.month, target.year);
    } else {
      const existingItems = await this.items.listByListId(targetList.id);
      if (existingItems.length > 0) {
        throw new Error("A lista deste mês já possui itens");
      }
    }

    await this.items.bulkCreate(
      targetList.id,
      sourceList.items.map((item) => ({
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        unit: item.unit,
        price_paid: null,
        notes: item.notes,
        is_purchased: false,
      })),
    );

    await this.lists.touchUpdatedAt(targetList.id);

    const refreshed = await this.getMonthList(userId, target);
    if (!refreshed) throw new Error("Falha ao recarregar lista após cópia");

    return refreshed;
  }

  async copyFromPreviousMonth(
    userId: string,
    period: MonthPeriod,
  ): Promise<MonthShoppingListWithItems> {
    const previous = shiftPeriod(period.month, period.year, -1);
    return this.copyFromMonth(userId, period, previous);
  }

  async getMonthDashboard(
    userId: string,
    period: MonthPeriod,
  ): Promise<MonthPurchaseDashboard> {
    const previousPeriod = shiftPeriod(period.month, period.year, -1);

    const [currentPayload, previousPayload] = await Promise.all([
      this.fetchMonthList(userId, period),
      this.fetchMonthList(userId, previousPeriod),
    ]);

    const previousItems =
      previousPayload.items.length > 0 ? previousPayload.items : null;

    return buildMonthPurchaseDashboard(
      currentPayload.items,
      period,
      previousItems,
    );
  }

  async listHistory(userId: string): Promise<MonthPurchaseHistoryResponse> {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const lists = await this.lists.listAllForUser(userId);
    const entries: MonthPurchaseHistoryEntry[] = [];

    for (const list of lists) {
      const items = await this.items.listByListId(list.id);
      const summary = summarizeItems(items);

      entries.push({
        listId: list.id,
        month: list.month,
        year: list.year,
        label: periodLabel(list.month, list.year),
        itemCount: summary.itemCount,
        totalSpent: summary.totalSpent,
        purchasedCount: summary.purchasedCount,
        updatedAt: list.updated_at,
        isCurrentMonth:
          list.month === currentMonth && list.year === currentYear,
      });
    }

    return { entries };
  }

  async addItem(
    userId: string,
    input: MonthPurchaseItemCreateInput,
  ): Promise<MonthShoppingListWithItems> {
    const { month, year, ...item } = input;
    const period = { month, year };
    const payload = await this.getOrCreateMonthList(userId, period);

    await this.items.create({
      listId: payload.list!.id,
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      price_paid: item.price_paid,
      notes: item.notes,
      is_purchased: item.is_purchased,
    });

    await this.lists.touchUpdatedAt(payload.list!.id);

    const refreshed = await this.getMonthList(userId, period);
    if (!refreshed) throw new Error("Falha ao recarregar lista mensal");

    return refreshed;
  }

  async updateItem(
    userId: string,
    itemId: string,
    input: MonthPurchaseItemUpdateInput,
  ): Promise<MonthShoppingListWithItems> {
    const item = await this.items.findById(itemId);
    if (!item) throw new ItemNotFoundError();

    const list = await this.lists.findById(item.shopping_list_id, userId);
    if (!list) throw new ItemNotFoundError();

    await this.items.update(itemId, input);
    await this.lists.touchUpdatedAt(list.id);

    const refreshed = await this.getMonthList(userId, {
      month: list.month,
      year: list.year,
    });
    if (!refreshed) throw new Error("Falha ao recarregar lista mensal");

    return refreshed;
  }

  async toggleItemPurchased(
    userId: string,
    itemId: string,
    isPurchased: boolean,
  ): Promise<MonthShoppingListWithItems> {
    return this.updateItem(userId, itemId, { is_purchased: isPurchased });
  }

  async deleteItem(
    userId: string,
    itemId: string,
  ): Promise<MonthShoppingListWithItems | null> {
    const item = await this.items.findById(itemId);
    if (!item) throw new ItemNotFoundError();

    const list = await this.lists.findById(item.shopping_list_id, userId);
    if (!list) throw new ItemNotFoundError();

    await this.items.delete(itemId);
    await this.lists.touchUpdatedAt(list.id);

    return this.getMonthList(userId, {
      month: list.month,
      year: list.year,
    });
  }
}

export class ItemNotFoundError extends Error {
  constructor() {
    super("ITEM_NOT_FOUND");
    this.name = "ItemNotFoundError";
  }
}

export function createMonthlyPurchasesService(client: Client) {
  return new MonthlyPurchasesService(client);
}
