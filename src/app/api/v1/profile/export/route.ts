import { apiError } from "@/lib/api/response";
import { requireAuthUser } from "@/lib/api/auth";
import { assertSensitiveActionRateLimit } from "@/lib/api/sensitive-rate-limit";
import { exportUserData } from "@/lib/privacy/export-user-data";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const user = await requireAuthUser();
    await assertSensitiveActionRateLimit(user.id);
    const supabase = await createClient();
    const payload = await exportUserData(supabase, user.id);

    const filename = `chef-da-casa-dados-${user.id.slice(0, 8)}.json`;

    return new Response(JSON.stringify(payload, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return apiError("Não autenticado", 401, "UNAUTHORIZED");
    }
    if (error instanceof Error && error.message === "RATE_LIMIT_EXCEEDED") {
      return apiError(
        "Muitas solicitações. Aguarde um minuto e tente novamente.",
        429,
        "RATE_LIMIT_EXCEEDED",
      );
    }
    const message =
      error instanceof Error ? error.message : "Erro ao exportar dados";
    if (message.includes("SERVICE_ROLE")) {
      return apiError(message, 503, "SERVICE_UNAVAILABLE");
    }
    return apiError("Não autenticado", 401, "UNAUTHORIZED");
  }
}
