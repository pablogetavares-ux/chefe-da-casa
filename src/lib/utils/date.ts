/** UTC start of current month — shared for billing/metering queries. */
export function getMonthStartIso() {
  const start = new Date();
  start.setUTCDate(1);
  start.setUTCHours(0, 0, 0, 0);
  return start.toISOString();
}
