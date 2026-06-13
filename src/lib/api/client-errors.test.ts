import { describe, expect, it } from "vitest";

import {
  ApiClientError,
  classifyClientError,
  shouldRetryQuery,
} from "@/lib/api/client-errors";

describe("classifyClientError", () => {
  it("classifies network errors as retryable", () => {
    const result = classifyClientError(
      new ApiClientError(
        "Sem conexão com o servidor. Verifique sua internet e tente novamente.",
        "NETWORK_ERROR",
      ),
    );

    expect(result.kind).toBe("network");
    expect(result.canRetry).toBe(true);
  });

  it("classifies premium required as non-retryable", () => {
    const result = classifyClientError(
      new ApiClientError("Recurso premium", "PREMIUM_REQUIRED", 403),
    );

    expect(result.kind).toBe("premium_required");
    expect(result.canRetry).toBe(false);
  });

  it("classifies AI timeout as retryable", () => {
    const result = classifyClientError(
      new ApiClientError("A requisição demorou demais.", "AI_TIMEOUT", 504),
    );

    expect(result.kind).toBe("ai_error");
    expect(result.canRetry).toBe(true);
  });
});

describe("shouldRetryQuery", () => {
  it("retries server errors up to twice", () => {
    const error = new ApiClientError("Erro interno", undefined, 500);
    expect(shouldRetryQuery(error, 0)).toBe(true);
    expect(shouldRetryQuery(error, 1)).toBe(true);
    expect(shouldRetryQuery(error, 2)).toBe(false);
  });

  it("does not retry premium errors", () => {
    const error = new ApiClientError("Premium", "PREMIUM_REQUIRED", 403);
    expect(shouldRetryQuery(error, 0)).toBe(false);
  });
});
