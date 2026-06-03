/** Valida paths de storage — impede path traversal e acesso cross-user. */
const STORAGE_PATH_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/[a-zA-Z0-9._-]+$/;

export function isValidFoodScanPath(path: string, userId: string) {
  if (!path || path.length > 256) return false;
  if (path.includes("..") || path.includes("\\") || path.includes("\0")) {
    return false;
  }
  if (!path.startsWith(`${userId}/`)) return false;
  return STORAGE_PATH_RE.test(path);
}

export function assertFoodScanPath(path: string, userId: string) {
  if (!isValidFoodScanPath(path, userId)) {
    throw new Error("UNAUTHORIZED");
  }
}
