import { z } from "zod";

export const marketsCompareItemSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1).max(120),
  quantity: z.coerce.number().positive().max(999).default(1),
  unit: z.string().trim().max(30).default("un"),
});

export const marketsCompareBodySchema = z
  .object({
    listId: z.string().uuid().optional(),
    items: z.array(marketsCompareItemSchema).max(100).optional(),
  })
  .refine((data) => data.listId || (data.items && data.items.length > 0), {
    message: "Informe listId ou items",
  });

export const marketsCompareQuerySchema = z.object({
  listId: z.string().uuid("ID da lista inválido"),
});

export type MarketsCompareItemInput = z.infer<typeof marketsCompareItemSchema>;
export type MarketsCompareBodyInput = z.infer<typeof marketsCompareBodySchema>;
