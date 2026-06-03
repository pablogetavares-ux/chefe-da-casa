import { z } from "zod";

export const PRODUCT_CATEGORIES = [
  "MEAT",
  "PRODUCE",
  "DAIRY",
  "BAKERY",
  "BEVERAGES",
  "FROZEN",
  "PANTRY",
  "CLEANING",
  "OTHER",
] as const;

export const PRODUCT_BASE_UNITS = [
  "un",
  "kg",
  "g",
  "L",
  "ml",
  "pct",
  "cx",
  "dz",
] as const;

export const productCreateSchema = z.object({
  name: z.string().trim().min(2).max(120),
  category: z.enum(PRODUCT_CATEGORIES).default("OTHER"),
  baseUnit: z.enum(PRODUCT_BASE_UNITS).default("un"),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug inválido")
    .optional(),
});

export const productUpdateSchema = productCreateSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Informe ao menos um campo",
  });

export const productListQuerySchema = z.object({
  category: z.enum(PRODUCT_CATEGORIES).optional(),
  q: z.string().trim().max(80).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export const marketPriceCreateSchema = z.object({
  marketName: z.string().trim().min(2).max(80),
  price: z.coerce.number().min(0).max(999_999),
});

export const marketPriceUpdateSchema = z.object({
  marketName: z.string().trim().min(2).max(80).optional(),
  price: z.coerce.number().min(0).max(999_999).optional(),
});

export const productsCompareQuerySchema = z.object({
  category: z.enum(PRODUCT_CATEGORIES).optional(),
  q: z.string().trim().max(80).optional(),
});

export type ProductCreateInput = z.infer<typeof productCreateSchema>;
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>;
export type MarketPriceCreateInput = z.infer<typeof marketPriceCreateSchema>;
export type MarketPriceUpdateInput = z.infer<typeof marketPriceUpdateSchema>;
