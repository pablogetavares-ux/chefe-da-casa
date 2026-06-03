import { z } from "zod";

export const WEEKLY_PLAN_GOALS = ["economizar", "saude", "proteina"] as const;

export const weeklyPlanQuerySchema = z.object({
  goal: z.enum(WEEKLY_PLAN_GOALS, {
    message: "Objetivo inválido (economizar, saude, proteina)",
  }),
  startsOn: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida (YYYY-MM-DD)")
    .optional(),
  excludePantry: z
    .enum(["true", "false", "1", "0"])
    .optional()
    .transform((v) => v !== "false" && v !== "0"),
  persist: z
    .enum(["true", "false", "1", "0"])
    .optional()
    .transform((v) => v === "true" || v === "1"),
});

export const weeklyPlanBodySchema = z.object({
  goal: z.enum(WEEKLY_PLAN_GOALS),
  startsOn: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  excludePantry: z.boolean().optional(),
  persist: z.boolean().optional(),
});

export type WeeklyPlanQueryInput = z.infer<typeof weeklyPlanQuerySchema>;
export type WeeklyPlanBodyInput = z.infer<typeof weeklyPlanBodySchema>;
