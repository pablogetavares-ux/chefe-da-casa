import { handleApiRouteError } from "@/lib/api/route-error";
import { requireAuthUser } from "@/lib/api/auth";
import { assertSensitiveActionRateLimit } from "@/lib/api/sensitive-rate-limit";
import { exportUserData } from "@/lib/privacy/export-user-data";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  try {
    const user = await requireAuthUser(request);
    await assertSensitiveActionRateLimit(user.id);
    const supabase = await createClient(request);
    const payload = await exportUserData(supabase, user.id);

    const filename = `chefe-da-casa-dados-${user.id.slice(0, 8)}.json`;

    return new Response(JSON.stringify(payload, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return handleApiRouteError(error, "GET /api/v1/profile/export");
  }
}
