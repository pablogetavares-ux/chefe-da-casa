import { apiError, apiSuccess } from "@/lib/api/response";
import { requireAuthUser } from "@/lib/api/auth";
import { fetchAntiWasteSummary } from "@/lib/ai/services/anti-waste";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const user = await requireAuthUser();
    const supabase = await createClient();
    const summary = await fetchAntiWasteSummary(supabase, user.id);
    return apiSuccess(summary);
  } catch (error) {
    if (error instanceof Error && error.message.includes("autenticado")) {
      return apiError("Não autenticado", 401, "UNAUTHORIZED");
    }
    return apiError(
      error instanceof Error ? error.message : "Erro ao carregar resumo",
      500,
    );
  }
}
