// lib/dates.ts
// All dates in this app are LOCAL ISO strings ("YYYY-MM-DD") so that
// "today" matches what the user sees on their phone's clock. Avoid
// `Date.toISOString()` here — that returns UTC, which crosses day boundaries
// for users far from Greenwich (e.g. SG, +8h).

/** Returns today's local date as "YYYY-MM-DD". */
export function todayISO(): string {
  return toISODate(new Date());
}

/** Convert a JS Date to "YYYY-MM-DD" using its LOCAL components. */
export function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Parse "YYYY-MM-DD" into a JS Date at midnight local time. */
export function fromISODate(iso: string): Date {
  const parts = iso.split("-").map(Number);
  const year = parts[0] ?? 1970;
  const month = parts[1] ?? 1;
  const day = parts[2] ?? 1;
  return new Date(year, month - 1, day);
}

/** "2026-05-10" + 3 → "2026-05-13"; handles month/year/leap-year boundaries. */
export function addDays(iso: string, days: number): string {
  const d = fromISODate(iso);
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

/** Convenience wrapper for negative addDays. */
export function subtractDays(iso: string, days: number): string {
  return addDays(iso, -days);
}

/** Signed integer days between two ISO dates. b - a. */
export function daysBetween(a: string, b: string): number {
  const da = fromISODate(a).getTime();
  const db = fromISODate(b).getTime();
  return Math.round((db - da) / (1000 * 60 * 60 * 24));
}
