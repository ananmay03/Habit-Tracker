# Habit Tracker

GitHub-style habit tracker for Android. One scrollable home-screen widget shows every habit as a 28-day heatmap with inline log/unlog buttons. Companion Expo app for habit management and full-year history. **Android only. Fully offline. No backend, no accounts.**

## Stack

- **Expo SDK 55** (React Native 0.83.6, React 19.2)
- **expo-router** for file-based navigation
- **Local Expo Module** (`modules/habit-widget-bridge/`) bridging JS → Android SharedPreferences and broadcast intents
- **Native Android widget**: Kotlin + **Jetpack Glance 1.1.1** (Compose-style API for app widgets)
- **EAS Build** (cloud) for release APKs — no local Android Studio required

## How the pieces connect

```
┌──────────────────────────────┐         ┌────────────────────────────┐
│  Expo App (React Native)     │         │  Android Widget (Kotlin)   │
│                              │         │                            │
│  habitStore.ts ──┐           │         │  HabitWidget.kt            │
│                  │           │         │   (Jetpack Glance UI)      │
│                  ▼           │         │           ▲                │
│  habit-widget-bridge (JS)    │         │           │ rerender       │
│                  │           │         │  HabitWidgetReceiver.kt    │
└──────────────────┼───────────┘         └───────────┼────────────────┘
                   │                                 │
                   ▼                                 │ broadcast
              ┌─────────────────┐                    │
              │ Kotlin module   │  send broadcast    │
              │ (saveHabits,    │ ───────────────────┘
              │  refreshWidget) │
              └────────┬────────┘
                       │ writes
                       ▼
       ┌────────────────────────────────────┐
       │  Android SharedPreferences         │
       │  file: habit_tracker_prefs         │
       │  key:  habits_data  (JSON string)  │
       └────────────────────────────────────┘
                       ▲ reads
                       │
              HabitWidget.kt on every render
```

Both the Expo app and the widget read/write the **same** SharedPreferences file, so a change in either place is reflected in the other within the next render cycle.

## Project layout

```
HabitTrack/
├── app/                               expo-router screens
│   ├── _layout.tsx                    Root stack navigator
│   ├── index.tsx                      Dashboard
│   ├── add.tsx                        New habit form
│   └── habit/[id].tsx                 Habit detail (full year heatmap)
├── components/
│   ├── HeatmapGrid.tsx                Reusable tile grid
│   ├── HabitCard.tsx                  Dashboard row
│   ├── EmojiPicker.tsx                Curated emoji grid
│   └── ColorPicker.tsx                Curated color swatches
├── lib/
│   ├── types.ts                       Habit / HabitInput types
│   ├── dates.ts                       Local-ISO date helpers
│   ├── streaks.ts                     Streak + completion %
│   ├── tiles.ts                       28/365 boolean tile arrays
│   ├── habitStore.ts                  CRUD on top of bridge
│   └── __tests__/                     Jest tests for pure logic
├── modules/
│   └── habit-widget-bridge/           Local Expo Module (JS↔Kotlin)
│       ├── expo-module.config.json
│       ├── package.json
│       ├── src/
│       │   ├── HabitWidgetBridgeModule.ts
│       │   └── index.ts
│       └── android/
│           ├── build.gradle
│           └── src/main/
│               ├── AndroidManifest.xml
│               └── java/expo/modules/habitwidgetbridge/
│                   └── HabitWidgetBridgeModule.kt
├── widget-source/                     Kotlin widget files (copied to android/ at prebuild)
│   ├── kotlin/
│   │   ├── HabitWidgetCommon.kt       Constants, JSON parser, date/streak utils
│   │   ├── HabitWidget.kt             Glance UI
│   │   ├── HabitWidgetReceiver.kt     AppWidget bridge + midnight alarm
│   │   └── LogHabitAction.kt          Toggle today's completion from widget
│   └── res/xml/
│       └── habit_widget_info.xml      AppWidgetProviderInfo
├── plugins/
│   └── withHabitWidget.js             Config plugin: copies widget-source/ into android/
│                                       on prebuild and patches manifest + gradle.
├── assets/                            Placeholder icon/splash (replace with real ones)
├── app.json
├── eas.json
├── package.json
├── tsconfig.json
├── metro.config.js
└── README.md
```

## Local development

You need:
- Node.js 22 LTS or 24 (Node 21 will fail expo-doctor)
- An Expo account (free) for EAS Build — no local Android Studio required
- A physical Android device (the widget needs the real home-screen launcher)

```bash
# 1. Install dependencies
npm install

# 2. Verify the project is healthy
npx expo-doctor          # should say "all checks passed"
npm run typecheck        # should produce 0 errors
npm test                 # runs the pure-logic Jest tests

# 3. Build the development client APK on EAS (cloud, ~10 min)
npm install -g eas-cli
eas login
eas build --profile development --platform android

# 4. Install the resulting APK on your Android device (link printed in terminal)

# 5. Start the dev server
npm run start
# Open the dev client app on your device — it'll connect to your computer
```

When you save a JS file the dev client reloads. Native (Kotlin) changes require a rebuild via step 3.

## Adding the widget to the home screen

1. Long-press an empty area of your home screen
2. Choose **Widgets**
3. Find **Habit Tracker** → drag onto the home screen
4. Resize as desired (recommended: full width, at least 3 rows tall so the list is scrollable)

## Production / sharing builds

```bash
eas build --profile production --platform android
```

EAS prints a download URL when finished. You can:
- Send that URL to friends and family directly
- Or download the `.apk` and host it anywhere (Google Drive, Dropbox, your own site)

To install: on the recipient's Android device, open the URL/APK in a browser. Android will prompt to allow "Install unknown apps" — they confirm once for the browser, then the APK installs like any normal app.

## Updating the app

For JS-only changes: re-run `eas build --profile production --platform android` and share the new APK. (For automatic OTA updates without rebuilding, set up `expo-updates` later.)

For widget/native changes: same — rebuild and reshare.

## Troubleshooting

| Problem | Fix |
|---|---|
| `expo-doctor` complains about Node engine | Upgrade to Node 22 LTS or 24 |
| `api.cache is not a function` | A leftover `babel.config.js` — delete it |
| Widget shows "No habits yet" but the app has habits | The bridge hasn't fired `refreshWidget` yet, or the device killed our process. Open the app once to re-trigger. |
| Widget tile doesn't toggle when tapped | The widget process may be stale — remove the widget and add it back after a fresh build |
| Build fails on EAS with Compose / Glance error | Make sure `widget-source/` and `plugins/withHabitWidget.js` are intact; re-run `npx expo prebuild --clean` locally to validate |

## What's intentionally NOT included

- **iOS support** — the brief is Android-only. `"platforms": ["android"]` in `app.json` prevents prebuild from generating an `ios/` folder.
- **Authentication / accounts** — fully local.
- **Cloud sync** — fully local.
- **Backend / API** — fully local.
- **Push notifications** — out of scope; can be added later via `expo-notifications`.
- **Theming / light mode** — single dark theme matches the spec.
