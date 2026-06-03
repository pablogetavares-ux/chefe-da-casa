/** E-mails com acesso ao painel admin (separados por vírgula no .env). */
export function getAdminEmails(): string[] {
  const raw = process.env.ADMIN_EMAILS?.trim();
  if (!raw) return [];
  return raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

function isAdminListMatch(admins: string[], email: string): boolean {
  return admins.includes(email.toLowerCase());
}

/** Qualquer e-mail informado (sessão ou perfil) pode conceder admin. */
export function isAdminAny(
  ...emails: Array<string | undefined | null>
): boolean {
  const normalized = emails
    .filter((e): e is string => Boolean(e?.trim()))
    .map((e) => e.trim().toLowerCase());
  if (normalized.length === 0) return false;

  const admins = getAdminEmails();
  if (admins.length === 0) {
    return process.env.NODE_ENV !== "production";
  }
  return normalized.some((email) => isAdminListMatch(admins, email));
}

export function isAdminEmail(email: string | undefined | null): boolean {
  return isAdminAny(email);
}
