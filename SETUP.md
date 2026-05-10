# Quick-start

## 1. Prerequisites

- **Node.js 22 LTS or 24** (Node 21 will fail expo-doctor)
- **Free Expo account** at https://expo.dev/signup
- **Android device** (the widget needs a real home-screen launcher; an emulator will work for the app but not for testing widget gestures)

Verify Node:
```powershell
node -v
# v22.x.x or v24.x.x — anything else, upgrade first
```

## 2. Install

```powershell
cd HabitTrack
npm install
```

## 3. Validate

```powershell
npx expo-doctor       # should report 18/18 (or 16/18 if you're offline)
npm run typecheck     # 0 errors
npm test              # 33 tests pass
```

## 4. Build a development APK on EAS (cloud)

```powershell
npm install -g eas-cli
eas login              # uses your expo.dev account
eas build --profile development --platform android
```

EAS prints a URL when finished (~10 min). Open it on your Android phone, install, then run:

```powershell
npm run start
```

The dev client app on your phone will connect to your computer.

## 5. Add the widget to your home screen

1. Long-press an empty area on your home screen
2. Choose **Widgets**
3. Find **Habit Tracker**, drag it onto the screen
4. Resize to taste — wider is better

## 6. Build a shareable APK for friends/family

```powershell
eas build --profile production --platform android
```

EAS prints a download URL. Send that link to anyone — they tap it, allow "Install unknown apps" once for their browser, and the APK installs.

---

## Common issues

| Error | Cause | Fix |
|-------|-------|-----|
| `JSON.parse Unexpected token "/"` | Pasted `// path` comment into a `.json` file | Remove the comment; JSON has no comment syntax |
| `api.cache is not a function` | Stale `babel.config.js` | Delete `babel.config.js` — SDK 55 doesn't need it |
| `EBADENGINE … unsupported engine` | Node 21 (EOL) | Upgrade to Node 22 LTS or 24 |
| `Field … should NOT have additional property 'minSdkVersion'` | Old `app.json` schema | These moved to `expo-build-properties` plugin (already done in this project) |
| `Skipping config plugin … Failed to resolve plugin for module` | Pointed `plugins:` at a local Expo Module instead of a config plugin | Fixed in this project — the Expo Module is auto-discovered, only the actual config plugin (`./plugins/withHabitWidget`) is in `plugins:` |
| Widget added but shows nothing | Open the app once after installing the widget — the first widget refresh is triggered by the app | — |

## What each command does

| Command | What it does |
|---------|-------------|
| `npm install` | Pulls all JS dependencies |
| `npm run typecheck` | Runs `tsc --noEmit` to catch type errors |
| `npm test` | Runs Jest on the pure-logic tests in `lib/__tests__/` |
| `npx expo-doctor` | Validates SDK versions, plugin config, gitignore patterns |
| `npx expo prebuild --platform android --clean` | Regenerates `android/` from `app.json` + plugins (rarely needed locally — EAS does this in the cloud) |
| `eas build --profile development --platform android` | Cloud-builds a development client APK with debugging hooks |
| `eas build --profile production --platform android` | Cloud-builds a release APK (signed) for distribution |
| `npm run start` | Starts the Metro dev server |
