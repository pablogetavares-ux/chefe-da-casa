import { apiError, apiSuccess } from "@/lib/api/response";
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
    return apiError("Falha ao carregar estatísticas", 500);
  }
}
