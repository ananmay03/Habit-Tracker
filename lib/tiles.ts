// lib/tiles.ts
import { todayISO, subtractDays } from "./dates";

/** Number of tiles drawn per habit row in the widget (4 weeks). */
export const TILE_COUNT = 28;

/**
 * Returns an array of `count` booleans, oldest-first, ending at `today`.
 * - tiles[0]            → (today - count + 1) days ago
 * - tiles[count - 1]    → today
 *
 * The widget renders these left-to-right, so the rightmost tile is "today".
 * Pure function, deterministic given the inputs — easy to test.
 */
export function generateTiles(
  completedDates: string[],
  today: string = todayISO(),
  count: number = TILE_COUNT
): boolean[] {
  const completed = new Set(completedDates);
  const tiles: boolean[] = new Array(count);
  for (let i = 0; i < count; i++) {
    const offset = count - 1 - i;
    tiles[i] = completed.has(subtractDays(today, offset));
  }
  return tiles;
}

/** 365-tile variant for the full-year heatmap shown in the companion app. */
export function generateYearTiles(
  completedDates: string[],
  today: string = todayISO()
): boolean[] {
  return generateTiles(completedDates, today, 365);
}

/**
 * Generate a YEAR worth of tile metadata (date + done flag) — used by the
 * companion app's heatmap so each cell knows its own date for tap handling.
 */
export interface DatedTile {
  date: string;
  done: boolean;
}

export function generateDatedYearTiles(
  completedDates: string[],
  today: string = todayISO()
): DatedTile[] {
  const completed = new Set(completedDates);
  const out: DatedTile[] = [];
  for (let i = 364; i >= 0; i--) {
    const date = subtractDays(today, i);
    out.push({ date, done: completed.has(date) });
  }
  return out;
}
