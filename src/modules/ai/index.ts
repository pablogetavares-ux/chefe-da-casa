export {
  handleAiRecipeFullUpdate,
  handleAiRecipeMetadataUpdate,
} from "@/modules/ai/services/recipe-mutation-route";

// Re-export core AI domain (runtime continua em lib/ai durante migração gradual)
export * from "@/lib/ai/client";
export * from "@/lib/ai/limits";
export * from "@/lib/ai/route-utils";
export * from "@/lib/ai/constants/recipe-modes";
