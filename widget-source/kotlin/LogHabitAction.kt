// widget-source/kotlin/LogHabitAction.kt
package com.habittrack.app.widget

import android.content.Context
import androidx.glance.GlanceId
import androidx.glance.action.ActionParameters
import androidx.glance.appwidget.GlanceAppWidgetManager
import androidx.glance.appwidget.action.ActionCallback

/**
 * ActionCallback fired when the user taps the +/✓ button on a habit row.
 * Toggles today's completion for that habit, persists to SharedPreferences,
 * and re-renders the widget.
 *
 * Glance's ActionCallback is the modern replacement for AppIntents in
 * the widget context — it runs in our app's process so it has full
 * SharedPreferences access without needing IPC.
 */
class LogHabitAction : ActionCallback {

  companion object {
    // Parameter key — type-safe analog of an Intent extra.
    val HabitIdParam = ActionParameters.Key<String>("habitId")
  }

  override suspend fun onAction(
    context: Context,
    glanceId: GlanceId,
    parameters: ActionParameters,
  ) {
    val habitId = parameters[HabitIdParam] ?: return

    val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    val json = prefs.getString(PREFS_KEY, "[]")
    val habits = HabitParser.parse(json).toMutableList()
    val today = HabitDates.todayISO()

    val idx = habits.indexOfFirst { it.id == habitId }
    if (idx == -1) return

    val habit = habits[idx]
    val newDates = habit.completedDates.toMutableSet().apply {
      if (contains(today)) remove(today) else add(today)
    }
    habits[idx] = habit.copy(completedDates = newDates)

    // Write back. Use commit() (sync) here so when we trigger the re-render
    // immediately after, the new state is guaranteed to be on disk.
    prefs.edit().putString(PREFS_KEY, HabitParser.stringify(habits)).commit()

    // Re-render the specific widget instance the user tapped.
    HabitWidget().update(context, glanceId)
  }
}
