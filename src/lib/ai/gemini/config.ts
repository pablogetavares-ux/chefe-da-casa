/** Configuração Gemini — opcional, server-only. Inativo até GEMINI_API_KEY na Vercel. */

export function isGeminiConfigured() {
  return Boolean(process.env.GEMINI_API_KEY?.trim());
}

export function isRecipeImageGenerationEnabled() {
  if (process.env.NODE_ENV === "production" && !isGeminiConfigured()) {
    return false;
  }
  if (process.env.RECIPE_IMAGES_ENABLED === "false") return false;
  return isGeminiConfigured();
}

export const GEMINI_CONFIG = {
  model: process.env.GEMINI_MODEL ?? "gemini-2.5-flash",
  imageModel: process.env.GEMINI_IMAGE_MODEL ?? "imagen-3.0-generate-002",
  storageBucket: "recipe-images" as const,
} as const;
