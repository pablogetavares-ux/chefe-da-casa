import { z } from "zod";

import { RECIPE_GENERATION_MODES } from "@/lib/ai/constants/recipe-modes";
import { FITNESS_GOALS } from "@/lib/fitness/constants";
import { offerPreferencesSchema } from "@/modules/offers/types/offer-preferences";
import { MAX_BASE64_LENGTH } from "@/lib/security/image-bytes";
import { storagePathSchema } from "@/lib/security/schemas";
import {
  coerceOptionalInt,
  coerceServings,
  fitnessGoalsRequestSchema,
} from "@/lib/validations/coerce";

export const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(8, "Senha deve ter no mínimo 8 caracteres"),
});

export const signupSchema = loginSchema.extend({
  fullName: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("E-mail inválido"),
});

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "Senha deve ter no mínimo 8 caracteres"),
    confirmPassword: z.string().min(8, "Confirme a senha"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

export const RECIPE_PREPARATION_STYLES = [
  "bolo",
  "pudim",
  "torta",
  "mingau",
  "mousse",
  "creme",
  "vitamina",
  "refogado",
  "assado",
] as const;

export const generateRecipeSchema = z.object({
  ingredients: z
    .array(z.string().min(1))
    .min(1, "Informe ao menos um ingrediente")
    .max(20, "Máximo de 20 ingredientes"),
  dietaryPreferences: z.array(z.string()).optional(),
  preparationStyle: z.enum(RECIPE_PREPARATION_STYLES).optional(),
  servings: coerceServings(4),
  maxPrepTimeMinutes: coerceOptionalInt(5, 180),
  mode: z.enum(RECIPE_GENERATION_MODES).default("STANDARD"),
  forceRegenerate: z.boolean().default(false),
  fitnessGoals: fitnessGoalsRequestSchema.optional(),
});

export const adaptRecipeSchema = z.object({
  recipeId: z.string().uuid("Receita inválida"),
  targetDiet: z.string().min(2, "Informe a dieta ou objetivo"),
  instruction: z.string().max(500).optional(),
});

export const substitutionsSchema = z.object({
  recipeId: z.string().uuid("Receita inválida"),
  reason: z.string().max(300).optional(),
});

export const macrosSchema = z.object({
  recipeId: z.string().uuid("Receita inválida"),
});

export const refineRecipeSchema = z.object({
  recipeId: z.string().uuid("Receita inválida"),
  instruction: z
    .string()
    .min(3, "Descreva o refinamento")
    .max(500, "Instrução muito longa"),
});

export const pantryItemSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(100),
  quantity: z.number().positive().optional(),
  unit: z.string().max(20).optional(),
  category: z.string().max(50).optional(),
  expiresAt: z.string().optional(),
  itemKind: z.enum(["stock", "leftover"]).default("stock"),
  notes: z.string().max(300).optional(),
});

export const pantryItemUpdateSchema = pantryItemSchema.partial();

export const favoriteSchema = z.object({
  recipeId: z.string().uuid("Receita inválida"),
});

export const offerFavoriteSchema = z.object({
  offerId: z.string().uuid("Oferta inválida"),
});

export const offerRegionScopeSchema = z.enum([
  "same_city",
  "nearby",
  "within_radius",
  "national",
]);

export const offerSearchRadiusSchema = z.coerce
  .number()
  .refine((v) => v === 10 || v === 25 || v === 50 || v === 100 || v === 300, {
    message: "Raio deve ser 10, 25, 50, 100 ou 300 km",
  });

export const offerRegionUpdateSchema = z.object({
  city: z.string().min(2).max(80),
  state: z
    .string()
    .trim()
    .length(2, "Informe a UF com 2 letras")
    .transform((v) => v.toUpperCase()),
  radiusKm: offerSearchRadiusSchema,
});

const offerVerticalSlugSchema = z
  .string()
  .trim()
  .regex(/^[a-z][a-z0-9_]*$/, "Vertical inválida")
  .default("supermarket");

const offerCategorySlugSchema = z
  .string()
  .trim()
  .regex(/^[a-z][a-z0-9_]*$/, "Categoria inválida");

export const offerListQuerySchema = z.object({
  city: z.string().min(2).max(80).optional(),
  state: z
    .string()
    .trim()
    .length(2)
    .transform((v) => v.toUpperCase())
    .optional(),
  radiusKm: offerSearchRadiusSchema.optional(),
  scope: offerRegionScopeSchema.optional(),
  verticalSlug: offerVerticalSlugSchema.optional(),
  categorySlug: offerCategorySlugSchema.optional(),
  category: z
    .enum([
      "MEAT",
      "PRODUCE",
      "DAIRY",
      "BAKERY",
      "BEVERAGES",
      "FROZEN",
      "PANTRY",
      "CLEANING",
      "OTHER",
    ])
    .optional(),
  q: z.string().max(100).optional(),
  searchScope: z
    .enum(["all", "product", "store", "category"])
    .optional()
    .default("all"),
  sortBy: z
    .enum(["relevance", "price_asc", "discount_desc"])
    .optional()
    .default("relevance"),
  favoritesOnly: z.coerce.boolean().optional(),
});

export const offerAddToShoppingSchema = z.object({
  offerId: z.string().uuid("Oferta inválida"),
  listId: z.string().uuid().optional(),
});

export const offerForRecipeQuerySchema = z.object({
  recipeId: z.string().uuid("Receita inválida"),
  city: z.string().min(2).max(80).optional(),
  state: z
    .string()
    .trim()
    .length(2)
    .transform((v) => v.toUpperCase())
    .optional(),
  radiusKm: offerSearchRadiusSchema.optional(),
  scope: offerRegionScopeSchema.optional(),
});

export const offersForIngredientsBodySchema = z.object({
  names: z
    .array(z.string().trim().min(1, "Nome inválido").max(100))
    .min(1, "Informe ao menos um ingrediente")
    .max(32, "Máximo de 32 ingredientes"),
  context: z.enum(["weekly_plan", "ingredients"]).optional(),
  city: z.string().min(2).max(80).optional(),
  state: z
    .string()
    .trim()
    .length(2)
    .transform((v) => v.toUpperCase())
    .optional(),
  radiusKm: offerSearchRadiusSchema.optional(),
});

export const offerRegionQuerySchema = z.object({
  city: z.string().min(2).max(80).optional(),
  state: z
    .string()
    .trim()
    .length(2)
    .transform((v) => v.toUpperCase())
    .optional(),
  radiusKm: offerSearchRadiusSchema.optional(),
  scope: offerRegionScopeSchema.optional(),
});

export const shoppingListItemSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(100),
  quantity: z.number().positive().optional(),
  unit: z.string().max(20).optional(),
  listId: z.string().uuid().optional(),
});

export const shoppingListItemUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  quantity: z.number().positive().nullable().optional(),
  unit: z.string().max(20).nullable().optional(),
  isChecked: z.boolean().optional(),
  category: z.string().max(32).optional(),
});

export const shoppingListFromRecipeSchema = z.object({
  recipeId: z.string().uuid("Receita inválida"),
  listId: z.string().uuid().optional(),
});

export const shoppingListGenerateSchema = z.object({
  recipeIds: z
    .array(z.string().uuid("ID de receita inválido"))
    .min(1, "Selecione ao menos uma receita")
    .max(20, "Máximo de 20 receitas"),
  listId: z.string().uuid().optional(),
  excludePantry: z.boolean().default(true),
  persist: z.boolean().default(true),
});

export const shoppingListQuerySchema = z.object({
  listId: z.string().uuid().optional(),
});

export const shoppingListCreateSchema = z.object({
  name: z.string().min(2, "Nome muito curto").max(80),
});

export const shoppingListUpdateSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  notes: z.string().max(500).nullable().optional(),
});

export const shoppingLinkOfferSchema = z.object({
  itemId: z.string().uuid(),
  offerId: z.string().uuid(),
});

export const pricingCompareQuerySchema = z.object({
  city: z.string().min(2, "Cidade inválida").max(80),
  listId: z.string().uuid().optional(),
  mode: z.enum(["list", "basket"]).default("list"),
});

export const pricingCompareItemSchema = z.object({
  name: z.string().min(1).max(100),
  quantity: z.number().positive().optional(),
});

export const pricingCompareBodySchema = z.object({
  city: z.string().min(2).max(80),
  items: z.array(pricingCompareItemSchema).min(1).max(50),
});

export const homeFeedQuerySchema = z.object({
  city: z.string().min(2).max(80).optional(),
  state: z
    .string()
    .trim()
    .length(2)
    .transform((v) => v.toUpperCase())
    .optional(),
  radiusKm: offerSearchRadiusSchema.optional(),
});

export const profileUpdateSchema = z
  .object({
    fullName: z
      .string()
      .min(2, "Nome deve ter no mínimo 2 caracteres")
      .max(100)
      .optional(),
    bodyWeightKg: z.number().min(30).max(300).nullable().optional(),
    bodyHeightCm: z.number().min(100).max(250).nullable().optional(),
    fitnessGoal: z.enum(FITNESS_GOALS).nullable().optional(),
    seniorModeEnabled: z.boolean().optional(),
    offerPreferences: offerPreferencesSchema.optional(),
  })
  .refine(
    (data) =>
      data.fullName !== undefined ||
      data.bodyWeightKg !== undefined ||
      data.bodyHeightCm !== undefined ||
      data.fitnessGoal !== undefined ||
      data.seniorModeEnabled !== undefined ||
      data.offerPreferences !== undefined,
    { message: "Informe ao menos um campo para atualizar" },
  );

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(8, "Senha atual inválida"),
    password: z.string().min(8, "Senha deve ter no mínimo 8 caracteres"),
    confirmPassword: z.string().min(8, "Confirme a senha"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

const scanImageBaseSchema = z.object({
  storagePath: storagePathSchema.optional(),
  imageBase64: z.string().min(100).max(MAX_BASE64_LENGTH).optional(),
  mimeType: z
    .enum(["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"])
    .optional(),
  context: z.string().max(300).optional(),
});

export const scanIngredientsSchema = scanImageBaseSchema
  .extend({
    addToPantry: z.boolean().default(false),
  })
  .refine((data) => data.storagePath || data.imageBase64, {
    message: "Envie storagePath ou imageBase64",
  });

export const scanAndGenerateSchema = scanImageBaseSchema
  .extend({
    mode: z.enum(RECIPE_GENERATION_MODES).default("STANDARD"),
    servings: coerceServings(4),
    maxPrepTimeMinutes: coerceOptionalInt(5, 180),
    dietaryPreferences: z.array(z.string()).optional(),
    fitnessGoals: fitnessGoalsRequestSchema.optional(),
    forceRegenerate: z.boolean().default(false),
  })
  .refine((data) => data.storagePath || data.imageBase64, {
    message: "Envie storagePath ou imageBase64",
  });

export const billingCheckoutSchema = z.object({
  planId: z.enum(["pro", "family"]),
});

export const antiWasteGenerateSchema = z.object({
  pantryItemIds: z.array(z.string().uuid()).max(20).optional(),
  servings: z.number().int().min(1).max(12).default(4),
  maxPrepTimeMinutes: z.number().int().min(5).max(180).optional(),
  extraNotes: z.string().max(500).optional(),
  includeSupplementalPantry: z.boolean().default(true),
  forceRegenerate: z.boolean().default(false),
});

export const deleteAccountSchema = z.object({
  confirmEmail: z.string().email("Informe o e-mail da sua conta"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export const adminListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(5).max(50).default(20),
  q: z.string().max(100).optional(),
});

export const adminActivityQuerySchema = z.object({
  limit: z.coerce.number().int().min(10).max(100).default(40),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type GenerateRecipeInput = z.infer<typeof generateRecipeSchema>;
export type AdaptRecipeInput = z.infer<typeof adaptRecipeSchema>;
export type SubstitutionsInput = z.infer<typeof substitutionsSchema>;
export type MacrosInput = z.infer<typeof macrosSchema>;
export type RefineRecipeInput = z.infer<typeof refineRecipeSchema>;
export type PantryItemInput = z.infer<typeof pantryItemSchema>;
export type PantryItemUpdateInput = z.infer<typeof pantryItemUpdateSchema>;
export type FavoriteInput = z.infer<typeof favoriteSchema>;
export type ShoppingListItemInput = z.infer<typeof shoppingListItemSchema>;
export type ShoppingListItemUpdateInput = z.infer<
  typeof shoppingListItemUpdateSchema
>;
export type ShoppingListFromRecipeInput = z.infer<
  typeof shoppingListFromRecipeSchema
>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type ScanIngredientsInput = z.infer<typeof scanIngredientsSchema>;
export type ScanAndGenerateInput = z.infer<typeof scanAndGenerateSchema>;
export type BillingCheckoutInput = z.infer<typeof billingCheckoutSchema>;
export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>;
export type AntiWasteGenerateInput = z.infer<typeof antiWasteGenerateSchema>;
