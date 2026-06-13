import type { PostgrestError } from "@supabase/supabase-js";

export function isPostgrestError(error: unknown): error is PostgrestError {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    "code" in error
  );
}

/** Repassa erro PostgREST ao catch da rota (sanitizado por handleApiRouteError). */
export function throwIfSupabaseError(
  error: PostgrestError | null,
): asserts error is null {
  if (error) {
    throw error;
  }
}
