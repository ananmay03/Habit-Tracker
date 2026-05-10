// lib/habitStore.ts
// CRUD operations on the habits list. All operations go through the native
// bridge so SharedPreferences stays the single source of truth.
import {
  saveHabits as saveHabitsNative,
  loadHabits as loadHabitsNative,
  refreshWidget,
} from "../modules/habit-widget-bridge";
import type { Habit, HabitInput } from "./types";
import { todayISO } from "./dates";

/**
 * Generate a non-cryptographic unique ID. Habits are local-only so we don't
 * need crypto-strength randomness.
 */
function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 11)}`;
}

/** Read all habits. Returns [] if nothing has ever been saved. */
export async function loadHabits(): Promise<Habit[]> {
  const json = await loadHabitsNative();
  try {
    const parsed = JSON.parse(json);
    if (Array.isArray(parsed)) return parsed as Habit[];
    return [];
  } catch {
    return [];
  }
}

/**
 * Persist the full habits array AND trigger a widget refresh. Every public
 * mutation in this file funnels through this function so we can't forget
 * to refresh the widget.
 */
export async function saveHabits(habits: Habit[]): Promise<void> {
  await saveHabitsNative(JSON.stringify(habits));
  await refreshWidget();
}

/** Append a new habit and persist. Returns the created habit. */
export async function addHabit(input: HabitInput): Promise<Habit> {
  const habits = await loadHabits();
  const newHabit: Habit = {
    id: generateId(),
    name: input.name,
    emoji: input.emoji,
    color: input.color,
    completedDates: [],
  };
  await saveHabits([...habits, newHabit]);
  return newHabit;
}

/** Remove a habit by id and persist. No-op if not found. */
export async function deleteHabit(id: string): Promise<void> {
  const habits = await loadHabits();
  const filtered = habits.filter((h) => h.id !== id);
  if (filtered.length === habits.length) return;
  await saveHabits(filtered);
}

/**
 * Toggle completion for a single habit on a given date (defaults to today).
 * If the date was completed → remove it; if it wasn't → add it (sorted).
 */
export async function toggleCompletion(
  id: string,
  date: string = todayISO()
): Promise<void> {
  const habits = await loadHabits();
  const updated = habits.map((h) => {
    if (h.id !== id) return h;
    const completed = new Set(h.completedDates);
    if (completed.has(date)) {
      completed.delete(date);
    } else {
      completed.add(date);
    }
    return { ...h, completedDates: Array.from(completed).sort() };
  });
  await saveHabits(updated);
}

/** Single habit by id, or null. */
export async function getHabit(id: string): Promise<Habit | null> {
  const habits = await loadHabits();
  return habits.find((h) => h.id === id) ?? null;
}
