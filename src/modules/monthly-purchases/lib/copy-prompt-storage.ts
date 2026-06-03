const PREFIX = "chef-monthly-copy-resolved";

export type CopyPromptResolution = "copied" | "empty";

export function copyPromptStorageKey(month: number, year: number) {
  return `${PREFIX}-${year}-${month}`;
}

export function isCopyPromptResolved(month: number, year: number): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(localStorage.getItem(copyPromptStorageKey(month, year)));
}

export function markCopyPromptResolved(
  month: number,
  year: number,
  resolution: CopyPromptResolution,
) {
  if (typeof window === "undefined") return;
  localStorage.setItem(copyPromptStorageKey(month, year), resolution);
}
