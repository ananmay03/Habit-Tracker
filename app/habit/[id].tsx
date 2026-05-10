// app/habit/[id].tsx
// Detail screen for a single habit. Shows the full-year heatmap,
// streak/total stats, and lets the user toggle past dates by tapping tiles.
import React, { useCallback, useState } from "react";
import {
  ScrollView,
  View,
  Text,
  Pressable,
  Alert,
} from "react-native";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import type { Habit } from "@/lib/types";
import { getHabit, deleteHabit, toggleCompletion } from "@/lib/habitStore";
import {
  calculateStreak,
  totalCompletions,
  calculateMonthlyCompletionRate,
} from "@/lib/streaks";
import { HeatmapGrid } from "@/components/HeatmapGrid";

export default function HabitDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [habit, setHabit] = useState<Habit | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!id) return;
    const found = await getHabit(id);
    setHabit(found);
    setLoading(false);
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const handleTilePress = useCallback(
    async (date: string) => {
      if (!habit) return;
      await toggleCompletion(habit.id, date);
      await refresh();
    },
    [habit, refresh]
  );

  const handleDelete = useCallback(() => {
    if (!habit) return;
    Alert.alert(
      "Delete habit?",
      `"${habit.name}" and all its history will be removed.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deleteHabit(habit.id);
            router.back();
          },
        },
      ]
    );
  }, [habit, router]);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#12121f",
        }}
      >
        <Text style={{ color: "#7a7a8c" }}>Loading…</Text>
      </View>
    );
  }

  if (!habit) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#12121f",
        }}
      >
        <Text style={{ color: "#ffffff" }}>Habit not found</Text>
      </View>
    );
  }

  const streak = calculateStreak(habit.completedDates);
  const total = totalCompletions(habit.completedDates);
  const monthly = calculateMonthlyCompletionRate(habit.completedDates);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#12121f" }}
      contentContainerStyle={{ padding: 16, paddingBottom: 60 }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <Text style={{ fontSize: 40, marginRight: 14 }}>{habit.emoji}</Text>
        <View style={{ flex: 1 }}>
          <Text style={{ color: "#ffffff", fontSize: 22, fontWeight: "700" }}>
            {habit.name}
          </Text>
        </View>
        <View
          style={{
            width: 28,
            height: 28,
            borderRadius: 14,
            backgroundColor: habit.color,
          }}
        />
      </View>

      <View
        style={{
          flexDirection: "row",
          backgroundColor: "#1a1a2a",
          borderRadius: 16,
          padding: 16,
          marginBottom: 24,
        }}
      >
        <Stat label="Streak" value={`${streak}d`} />
        <Stat label="Total" value={`${total}`} />
        <Stat label="30-day" value={`${monthly}%`} />
      </View>

      <Text style={sectionLabel}>This year</Text>
      <Text style={{ color: "#7a7a8c", fontSize: 12, marginBottom: 14 }}>
        Tap any tile to log/unlog that day
      </Text>
      <View
        style={{
          backgroundColor: "#1a1a2a",
          borderRadius: 16,
          padding: 16,
          marginBottom: 24,
          alignItems: "center",
        }}
      >
        <HeatmapGrid
          completedDates={habit.completedDates}
          color={habit.color}
          tileCount={365}
          tileSize={11}
          tileGap={3}
          columns={20}
          onTilePress={handleTilePress}
        />
      </View>

      <Pressable
        onPress={handleDelete}
        style={{
          padding: 16,
          borderRadius: 12,
          alignItems: "center",
          borderWidth: 1,
          borderColor: "#E66B6B",
        }}
      >
        <Text style={{ color: "#E66B6B", fontSize: 15, fontWeight: "600" }}>
          Delete habit
        </Text>
      </Pressable>
    </ScrollView>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flex: 1, alignItems: "center" }}>
      <Text style={{ color: "#ffffff", fontSize: 22, fontWeight: "700" }}>
        {value}
      </Text>
      <Text
        style={{
          color: "#7a7a8c",
          fontSize: 11,
          textTransform: "uppercase",
          letterSpacing: 0.8,
          marginTop: 4,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

const sectionLabel = {
  color: "#9a9aac",
  fontSize: 13,
  fontWeight: "600" as const,
  textTransform: "uppercase" as const,
  letterSpacing: 0.8,
  marginBottom: 4,
};
