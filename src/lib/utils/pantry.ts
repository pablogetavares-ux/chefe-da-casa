export type ExpiryStatus = "expired" | "soon" | "ok" | null;

export function getExpiryStatus(expiresAt: string | null): ExpiryStatus {
  if (!expiresAt) return null;

  const expiry = new Date(expiresAt);
  const now = new Date();
  const diffMs = expiry.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "expired";
  if (diffDays <= 3) return "soon";
  return "ok";
}

export function formatExpiryLabel(expiresAt: string | null): string | null {
  const status = getExpiryStatus(expiresAt);
  if (!status || !expiresAt) return null;

  const expiry = new Date(expiresAt);
  const label = expiry.toLocaleDateString("pt-BR");

  if (status === "expired") return `Venceu em ${label}`;
  if (status === "soon") return `Vence em ${label}`;
  return `Validade: ${label}`;
}

export function toDateInputValue(expiresAt: string | null): string {
  if (!expiresAt) return "";
  return expiresAt.slice(0, 10);
}
