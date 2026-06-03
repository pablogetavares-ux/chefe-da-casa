import type { SupabaseClient } from "@supabase/supabase-js";

import { mapListRow } from "@/modules/monthly-purchases/repositories/mappers";
import type { MonthShoppingList } from "@/modules/monthly-purchases/types";
import type { Database } from "@/types/database";

type Client = SupabaseClient<Database>;

export class MonthlyPurchaseListsRepository {
  constructor(private readonly client: Client) {}

  async findById(
    listId: string,
    userId: string,
  ): Promise<MonthShoppingList | null> {
    const { data, error } = await this.client
      .from("monthly_purchase_lists")
      .select("*")
      .eq("id", listId)
      .eq("user_id", userId)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data ? mapListRow(data) : null;
  }

  async findByPeriod(
    userId: string,
    month: number,
    year: number,
  ): Promise<MonthShoppingList | null> {
    const { data, error } = await this.client
      .from("monthly_purchase_lists")
      .select("*")
      .eq("user_id", userId)
      .eq("month", month)
      .eq("year", year)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data ? mapListRow(data) : null;
  }

  async create(
    userId: string,
    month: number,
    year: number,
  ): Promise<MonthShoppingList> {
    const { data, error } = await this.client
      .from("monthly_purchase_lists")
      .insert({
        user_id: userId,
        month,
        year,
      })
      .select("*")
      .single();

    if (error) throw new Error(error.message);
    return mapListRow(data);
  }

  async listByYear(userId: string, year: number): Promise<MonthShoppingList[]> {
    const { data, error } = await this.client
      .from("monthly_purchase_lists")
      .select("*")
      .eq("user_id", userId)
      .eq("year", year)
      .order("month", { ascending: true });

    if (error) throw new Error(error.message);
    return (data ?? []).map(mapListRow);
  }

  async listAllForUser(userId: string): Promise<MonthShoppingList[]> {
    const { data, error } = await this.client
      .from("monthly_purchase_lists")
      .select("*")
      .eq("user_id", userId)
      .order("year", { ascending: false })
      .order("month", { ascending: false });

    if (error) throw new Error(error.message);
    return (data ?? []).map(mapListRow);
  }

  async touchUpdatedAt(listId: string): Promise<void> {
    const { error } = await this.client
      .from("monthly_purchase_lists")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", listId);

    if (error) throw new Error(error.message);
  }
}
