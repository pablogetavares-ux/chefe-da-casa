export type ClientErrorKind =
  | "network"
  | "timeout"
  | "unauthorized"
  | "premium_required"
  | "plan_limit"
  | "ai_error"
  | "billing_pending"
  | "validation"
  | "server"
  | "unknown";

const NETWORK_MESSAGE =
  "Sem conexão com o servidor. Verifique sua internet e tente novamente.";
const TIMEOUT_MESSAGE = "A requisição demorou demais. Tente novamente.";

export class ApiClientError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

const PLAN_LIMIT_CODES = new Set([
  "AI_LIMIT_REACHED",
  "PANTRY_LIMIT_REACHED",
  "FAVORITES_LIMIT_REACHED",
  "RECIPES_LIMIT_REACHED",
]);

const AI_ERROR_CODES = new Set([
  "OPENAI_NOT_CONFIGURED",
  "SERVICE_ROLE_MISSING",
  "AI_RATE_LIMIT",
  "SCAN_FAILED",
]);

const VALIDATION_CODES = new Set(["VALIDATION_ERROR", "INVALID_IMAGE_TYPE"]);

export function isOffline(): boolean {
  return typeof navigator !== "undefined" && navigator.onLine === false;
}

export function classifyClientError(error: unknown): {
  kind: ClientErrorKind;
  message: string;
  canRetry: boolean;
  code?: string;
} {
  if (error instanceof ApiClientError) {
    return classifyApiClientError(error);
  }

  if (error instanceof Error) {
    if (error.name === "UnauthorizedError") {
      return {
        kind: "unauthorized",
        message: error.message,
        canRetry: false,
        code: "UNAUTHORIZED",
      };
    }

    if (error.message === TIMEOUT_MESSAGE) {
      return {
        kind: "timeout",
        message: error.message,
        canRetry: true,
        code: "TIMEOUT",
      };
    }

    if (error.message === NETWORK_MESSAGE || isOffline()) {
      return {
        kind: "network",
        message: NETWORK_MESSAGE,
        canRetry: true,
        code: "NETWORK_ERROR",
      };
    }
  }

  const message =
    error instanceof Error
      ? error.message
      : "Erro inesperado. Tente novamente.";

  return {
    kind: "unknown",
    message,
    canRetry: true,
  };
}

function classifyApiClientError(error: ApiClientError): {
  kind: ClientErrorKind;
  message: string;
  canRetry: boolean;
  code?: string;
} {
  const code = error.code;

  if (code === "NETWORK_ERROR") {
    return {
      kind: "network",
      message: error.message,
      canRetry: true,
      code,
    };
  }

  if (code === "PREMIUM_REQUIRED") {
    return {
      kind: "premium_required",
      message: error.message,
      canRetry: false,
      code,
    };
  }

  if (code && PLAN_LIMIT_CODES.has(code)) {
    return {
      kind: "plan_limit",
      message: error.message,
      canRetry: false,
      code,
    };
  }

  if (code === "BILLING_PENDING") {
    return {
      kind: "billing_pending",
      message: error.message,
      canRetry: false,
      code,
    };
  }

  if (code && (AI_ERROR_CODES.has(code) || code === "AI_TIMEOUT")) {
    return {
      kind: "ai_error",
      message: error.message,
      canRetry:
        code !== "OPENAI_NOT_CONFIGURED" && code !== "SERVICE_ROLE_MISSING",
      code,
    };
  }

  if (code && VALIDATION_CODES.has(code)) {
    return {
      kind: "validation",
      message: error.message,
      canRetry: false,
      code,
    };
  }

  if (error.status === 401 || code === "UNAUTHORIZED") {
    return {
      kind: "unauthorized",
      message: error.message,
      canRetry: false,
      code: code ?? "UNAUTHORIZED",
    };
  }

  if (error.status === 408 || code === "TIMEOUT" || code === "AI_TIMEOUT") {
    return {
      kind: "timeout",
      message: error.message,
      canRetry: true,
      code: code ?? "TIMEOUT",
    };
  }

  if (error.status && error.status >= 500) {
    return {
      kind: "server",
      message: error.message,
      canRetry: true,
      code,
    };
  }

  return {
    kind: "unknown",
    message: error.message,
    canRetry: true,
    code,
  };
}

export function getUserFacingMessage(error: unknown): string {
  if (error instanceof ApiClientError || error instanceof Error) {
    return error.message;
  }

  return "Erro inesperado. Tente novamente.";
}

export function shouldRetryQuery(
  error: unknown,
  failureCount: number,
): boolean {
  if (failureCount >= 2) return false;
  if (isOffline()) return false;

  const { canRetry, kind } = classifyClientError(error);
  return (
    canRetry && (kind === "network" || kind === "timeout" || kind === "server")
  );
}

export function networkErrorMessage(): string {
  return NETWORK_MESSAGE;
}

export function timeoutErrorMessage(): string {
  return TIMEOUT_MESSAGE;
}
