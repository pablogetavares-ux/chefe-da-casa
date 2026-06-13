import { apiSuccess } from "@/lib/api/response";
import { handleApiRouteError } from "@/lib/api/route-error";
import { requireAuthUser } from "@/lib/api/auth";
import { createClient } from "@/lib/supabase/server";
import { fetchOffersIntegrationBundle } from "@/modules/offers/services/integrations";
import type { OffersIntegrationContextResponse } from "@/modules/offers/types";

export async function GET(request: Request) {
  try {
    const user = await requireAuthUser(request);
    const supabase = await createClient(request);
    const bundle = await fetchOffersIntegrationBundle(supabase, user.id);

    const response: OffersIntegrationContextResponse = {
      userContext: {
        plan: bundle.userContext.plan,
        fitnessGoal: bundle.userContext.fitnessGoal,
        seniorMode: bundle.userContext.seniorMode,
        offerPreferences: bundle.userContext.offerPreferences,
        priorityCategories: bundle.userContext.priorityCategories,
        priorityLabels: bundle.userContext.priorityLabels,
        personalizationReason: bundle.userContext.personalizationReason,
      },
      region: bundle.region,
      extensions: bundle.extensions,
    };

    return apiSuccess(response);
  } catch (error) {
    return handleApiRouteError(
      error,
      "GET /api/v1/offers/context",
      "Erro ao carregar contexto de ofertas",
    );
  }
}
