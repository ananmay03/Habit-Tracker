// modules/habit-widget-bridge/src/index.ts
import HabitWidgetBridge from "./HabitWidgetBridgeModule";

/**
 * Persist the entire habits array (as JSON string) to SharedPreferences.
 * The widget will read this same string on its next render.
 */
export function saveHabits(habitsJson: string): Promise<void> {
  return HabitWidgetBridge.saveHabits(habitsJson);
}

/**
 * Read the habits JSON string from SharedPreferences.
 * Returns "[]" if no data has ever been saved.
 */
export function loadHabits(): Promise<string> {
  return HabitWidgetBridge.loadHabits();
}

/**
 * Tell the widget to re-render. Sends a broadcast intent that the
 * widget's receiver subscribes to. Safe to call before any widget is
 * placed on the home screen — it's a no-op in that case.
 */
export function refreshWidget(): Promise<void> {
  return HabitWidgetBridge.refreshWidget();
}
