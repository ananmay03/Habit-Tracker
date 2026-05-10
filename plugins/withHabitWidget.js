// plugins/withHabitWidget.js
// Expo config plugin that injects the Kotlin widget source files,
// AndroidManifest.xml entries, and Gradle dependencies into the
// prebuild-generated android/ directory.
//
// This is what makes `expo prebuild` produce a working widget without
// needing the android/ folder to be hand-edited or committed to git.

const fs = require("fs");
const path = require("path");
const {
  withAndroidManifest,
  withProjectBuildGradle,
  withAppBuildGradle,
  withDangerousMod,
  withStringsXml,
  AndroidConfig,
} = require("expo/config-plugins");

const PACKAGE_NAME = "com.habittrack.app";
const PACKAGE_PATH = PACKAGE_NAME.replace(/\./g, "/"); // com/habittrack/app

// ---- 1. Copy Kotlin source files & res/xml into android/ ----
const withHabitWidgetSources = (config) =>
  withDangerousMod(config, [
    "android",
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const platformRoot = config.modRequest.platformProjectRoot;

      // Source files we ship in widget-source/
      const sourceKotlinDir = path.join(projectRoot, "widget-source", "kotlin");
      const sourceResXmlDir = path.join(
        projectRoot,
        "widget-source",
        "res",
        "xml"
      );

      // Destination: android/app/src/main/java/com/habittrack/app/widget/
      const destKotlinDir = path.join(
        platformRoot,
        "app",
        "src",
        "main",
        "java",
        ...PACKAGE_PATH.split("/"),
        "widget"
      );
      const destResXmlDir = path.join(
        platformRoot,
        "app",
        "src",
        "main",
        "res",
        "xml"
      );

      fs.mkdirSync(destKotlinDir, { recursive: true });
      fs.mkdirSync(destResXmlDir, { recursive: true });

      // Copy every .kt file
      for (const file of fs.readdirSync(sourceKotlinDir)) {
        if (file.endsWith(".kt")) {
          fs.copyFileSync(
            path.join(sourceKotlinDir, file),
            path.join(destKotlinDir, file)
          );
        }
      }

      // Copy every .xml file under res/xml/
      for (const file of fs.readdirSync(sourceResXmlDir)) {
        if (file.endsWith(".xml")) {
          fs.copyFileSync(
            path.join(sourceResXmlDir, file),
            path.join(destResXmlDir, file)
          );
        }
      }

      return config;
    },
  ]);

// ---- 2. Add string resource referenced by the widget XML ----
const withHabitWidgetStrings = (config) =>
  withStringsXml(config, (config) => {
    config.modResults = AndroidConfig.Strings.setStringItem(
      [
        {
          $: { name: "habit_widget_description", translatable: "false" },
          _: "Track your habits from your home screen",
        },
      ],
      config.modResults
    );
    return config;
  });

// ---- 3. Register the AppWidgetProvider receiver in AndroidManifest.xml ----
const withHabitWidgetManifest = (config) =>
  withAndroidManifest(config, (config) => {
    const application = AndroidConfig.Manifest.getMainApplicationOrThrow(
      config.modResults
    );

    // Avoid duplicate registration on re-runs
    application.receiver = application.receiver?.filter(
      (r) =>
        r.$["android:name"] !==
        `${PACKAGE_NAME}.widget.HabitWidgetReceiver`
    );
    if (!application.receiver) application.receiver = [];

    application.receiver.push({
      $: {
        "android:name": `${PACKAGE_NAME}.widget.HabitWidgetReceiver`,
        "android:exported": "true",
        "android:label": "Habit Tracker",
      },
      "intent-filter": [
        {
          action: [
            { $: { "android:name": "android.appwidget.action.APPWIDGET_UPDATE" } },
            { $: { "android:name": "android.intent.action.BOOT_COMPLETED" } },
            { $: { "android:name": `${PACKAGE_NAME}.action.WIDGET_REFRESH` } },
            { $: { "android:name": `${PACKAGE_NAME}.action.WIDGET_MIDNIGHT` } },
          ],
        },
      ],
      "meta-data": [
        {
          $: {
            "android:name": "android.appwidget.provider",
            "android:resource": "@xml/habit_widget_info",
          },
        },
      ],
    });

    return config;
  });

// ---- 4. Inject Glance & Compose dependencies into android/app/build.gradle ----
const withHabitWidgetAppGradle = (config) =>
  withAppBuildGradle(config, (config) => {
    const marker = "// HABIT_WIDGET_DEPS";
    if (config.modResults.contents.includes(marker)) {
      return config;
    }

    // The dependency block is closed with "}" near end of file.
    // We append our deps inside the dependencies { ... } block.
    const additions = `
    ${marker}
    implementation "androidx.glance:glance-appwidget:1.1.1"
    implementation "androidx.glance:glance-material3:1.1.1"
    implementation "androidx.compose.runtime:runtime:1.7.6"
    implementation "androidx.compose.ui:ui:1.7.6"
    implementation "androidx.compose.ui:ui-graphics:1.7.6"
    implementation "androidx.compose.foundation:foundation:1.7.6"
    implementation "org.jetbrains.kotlinx:kotlinx-coroutines-android:1.8.1"
`;

    // Insert before the LAST closing brace (which closes `dependencies { }`).
    const contents = config.modResults.contents;
    const lastDepsBlockIdx = contents.lastIndexOf("dependencies {");
    if (lastDepsBlockIdx === -1) {
      // Fall back: just append at the end with a fresh dependencies block
      config.modResults.contents =
        contents + `\ndependencies {\n${additions}\n}\n`;
      return config;
    }

    // Find the matching closing brace of that dependencies block
    let depth = 0;
    let i = contents.indexOf("{", lastDepsBlockIdx);
    let endIdx = -1;
    for (; i < contents.length; i++) {
      const ch = contents[i];
      if (ch === "{") depth++;
      else if (ch === "}") {
        depth--;
        if (depth === 0) {
          endIdx = i;
          break;
        }
      }
    }
    if (endIdx === -1) {
      config.modResults.contents = contents + `\ndependencies {\n${additions}\n}\n`;
      return config;
    }

    config.modResults.contents =
      contents.slice(0, endIdx) + additions + contents.slice(endIdx);
    return config;
  });

// ---- 5. Ensure Compose compiler plugin is enabled at the project level ----
const withHabitWidgetProjectGradle = (config) =>
  withProjectBuildGradle(config, (config) => {
    const marker = "// HABIT_WIDGET_COMPOSE_PLUGIN";
    if (config.modResults.contents.includes(marker)) return config;

    // The classpath block sits inside buildscript { dependencies { ... } }.
    const classpathLine = `        ${marker}\n        classpath("org.jetbrains.kotlin:kotlin-compose-compiler-gradle-plugin:\${kotlinVersion}")\n`;

    // Insert immediately after the existing "classpath" lines in buildscript.
    const contents = config.modResults.contents;
    const buildscriptIdx = contents.indexOf("buildscript {");
    if (buildscriptIdx === -1) return config;

    const depsIdx = contents.indexOf("dependencies {", buildscriptIdx);
    if (depsIdx === -1) return config;

    // Find the closing brace of buildscript's dependencies block
    let depth = 0;
    let i = contents.indexOf("{", depsIdx);
    let endIdx = -1;
    for (; i < contents.length; i++) {
      const ch = contents[i];
      if (ch === "{") depth++;
      else if (ch === "}") {
        depth--;
        if (depth === 0) {
          endIdx = i;
          break;
        }
      }
    }
    if (endIdx === -1) return config;

    config.modResults.contents =
      contents.slice(0, endIdx) + classpathLine + contents.slice(endIdx);
    return config;
  });

// ---- 6. Apply Compose plugin in app/build.gradle ----
const withComposePluginApply = (config) =>
  withAppBuildGradle(config, (config) => {
    const marker = "// HABIT_WIDGET_APPLY_COMPOSE";
    if (config.modResults.contents.includes(marker)) return config;

    const applyLine = `${marker}\napply plugin: "org.jetbrains.kotlin.plugin.compose"\n\n`;

    // Insert after the last `apply plugin:` line near the top of the file.
    const contents = config.modResults.contents;
    const applyRegex = /apply plugin:\s*["'][^"']+["']\s*\n/g;
    let lastMatch = null;
    let m;
    while ((m = applyRegex.exec(contents)) !== null) {
      lastMatch = m;
    }

    if (lastMatch) {
      const insertIdx = lastMatch.index + lastMatch[0].length;
      config.modResults.contents =
        contents.slice(0, insertIdx) + applyLine + contents.slice(insertIdx);
    } else {
      config.modResults.contents = applyLine + contents;
    }
    return config;
  });

// ---- 7. Enable Compose feature flag inside android { } ----
const withComposeFeature = (config) =>
  withAppBuildGradle(config, (config) => {
    const marker = "// HABIT_WIDGET_COMPOSE_FEATURE";
    if (config.modResults.contents.includes(marker)) return config;

    const block = `
    ${marker}
    buildFeatures {
        compose true
    }
`;

    const contents = config.modResults.contents;
    // Insert inside android { ... } block — find first occurrence of "android {".
    const androidIdx = contents.indexOf("android {");
    if (androidIdx === -1) return config;

    // Insert right after the "android {" line.
    const insertAfter = contents.indexOf("\n", androidIdx) + 1;
    config.modResults.contents =
      contents.slice(0, insertAfter) + block + contents.slice(insertAfter);

    return config;
  });

// ---- Compose everything ----
module.exports = function withHabitWidget(config) {
  config = withHabitWidgetSources(config);
  config = withHabitWidgetStrings(config);
  config = withHabitWidgetManifest(config);
  config = withHabitWidgetProjectGradle(config);
  config = withComposePluginApply(config);
  config = withComposeFeature(config);
  config = withHabitWidgetAppGradle(config);
  return config;
};
