import { z } from "zod";

/** Path seguro no bucket food-scans (uuid/timestamp.ext). */
export const storagePathSchema = z
  .string()
  .min(3)
  .max(256)
  .regex(
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/[a-zA-Z0-9._-]+$/,
    "storagePath inválido",
  );
