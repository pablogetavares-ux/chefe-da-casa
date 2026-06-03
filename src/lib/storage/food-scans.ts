import type { SupabaseClient } from "@supabase/supabase-js";

import { assertImageMagicBytes } from "@/lib/security/image-bytes";
import type { Database } from "@/types/database";

const BUCKET = "food-scans";
const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

export function validateScanFile(file: File) {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error("INVALID_IMAGE_TYPE");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("IMAGE_TOO_LARGE");
  }
}

export function buildScanStoragePath(userId: string, fileName: string) {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "jpg";
  const safeExt = ["jpg", "jpeg", "png", "webp", "heic", "heif"].includes(ext)
    ? ext
    : "jpg";
  return `${userId}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${safeExt}`;
}

export async function uploadFoodScan(
  supabase: SupabaseClient<Database>,
  userId: string,
  file: File,
) {
  validateScanFile(file);

  const path = buildScanStoragePath(userId, file.name);
  const arrayBuffer = await file.arrayBuffer();
  assertImageMagicBytes(arrayBuffer, file.type);
  const buffer = Buffer.from(arrayBuffer);

  const { error } = await supabase.storage.from(BUCKET).upload(path, buffer, {
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    throw new Error(error.message);
  }

  return { bucket: BUCKET, path };
}

export async function getFoodScanSignedUrl(
  supabase: SupabaseClient<Database>,
  path: string,
  expiresInSeconds = 3600,
) {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, expiresInSeconds);

  if (error || !data?.signedUrl) {
    throw new Error(error?.message ?? "Erro ao obter URL da imagem");
  }

  return data.signedUrl;
}

export function toDataUrl(base64: string, mimeType: string) {
  return `data:${mimeType};base64,${base64}`;
}
