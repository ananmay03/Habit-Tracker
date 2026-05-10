// modules/habit-widget-bridge/src/HabitWidgetBridgeModule.ts
import { NativeModule, requireNativeModule } from "expo";

// This declaration mirrors the Kotlin Module's exposed functions.
// The string passed to requireNativeModule must match the Name() in Kotlin.
declare class HabitWidgetBridgeModule extends NativeModule {
  saveHabits(habitsJson: string): Promise<void>;
  loadHabits(): Promise<string>;
  refreshWidget(): Promise<void>;
}

export default requireNativeModule<HabitWidgetBridgeModule>("HabitWidgetBridge");
