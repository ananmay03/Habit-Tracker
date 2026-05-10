// lib/types.ts

/**
 * Canonical habit shape. Mirrored byte-for-byte by the Kotlin widget
 * when it deserializes the JSON from SharedPreferences.
 */
export interface Habit {
  id: string;                   // unique ID, generated client-side
  name: string;                 // user-visible label, e.g. "Gym"
  emoji: string;                // single grapheme like "🏋️"
  color: string;                // hex string with leading "#", e.g. "#7F77DD"
  completedDates: string[];     // ISO date strings "YYYY-MM-DD", local timezone
}

/** Subset of Habit fields needed to create a new one. */
export type HabitInput = Pick<Habit, "name" | "emoji" | "color">;
