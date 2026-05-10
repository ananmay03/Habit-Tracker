// widget-source/kotlin/HabitWidgetReceiver.kt
package com.habittrack.app.widget

import android.app.AlarmManager
import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.content.Context
import android.content.Intent
import androidx.glance.appwidget.GlanceAppWidget
import androidx.glance.appwidget.GlanceAppWidgetManager
import androidx.glance.appwidget.GlanceAppWidgetReceiver
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import java.util.Calendar

/**
 * GlanceAppWidgetReceiver is the bridge between the legacy AppWidget framework
 * (declared in AndroidManifest.xml) and the modern Glance Compose-based widget.
 *
 * Responsibilities:
 *   1. Forward standard widget lifecycle events to HabitWidget.
 *   2. Listen for our custom WIDGET_REFRESH broadcast (sent by JS via the bridge).
 *   3. Listen for our WIDGET_MIDNIGHT alarm and re-render so the tile window
 *      shifts when the day rolls over.
 *   4. Schedule the next midnight alarm whenever we re-render or boot.
 */
class HabitWidgetReceiver : GlanceAppWidgetReceiver() {

  // Tells Glance which widget class to render. Equivalent to assigning the
  // RemoteViews factory in classic widgets.
  override val glanceAppWidget: GlanceAppWidget = HabitWidget()

  override fun onReceive(context: Context, intent: Intent) {
    super.onReceive(context, intent)

    when (intent.action) {
      ACTION_REFRESH, ACTION_MIDNIGHT -> {
        forceUpdateAll(context)
      }
      AppWidgetManager.ACTION_APPWIDGET_UPDATE,
      Intent.ACTION_BOOT_COMPLETED -> {
        scheduleMidnightAlarm(context)
      }
    }
  }

  override fun onEnabled(context: Context) {
    super.onEnabled(context)
    // First widget instance placed — schedule the first midnight alarm.
    scheduleMidnightAlarm(context)
  }

  override fun onDisabled(context: Context) {
    super.onDisabled(context)
    // Last widget instance removed — cancel the midnight alarm.
    cancelMidnightAlarm(context)
  }

  /**
   * Force-update every placed instance of HabitWidget. Used when JS notifies
   * us of a data change or when the midnight alarm fires.
   */
  private fun forceUpdateAll(context: Context) {
    CoroutineScope(Dispatchers.IO).launch {
      val manager = GlanceAppWidgetManager(context)
      val ids = manager.getGlanceIds(HabitWidget::class.java)
      val widget = HabitWidget()
      for (id in ids) {
        widget.update(context, id)
      }
      // Re-arm the midnight alarm whenever we update — keeps it self-healing.
      scheduleMidnightAlarm(context)
    }
  }

  companion object {
    private const val MIDNIGHT_REQUEST_CODE = 1003

    /**
     * Schedule a single alarm for the next local midnight that triggers
     * our ACTION_MIDNIGHT broadcast. Re-armed on each fire.
     */
    fun scheduleMidnightAlarm(context: Context) {
      val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
      val pi = midnightPendingIntent(context)
      val triggerAt = nextMidnightMillis()

      // We use setExact rather than setExactAndAllowWhileIdle: the date
      // change is deferrable by ~minutes during Doze and the user wouldn't
      // notice. setExact doesn't require SCHEDULE_EXACT_ALARM permission
      // grant on Android 12+ (the manifest declaration is enough).
      try {
        alarmManager.setExact(AlarmManager.RTC, triggerAt, pi)
      } catch (e: SecurityException) {
        // Fall back to inexact if the OEM denied exact alarms entirely.
        alarmManager.set(AlarmManager.RTC, triggerAt, pi)
      }
    }

    fun cancelMidnightAlarm(context: Context) {
      val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
      alarmManager.cancel(midnightPendingIntent(context))
    }

    private fun midnightPendingIntent(context: Context): PendingIntent {
      val intent = Intent(ACTION_MIDNIGHT).apply {
        setPackage(context.packageName)
        setClass(context, HabitWidgetReceiver::class.java)
      }
      // FLAG_IMMUTABLE is mandatory on API 31+. UPDATE_CURRENT replaces any
      // pending alarm with this one so we don't stack duplicates.
      return PendingIntent.getBroadcast(
        context,
        MIDNIGHT_REQUEST_CODE,
        intent,
        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
      )
    }

    private fun nextMidnightMillis(): Long {
      val cal = Calendar.getInstance().apply {
        add(Calendar.DAY_OF_YEAR, 1)
        set(Calendar.HOUR_OF_DAY, 0)
        set(Calendar.MINUTE, 0)
        set(Calendar.SECOND, 1) // 1 second after midnight to avoid edge cases
        set(Calendar.MILLISECOND, 0)
      }
      return cal.timeInMillis
    }
  }
}
