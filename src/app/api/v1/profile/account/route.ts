import { apiError, apiSuccess } from "@/lib/api/response";
import { requireAuthUser } from "@/lib/api/auth";
import { assertSensitiveActionRateLimit } from "@/lib/api/sensitive-rate-limit";
import { deleteUserAccount } from "@/lib/privacy/delete-user-account";
import { deleteAccountSchema } from "@/lib/validations";

export async function DELETE(request: Request) {
  try {
    const user = await requireAuthUser();
    await assertSensitiveActionRateLimit(user.id);
    const body = await request.json().catch(() => ({}));
    const parsed = deleteAccountSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(
        parsed.error.issues[0]?.message ?? "Confirmação inválida",
        400,
      );
    }

    if (parsed.data.confirmEmail.toLowerCase() !== user.email?.toLowerCase()) {
      return apiError(
        "O e-mail de confirmação não confere com sua conta.",
        400,
        "EMAIL_MISMATCH",
      );
    }

    await deleteUserAccount(user.id, user.email!);

    return apiSuccess({ deleted: true });
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
      error instanceof Error ? error.message : "Erro ao excluir conta";
    if (message.includes("SERVICE_ROLE")) {
      return apiError(message, 503, "SERVICE_UNAVAILABLE");
    }
    if (message.includes("Não autenticado")) {
      return apiError("Não autenticado", 401, "UNAUTHORIZED");
    }
    return apiError(message, 500);
  }
}
