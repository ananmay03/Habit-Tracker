// widget-source/kotlin/HabitWidgetCommon.kt
package com.habittrack.app.widget

import android.graphics.Color as AndroidColor
import androidx.compose.ui.graphics.Color
import org.json.JSONArray
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Date
import java.util.Locale
import java.util.TimeZone

// SharedPreferences file/key MUST match the strings hardcoded in
// HabitWidgetBridgeModule.kt — they're the contract between JS and the widget.
const val PREFS_NAME = "habit_tracker_prefs"
const val PREFS_KEY = "habits_data"

// Custom broadcast actions
const val ACTION_REFRESH = "com.habittrack.app.action.WIDGET_REFRESH"
const val ACTION_MIDNIGHT = "com.habittrack.app.action.WIDGET_MIDNIGHT"

// Visual constants — kept in one place so theming is a one-line change.
val WIDGET_BG = Color(0xFF12121F)
val EMPTY_TILE = Color(0xFF252535)
val TEXT_PRIMARY = Color(0xFFFFFFFF)
val TEXT_SECONDARY = Color(0xFF9A9AAC)

const val TILE_COUNT = 28

// Pure data class — Kotlin's equivalent of a TS interface. The compiler
// auto-generates equals/hashCode/toString/copy.
data class Habit(
  val id: String,
  val name: String,
  val emoji: String,
  val color: String,                 // hex like "#7F77DD"
  val completedDates: Set<String>,   // ISO local dates "YYYY-MM-DD"
)

object HabitParser {
  /** Parse the JSON string from SharedPreferences into a typed list. */
  fun parse(json: String?): List<Habit> {
    if (json.isNullOrBlank()) return emptyList()
    return try {
      val arr = JSONArray(json)
      val out = mutableListOf<Habit>()
      for (i in 0 until arr.length()) {
        val obj = arr.optJSONObject(i) ?: continue
        out.add(habitFromJson(obj))
      }
      out
    } catch (e: Exception) {
      emptyList()
    }
  }

  /** Re-serialize a list of habits to the same JSON shape the JS layer writes. */
  fun stringify(habits: List<Habit>): String {
    val arr = JSONArray()
    for (h in habits) {
      val obj = JSONObject()
      obj.put("id", h.id)
      obj.put("name", h.name)
      obj.put("emoji", h.emoji)
      obj.put("color", h.color)
      val dates = JSONArray()
      // Stable order so the JS layer doesn't see spurious diffs.
      for (d in h.completedDates.sorted()) dates.put(d)
      obj.put("completedDates", dates)
      arr.put(obj)
    }
    return arr.toString()
  }

  private fun habitFromJson(obj: JSONObject): Habit {
    val datesArr = obj.optJSONArray("completedDates") ?: JSONArray()
    val dates = mutableSetOf<String>()
    for (i in 0 until datesArr.length()) {
      datesArr.optString(i, "").takeIf { it.isNotEmpty() }?.let(dates::add)
    }
    return Habit(
      id = obj.optString("id"),
      name = obj.optString("name"),
      emoji = obj.optString("emoji"),
      color = obj.optString("color", "#7F77DD"),
      completedDates = dates,
    )
  }
}

object HabitDates {
  private val ISO_FMT = SimpleDateFormat("yyyy-MM-dd", Locale.US).apply {
    // Use the device's local zone — matches what the user sees on their clock.
    timeZone = TimeZone.getDefault()
  }

  fun todayISO(): String = ISO_FMT.format(Date())

  /** Returns last `count` ISO dates ending at today, oldest-first. */
  fun lastNDates(count: Int = TILE_COUNT, today: String = todayISO()): List<String> {
    val cal = Calendar.getInstance().apply {
      time = ISO_FMT.parse(today) ?: Date()
    }
    val out = ArrayList<String>(count)
    // Move back to the oldest date in the window
    cal.add(Calendar.DAY_OF_YEAR, -(count - 1))
    for (i in 0 until count) {
      out.add(ISO_FMT.format(cal.time))
      cal.add(Calendar.DAY_OF_YEAR, 1)
    }
    return out
  }
}

object HabitColors {
  /** Parse "#RRGGBB" into a Compose Color, with fallback. */
  fun parseHex(hex: String): Color {
    return try {
      val parsed = AndroidColor.parseColor(hex)
      Color(parsed)
    } catch (e: IllegalArgumentException) {
      Color(0xFF7F77DD)
    }
  }
}

/** Pure streak helper — mirrors the TS implementation. */
object StreakCalc {
  fun calculate(completed: Set<String>, today: String = HabitDates.todayISO()): Int {
    if (completed.isEmpty()) return 0

    val anchor: String = when {
      completed.contains(today) -> today
      completed.contains(prevDay(today)) -> prevDay(today)
      else -> return 0
    }

    var streak = 0
    var cursor = anchor
    while (completed.contains(cursor)) {
      streak++
      cursor = prevDay(cursor)
    }
    return streak
  }

  fun monthlyCompletion(completed: Set<String>, today: String = HabitDates.todayISO()): Int {
    var count = 0
    var cursor = today
    for (i in 0 until 30) {
      if (completed.contains(cursor)) count++
      cursor = prevDay(cursor)
    }
    return Math.round((count / 30f) * 100f)
  }

  private fun prevDay(iso: String): String {
    val fmt = SimpleDateFormat("yyyy-MM-dd", Locale.US).apply {
      timeZone = TimeZone.getDefault()
    }
    val cal = Calendar.getInstance().apply {
      time = fmt.parse(iso) ?: Date()
    }
    cal.add(Calendar.DAY_OF_YEAR, -1)
    return fmt.format(cal.time)
  }
}
