import { apiError, apiSuccess } from "@/lib/api/response";
import { adminListQuerySchema } from "@/lib/validations";
import {
  adminUnauthorizedResponse,
  assertAdminApiAccess,
} from "@/modules/admin/api/handle-admin-route";
import { fetchAdminUsers } from "@/modules/admin/services/queries";

export async function GET(request: Request) {
  try {
    const gate = await assertAdminApiAccess();
    if (!gate.ok) return gate.response;

    const params = Object.fromEntries(new URL(request.url).searchParams);
    const parsed = adminListQuerySchema.safeParse(params);

    if (!parsed.success) {
      return apiError(
        parsed.error.issues[0]?.message ?? "Parâmetros inválidos",
        400,
      );
    }

    const result = await fetchAdminUsers(parsed.data);
    return apiSuccess(result);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return adminUnauthorizedResponse();
    }
    return apiError("Falha ao listar usuários", 500);
  }
}
