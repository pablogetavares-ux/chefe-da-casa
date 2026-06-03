import { captureException } from "@/lib/observability/monitoring";

type LogLevel = "debug" | "info" | "warn" | "error";

type LogPayload = Record<string, unknown>;

function emit(level: LogLevel, event: string, payload?: LogPayload) {
  const entry = {
    level,
    event,
    ts: new Date().toISOString(),
    service: "chef-da-casa-ai",
    env: process.env.NODE_ENV,
    ...payload,
  };

  const line = JSON.stringify(entry);

  switch (level) {
    case "error":
      console.error(line);
      break;
    case "warn":
      console.warn(line);
      break;
    default:
      console.log(line);
  }
}

export const logger = {
  debug: (event: string, payload?: LogPayload) => emit("debug", event, payload),
  info: (event: string, payload?: LogPayload) => emit("info", event, payload),
  warn: (event: string, payload?: LogPayload) => emit("warn", event, payload),
  error: (event: string, payload?: LogPayload) => emit("error", event, payload),
};

export function logApiError(
  route: string,
  error: unknown,
  context?: LogPayload,
) {
  logger.error("api.error", {
    route,
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    ...context,
  });
  captureException(error, { route, ...context });
}
