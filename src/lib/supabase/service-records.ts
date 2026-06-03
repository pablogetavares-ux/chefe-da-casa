import {
  createAdminClient,
  isAdminClientConfigured,
} from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/observability/logger";
import type { Database, Json } from "@/types/database";

type RecordsClient = ReturnType<typeof createAdminClient>;

async function getRecordsClient(): Promise<RecordsClient> {
  if (isAdminClientConfigured()) return createAdminClient();
  if (process.env.NODE_ENV === "production") {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY não configurada");
  }
  return createClient() as unknown as RecordsClient;
}

export async function insertUsageLog(
  userId: string,
  action: string,
  metadata?: Record<string, unknown>,
) {
  try {
    const supabase = await getRecordsClient();
    const { error } = await supabase.from("usage_logs").insert({
      user_id: userId,
      action,
      metadata: (metadata ?? null) as Json | null,
    });
    if (error) {
      logger.warn("usage.record_failed", {
        userId,
        action,
        error: error.message,
      });
    }
  } catch (error) {
    logger.warn("usage.record_exception", {
      userId,
      action,
      message: error instanceof Error ? error.message : String(error),
    });
  }
}

type AiGenerationInsert =
  Database["public"]["Tables"]["ai_generations"]["Insert"];
type AiGenerationUpdate =
  Database["public"]["Tables"]["ai_generations"]["Update"];

export async function insertAiGeneration(row: AiGenerationInsert) {
  const supabase = await getRecordsClient();
  const { data, error } = await supabase
    .from("ai_generations")
    .insert(row)
    .select("id")
    .single();
  if (error || !data)
    throw new Error(error?.message ?? "Erro ao registrar geração");
  return data.id;
}

export async function updateAiGeneration(
  id: string,
  patch: AiGenerationUpdate,
) {
  const supabase = await getRecordsClient();
  const { error } = await supabase
    .from("ai_generations")
    .update(patch)
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function insertIngredientScan(
  row: Database["public"]["Tables"]["ingredient_scans"]["Insert"],
) {
  const supabase = await getRecordsClient();
  const { data, error } = await supabase
    .from("ingredient_scans")
    .insert(row)
    .select("id")
    .single();
  if (error || !data) throw new Error(error?.message ?? "Erro ao salvar scan");
  return data.id;
}
