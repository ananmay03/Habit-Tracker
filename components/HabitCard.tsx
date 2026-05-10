// components/HabitCard.tsx
import React from "react";
import { View, Text, Pressable } from "react-native";
import { Link } from "expo-router";
import type { Habit } from "@/lib/types";
import { HeatmapGrid } from "./HeatmapGrid";
import { calculateStreak, totalCompletions } from "@/lib/streaks";

interface HabitCardProps {
  habit: Habit;
  onToggleToday: () => void;
}

export function HabitCard({ habit, onToggleToday }: HabitCardProps) {
  const streak = calculateStreak(habit.completedDates);
  const total = totalCompletions(habit.completedDates);

  return (
    <Link href={`/habit/${habit.id}` as any} asChild>
      <Pressable
        style={{
          backgroundColor: "#1a1a2a",
          borderRadius: 16,
          padding: 16,
          marginBottom: 12,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 14,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
            <Text style={{ fontSize: 26, marginRight: 10 }}>{habit.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text
                style={{ color: "#ffffff", fontSize: 16, fontWeight: "600" }}
                numberOfLines={1}
              >
                {habit.name}
              </Text>
              <Text style={{ color: "#7a7a8c", fontSize: 12, marginTop: 2 }}>
                🔥 {streak} day streak · {total} total
              </Text>
            </View>
          </View>
          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              onToggleToday();
            }}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: habit.color,
              alignItems: "center",
              justifyContent: "center",
            }}
            hitSlop={8}
          >
            <Text style={{ color: "#ffffff", fontSize: 20, fontWeight: "700" }}>
              ✓
            </Text>
          </Pressable>
        </View>
        <HeatmapGrid
          completedDates={habit.completedDates}
          color={habit.color}
          tileCount={28}
          tileSize={9}
          tileGap={2}
        />
      </Pressable>
    </Link>
  );
}
