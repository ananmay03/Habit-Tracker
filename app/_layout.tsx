// app/_layout.tsx
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "#12121f" },
          headerTintColor: "#ffffff",
          headerShadowVisible: false,
          contentStyle: { backgroundColor: "#12121f" },
        }}
      >
        <Stack.Screen name="index" options={{ title: "Habits" }} />
        <Stack.Screen name="add" options={{ title: "New habit", presentation: "modal" }} />
        <Stack.Screen name="habit/[id]" options={{ title: "" }} />
      </Stack>
    </GestureHandlerRootView>
  );
}
