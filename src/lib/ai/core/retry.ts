const RETRYABLE_PATTERNS = [
  /rate limit/i,
  /timeout/i,
  /503/,
  /502/,
  /500/,
  /ECONNRESET/,
  /ETIMEDOUT/,
  /OPENAI_EMPTY_RESPONSE/,
  /OPENAI_INVALID_RESPONSE/,
];

export type RetryOptions = {
  maxAttempts?: number;
  baseDelayMs?: number;
};

export function isRetryableError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return RETRYABLE_PATTERNS.some((pattern) => pattern.test(message));
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const maxAttempts = options.maxAttempts ?? 3;
  const baseDelayMs = options.baseDelayMs ?? 600;

  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const shouldRetry = attempt < maxAttempts && isRetryableError(error);
      if (!shouldRetry) break;
      await sleep(baseDelayMs * attempt);
    }
  }

  throw lastError;
}
