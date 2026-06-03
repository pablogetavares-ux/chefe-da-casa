import { apiError, apiSuccess } from "@/lib/api/response";
import { requireAuthUser } from "@/lib/api/auth";
import { assertAiRateLimit, mapAiRouteError } from "@/lib/ai/route-utils";
import { uploadFoodScan, validateScanFile } from "@/lib/storage/food-scans";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const user = await requireAuthUser();
    await assertAiRateLimit(user.id);

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return apiError("Arquivo de imagem é obrigatório", 400);
    }

    try {
      validateScanFile(file);
    } catch (error) {
      if (error instanceof Error) {
        return mapAiRouteError(error);
      }
      throw error;
    }

    const supabase = await createClient();
    const uploaded = await uploadFoodScan(supabase, user.id, file);

    return apiSuccess({
      storagePath: uploaded.path,
      bucket: uploaded.bucket,
    });
  } catch (error) {
    return mapAiRouteError(error);
  }
}
