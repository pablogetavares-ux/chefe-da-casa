import { z } from "zod";

export const uuidParamSchema = z.string().uuid("ID inválido");

export function parseUuidParam(
  value: string,
  label = "ID",
): { ok: true; id: string } | { ok: false; message: string } {
  const parsed = uuidParamSchema.safeParse(value);
  if (!parsed.success) {
    return { ok: false, message: `${label} inválido` };
  }
  return { ok: true, id: parsed.data };
}
