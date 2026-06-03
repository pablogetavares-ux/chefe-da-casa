import { apiError, apiSuccess } from "@/lib/api/response";
import { adminActivityQuerySchema } from "@/lib/validations";
import {
  adminUnauthorizedResponse,
  assertAdminApiAccess,
} from "@/modules/admin/api/handle-admin-route";
import { fetchAdminActivity } from "@/modules/admin/services/queries";

export async function GET(request: Request) {
  try {
    const gate = await assertAdminApiAccess();
    if (!gate.ok) return gate.response;

    const params = Object.fromEntries(new URL(request.url).searchParams);
    const parsed = adminActivityQuerySchema.safeParse(params);

    if (!parsed.success) {
      return apiError(
        parsed.error.issues[0]?.message ?? "Parâmetros inválidos",
        400,
      );
    }

    const items = await fetchAdminActivity(parsed.data.limit);
    return apiSuccess({ items });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return adminUnauthorizedResponse();
    }
    return apiError("Falha ao carregar atividade", 500);
  }
}
