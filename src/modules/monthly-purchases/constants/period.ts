export const MONTH_LABELS = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
] as const;

export function currentPeriod() {
  const now = new Date();
  return { month: now.getMonth() + 1, year: now.getFullYear() };
}

export function periodLabel(month: number, year: number) {
  return `${MONTH_LABELS[month - 1]} ${year}`;
}

export function shiftPeriod(month: number, year: number, delta: number) {
  const date = new Date(year, month - 1 + delta, 1);
  return { month: date.getMonth() + 1, year: date.getFullYear() };
}

export function isCurrentPeriod(month: number, year: number) {
  const now = currentPeriod();
  return month === now.month && year === now.year;
}
