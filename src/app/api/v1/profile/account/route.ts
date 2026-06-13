import { apiError, apiSuccess } from "@/lib/api/response";
import { handleApiRouteError } from "@/lib/api/route-error";
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
    return handleApiRouteError(error, "DELETE /api/v1/profile/account");
  }
}
