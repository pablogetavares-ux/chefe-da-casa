/** Alinhado a maxDuration=60s nas rotas AI (margem para cleanup). */
export const AI_OPENAI_TIMEOUT_MS = 55_000;

export function createOpenAiAbortSignal(): AbortSignal {
  return AbortSignal.timeout(AI_OPENAI_TIMEOUT_MS);
}

export function isOpenAiTimeoutError(error: unknown): boolean {
  if (error instanceof DOMException) {
    return error.name === "TimeoutError" || error.name === "AbortError";
  }
  if (error instanceof Error) {
    return /timeout|timed out|abort/i.test(error.message);
  }
  return false;
}
