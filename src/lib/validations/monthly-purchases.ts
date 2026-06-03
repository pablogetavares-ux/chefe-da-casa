import { z } from "zod";

import { MONTH_PURCHASE_CATEGORIES } from "@/modules/monthly-purchases/constants/categories";

const monthSchema = z.coerce.number().int().min(1).max(12);
const yearSchema = z.coerce.number().int().min(2020).max(2100);

const categorySchema = z.enum(MONTH_PURCHASE_CATEGORIES, {
  message: "Escolha uma categoria",
});

const nameSchema = z
  .string()
  .trim()
  .min(1, "Informe o nome do produto")
  .max(120, "Nome muito longo");

const quantitySchema = z
  .union([
    z.coerce.number().positive("Quantidade deve ser maior que zero"),
    z.null(),
  ])
  .optional();

const priceSchema = z
  .union([z.coerce.number().min(0, "Valor não pode ser negativo"), z.null()])
  .optional();

export const monthPeriodQuerySchema = z.object({
  month: monthSchema,
  year: yearSchema,
});

export const monthPeriodQueryWithEnsureSchema = monthPeriodQuerySchema.extend({
  ensure: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => v === "true"),
});

const itemFieldsSchema = z.object({
  name: nameSchema,
  category: categorySchema,
  quantity: quantitySchema,
  unit: z.string().trim().max(24).optional().nullable(),
  price_paid: priceSchema,
  notes: z.string().trim().max(500).optional().nullable(),
  is_purchased: z.boolean().optional(),
});

export const monthPurchaseItemCreateSchema = z
  .object({
    month: monthSchema,
    year: yearSchema,
  })
  .merge(itemFieldsSchema);

export const monthPurchaseItemUpdateSchema = itemFieldsSchema.partial();

export const monthPurchaseListCreateSchema = monthPeriodQuerySchema;

export const monthCopyFromSchema = z
  .object({
    month: monthSchema,
    year: yearSchema,
    sourceMonth: monthSchema,
    sourceYear: yearSchema,
  })
  .refine(
    (data) => data.month !== data.sourceMonth || data.year !== data.sourceYear,
    { message: "O mês de origem deve ser diferente do destino" },
  )
  .refine((data) => data.year === data.sourceYear, {
    message: "Origem e destino devem ser do mesmo ano",
  });

export type MonthCopyFromInput = z.infer<typeof monthCopyFromSchema>;

export type MonthPurchaseItemCreateInput = z.infer<
  typeof monthPurchaseItemCreateSchema
>;
export type MonthPurchaseItemUpdateInput = z.infer<
  typeof monthPurchaseItemUpdateSchema
>;

/** Validação client-side do formulário (sem month/year). */
export const monthPurchaseFormSchema = itemFieldsSchema;

export type MonthPurchaseFormInput = z.infer<typeof monthPurchaseFormSchema>;

export function validateMonthPurchaseForm(
  values: MonthPurchaseFormInput,
): { success: true } | { success: false; errors: Record<string, string> } {
  const parsed = monthPurchaseFormSchema.safeParse(values);
  if (parsed.success) return { success: true };

  const errors: Record<string, string> = {};
  for (const issue of parsed.error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !errors[key]) {
      errors[key] = issue.message;
    }
  }
  return { success: false, errors };
}
