import { apiSuccess } from "@/lib/api/response";
import { handleApiRouteError } from "@/lib/api/route-error";
import {
  adminUnauthorizedResponse,
  assertAdminApiAccess,
} from "@/modules/admin/api/handle-admin-route";
import { fetchAdminStatsForUser } from "@/modules/admin/services/queries";

export async function GET() {
  try {
    const gate = await assertAdminApiAccess();
    if (!gate.ok) return gate.response;

    const stats = await fetchAdminStatsForUser(gate.user.id);
    return apiSuccess(stats);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return adminUnauthorizedResponse();
    }
    return handleApiRouteError(
      error,
      "GET /api/v1/admin/stats",
      "Falha ao carregar estatísticas",
    );
  }
}
