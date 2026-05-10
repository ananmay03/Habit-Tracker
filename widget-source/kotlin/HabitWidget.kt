// widget-source/kotlin/HabitWidget.kt
package com.habittrack.app.widget

import android.content.Context
import androidx.compose.runtime.Composable
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.glance.GlanceId
import androidx.glance.GlanceModifier
import androidx.glance.GlanceTheme
import androidx.glance.action.actionParametersOf
import androidx.glance.action.actionStartActivity
import androidx.glance.action.clickable
import androidx.glance.appwidget.GlanceAppWidget
import androidx.glance.appwidget.action.actionRunCallback
import androidx.glance.appwidget.cornerRadius
import androidx.glance.appwidget.lazy.LazyColumn
import androidx.glance.appwidget.lazy.items
import androidx.glance.appwidget.provideContent
import androidx.glance.background
import androidx.glance.layout.Alignment
import androidx.glance.layout.Box
import androidx.glance.layout.Column
import androidx.glance.layout.Row
import androidx.glance.layout.Spacer
import androidx.glance.layout.fillMaxSize
import androidx.glance.layout.fillMaxWidth
import androidx.glance.layout.height
import androidx.glance.layout.padding
import androidx.glance.layout.size
import androidx.glance.layout.width
import androidx.glance.layout.wrapContentHeight
import androidx.glance.text.FontWeight
import androidx.glance.text.Text
import androidx.glance.text.TextStyle
import androidx.glance.unit.ColorProvider

// Like a JS default export — this is what the widget system instantiates.
class HabitWidget : GlanceAppWidget() {

  override suspend fun provideGlance(context: Context, id: GlanceId) {
    // Read fresh data on every render. SharedPreferences is fast.
    val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    val json = prefs.getString(PREFS_KEY, "[]")
    val habits = HabitParser.parse(json)
    val today = HabitDates.todayISO()

    provideContent {
      GlanceTheme {
        WidgetContent(habits = habits, today = today)
      }
    }
  }

  @Composable
  private fun WidgetContent(habits: List<Habit>, today: String) {
    Column(
      modifier = GlanceModifier
        .fillMaxSize()
        .background(WIDGET_BG)
        .cornerRadius(20.dp)
        .padding(14.dp)
    ) {
      if (habits.isEmpty()) {
        EmptyState()
      } else {
        // LazyColumn = scrollable list, equivalent to FlatList in RN.
        // `weight(1f)` would be ideal here but Glance's modifier system
        // is more limited; defaultWeight() works inside Row/Column.
        LazyColumn(modifier = GlanceModifier.fillMaxWidth()) {
          items(habits, itemId = { habit -> habit.id.hashCode().toLong() }) { habit ->
            HabitRow(habit = habit, today = today)
          }
        }

        // Footer summary
        Spacer(modifier = GlanceModifier.height(8.dp))
        FooterSummary(habits = habits, today = today)
      }
    }
  }

  @Composable
  private fun EmptyState() {
    Box(
      modifier = GlanceModifier.fillMaxSize(),
      contentAlignment = Alignment.Center
    ) {
      Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(
          "No habits yet",
          style = TextStyle(
            color = ColorProvider(TEXT_PRIMARY),
            fontSize = 14.sp,
            fontWeight = FontWeight.Medium,
          )
        )
        Spacer(modifier = GlanceModifier.height(4.dp))
        Text(
          "Tap to open the app",
          style = TextStyle(
            color = ColorProvider(TEXT_SECONDARY),
            fontSize = 12.sp,
          ),
          modifier = GlanceModifier.clickable(actionStartActivity(LauncherActivityClass()))
        )
      }
    }
  }

  @Composable
  private fun HabitRow(habit: Habit, today: String) {
    val color = HabitColors.parseHex(habit.color)
    val isDoneToday = habit.completedDates.contains(today)
    val tilesDates = HabitDates.lastNDates(TILE_COUNT, today)

    Row(
      modifier = GlanceModifier
        .fillMaxWidth()
        .padding(vertical = 6.dp),
      verticalAlignment = Alignment.CenterVertically,
    ) {
      // Emoji + name (truncated by available width)
      Text(
        habit.emoji,
        style = TextStyle(fontSize = 16.sp, color = ColorProvider(TEXT_PRIMARY)),
      )
      Spacer(modifier = GlanceModifier.width(6.dp))
      Box(modifier = GlanceModifier.width(64.dp)) {
        Text(
          habit.name,
          style = TextStyle(
            color = ColorProvider(TEXT_PRIMARY),
            fontSize = 12.sp,
            fontWeight = FontWeight.Medium,
          ),
          maxLines = 1,
        )
      }

      Spacer(modifier = GlanceModifier.width(6.dp))

      // 28-tile heatmap
      Row(verticalAlignment = Alignment.CenterVertically) {
        for (date in tilesDates) {
          val done = habit.completedDates.contains(date)
          val tileColor = if (done) color else EMPTY_TILE
          Box(
            modifier = GlanceModifier
              .size(9.dp)
              .background(tileColor)
              .cornerRadius(2.dp)
          ) {}
          Spacer(modifier = GlanceModifier.width(2.dp))
        }
      }

      Spacer(modifier = GlanceModifier.width(6.dp))

      // Toggle button — fires LogHabitAction with this habit's id.
      val toggleColor = if (isDoneToday) color else EMPTY_TILE
      Box(
        modifier = GlanceModifier
          .size(22.dp)
          .background(toggleColor)
          .cornerRadius(11.dp)
          .clickable(
            actionRunCallback<LogHabitAction>(
              actionParametersOf(
                LogHabitAction.HabitIdParam to habit.id
              )
            )
          ),
        contentAlignment = Alignment.Center,
      ) {
        Text(
          if (isDoneToday) "✓" else "+",
          style = TextStyle(
            color = ColorProvider(TEXT_PRIMARY),
            fontSize = 12.sp,
            fontWeight = FontWeight.Bold,
          )
        )
      }
    }
  }

  @Composable
  private fun FooterSummary(habits: List<Habit>, today: String) {
    val doneToday = habits.count { it.completedDates.contains(today) }
    val total = habits.size
    val avgStreak = if (habits.isEmpty()) 0
      else habits.sumOf { StreakCalc.calculate(it.completedDates, today) } / habits.size

    Row(
      modifier = GlanceModifier
        .fillMaxWidth()
        .padding(top = 4.dp),
      horizontalAlignment = Alignment.CenterHorizontally,
      verticalAlignment = Alignment.CenterVertically,
    ) {
      Text(
        "🔥 $avgStreak avg  ·  $doneToday/$total today",
        style = TextStyle(
          color = ColorProvider(TEXT_SECONDARY),
          fontSize = 11.sp,
          fontWeight = FontWeight.Medium,
        )
      )
    }
  }
}

// Helper for opening the launcher activity from the widget.
private fun LauncherActivityClass(): Class<*> {
  return Class.forName("com.habittrack.app.MainActivity")
}
