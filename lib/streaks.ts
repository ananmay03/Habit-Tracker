// lib/streaks.ts
import { todayISO, subtractDays } from "./dates";

/**
 * GitHub-style streak: number of consecutive completed days
 * ending today (or yesterday if today isn't done yet — the grace period
 * lets the streak survive until midnight). Returns 0 if the most recent
 * completion is more than 1 day in the past.
 */
export function calculateStreak(
  completedDates: string[],
  today: string = todayISO()
): number {
  const completed = new Set(completedDates);
  if (completed.size === 0) return 0;

  let anchor: string;
  if (completed.has(today)) {
    anchor = today;
  } else if (completed.has(subtractDays(today, 1))) {
    anchor = subtractDays(today, 1);
  } else {
    return 0;
  }

  let streak = 0;
  let current = anchor;
  while (completed.has(current)) {
    streak++;
    current = subtractDays(current, 1);
  }
  return streak;
}

/**
 * Percentage (0–100, integer) of the last 30 days that were completed.
 * Used by the widget footer.
 */
export function calculateMonthlyCompletionRate(
  completedDates: string[],
  today: string = todayISO()
): number {
  const completed = new Set(completedDates);
  let count = 0;
  for (let i = 0; i < 30; i++) {
    if (completed.has(subtractDays(today, i))) count++;
  }
  return Math.round((count / 30) * 100);
}

/** Total number of unique days the habit has been completed (lifetime). */
export function totalCompletions(completedDates: string[]): number {
  return new Set(completedDates).size;
}
