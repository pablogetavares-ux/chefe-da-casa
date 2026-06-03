import type { SupabaseClient } from "@supabase/supabase-js";

import { mapItemRow } from "@/modules/monthly-purchases/repositories/mappers";
import type {
  MonthPurchaseCategory,
  MonthShoppingItem,
} from "@/modules/monthly-purchases/types";
import type { Database } from "@/types/database";

type Client = SupabaseClient<Database>;

export type CreateItemInput = {
  listId: string;
  name: string;
  category: MonthPurchaseCategory;
  quantity?: number | null;
  unit?: string | null;
  price_paid?: number | null;
  notes?: string | null;
  is_purchased?: boolean;
};

export type UpdateItemInput = Partial<Omit<CreateItemInput, "listId">>;

export class MonthlyPurchaseItemsRepository {
  constructor(private readonly client: Client) {}

  async listByListId(listId: string): Promise<MonthShoppingItem[]> {
    const { data, error } = await this.client
      .from("monthly_purchase_items")
      .select("*")
      .eq("monthly_purchase_list_id", listId)
      .order("is_purchased", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) throw new Error(error.message);
    return (data ?? []).map(mapItemRow);
  }

  async bulkCreate(
    listId: string,
    inputs: Omit<CreateItemInput, "listId">[],
  ): Promise<MonthShoppingItem[]> {
    if (inputs.length === 0) return [];

    const rows = inputs.map((input) => ({
      monthly_purchase_list_id: listId,
      name: input.name.trim(),
      category: input.category,
      quantity: input.quantity ?? null,
      unit: input.unit?.trim() || null,
      price_paid: input.price_paid ?? null,
      notes: input.notes?.trim() || null,
      is_purchased: input.is_purchased ?? false,
    }));

    const { data, error } = await this.client
      .from("monthly_purchase_items")
      .insert(rows)
      .select("*");

    if (error) throw new Error(error.message);
    return (data ?? []).map(mapItemRow);
  }

  async create(input: CreateItemInput): Promise<MonthShoppingItem> {
    const { data, error } = await this.client
      .from("monthly_purchase_items")
      .insert({
        monthly_purchase_list_id: input.listId,
        name: input.name.trim(),
        category: input.category,
        quantity: input.quantity ?? null,
        unit: input.unit?.trim() || null,
        price_paid: input.price_paid ?? null,
        notes: input.notes?.trim() || null,
        is_purchased: input.is_purchased ?? false,
      })
      .select("*")
      .single();

    if (error) throw new Error(error.message);
    return mapItemRow(data);
  }

  async update(
    itemId: string,
    patch: UpdateItemInput,
  ): Promise<MonthShoppingItem> {
    const row: Database["public"]["Tables"]["monthly_purchase_items"]["Update"] =
      {
        updated_at: new Date().toISOString(),
      };

    if (patch.name !== undefined) row.name = patch.name.trim();
    if (patch.category !== undefined) row.category = patch.category;
    if (patch.quantity !== undefined) row.quantity = patch.quantity;
    if (patch.unit !== undefined) row.unit = patch.unit?.trim() || null;
    if (patch.price_paid !== undefined) row.price_paid = patch.price_paid;
    if (patch.notes !== undefined) row.notes = patch.notes?.trim() || null;
    if (patch.is_purchased !== undefined) row.is_purchased = patch.is_purchased;

    const { data, error } = await this.client
      .from("monthly_purchase_items")
      .update(row)
      .eq("id", itemId)
      .select("*")
      .single();

    if (error) throw new Error(error.message);
    return mapItemRow(data);
  }

  async delete(itemId: string): Promise<void> {
    const { error } = await this.client
      .from("monthly_purchase_items")
      .delete()
      .eq("id", itemId);

    if (error) throw new Error(error.message);
  }

  async findById(itemId: string): Promise<MonthShoppingItem | null> {
    const { data, error } = await this.client
      .from("monthly_purchase_items")
      .select("*")
      .eq("id", itemId)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data ? mapItemRow(data) : null;
  }
}
