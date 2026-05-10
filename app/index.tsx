// app/index.tsx
// Dashboard: lists all habits, shows their 28-day heatmap previews,
// lets you toggle today's completion inline, and links to the detail screen.
import React, { useCallback, useState } from "react";
import {
  ScrollView,
  View,
  Text,
  Pressable,
  RefreshControl,
} from "react-native";
import { Link, useFocusEffect, useRouter } from "expo-router";
import type { Habit } from "@/lib/types";
import { loadHabits, toggleCompletion } from "@/lib/habitStore";
import { HabitCard } from "@/components/HabitCard";

export default function Dashboard() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const next = await loadHabits();
      setHabits(next);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, []);

  // Reload whenever the screen gains focus — covers returning from
  // add/detail screens with new data.
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const handleToggle = useCallback(
    async (id: string) => {
      await toggleCompletion(id);
      await refresh();
    },
    [refresh]
  );

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

  return (
    <View style={{ flex: 1, backgroundColor: "#12121f" }}>
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor="#7F77DD"
          />
        }
      >
        {habits.length === 0 ? (
          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: 80,
            }}
          >
            <Text style={{ fontSize: 48, marginBottom: 16 }}>✨</Text>
            <Text
              style={{
                color: "#ffffff",
                fontSize: 18,
                fontWeight: "600",
                marginBottom: 6,
              }}
            >
              No habits yet
            </Text>
            <Text style={{ color: "#7a7a8c", marginBottom: 24 }}>
              Tap + to add your first one
            </Text>
          </View>
        ) : (
          habits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              onToggleToday={() => handleToggle(habit.id)}
            />
          ))
        )}
      </ScrollView>

      <Link href="/add" asChild>
        <Pressable
          style={{
            position: "absolute",
            right: 24,
            bottom: 28,
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: "#7F77DD",
            alignItems: "center",
            justifyContent: "center",
            shadowColor: "#000",
            shadowOpacity: 0.3,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 4 },
            elevation: 8,
          }}
        >
          <Text style={{ color: "#ffffff", fontSize: 30, fontWeight: "300" }}>
            +
          </Text>
        </Pressable>
      </Link>
    </View>
  );
}
