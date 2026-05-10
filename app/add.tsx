// app/add.tsx
import React, { useState } from "react";
import {
  ScrollView,
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { addHabit } from "@/lib/habitStore";
import { EmojiPicker } from "@/components/EmojiPicker";
import { ColorPicker, HABIT_COLORS } from "@/components/ColorPicker";

export default function AddHabitScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("💪");
  const [color, setColor] = useState<string>(HABIT_COLORS[0] ?? "#7F77DD");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const trimmed = name.trim();
    if (trimmed.length === 0) {
      Alert.alert("Name required", "Please give your habit a name.");
      return;
    }
    setSaving(true);
    try {
      await addHabit({ name: trimmed, emoji, color });
      router.back();
    } catch (err) {
      Alert.alert("Couldn't save", String(err));
      setSaving(false);
    }
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#12121f" }}
      contentContainerStyle={{ padding: 16, paddingBottom: 60 }}
    >
      <Text style={sectionLabel}>Name</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="e.g. Drink water"
        placeholderTextColor="#5a5a6c"
        style={{
          backgroundColor: "#1a1a2a",
          color: "#ffffff",
          fontSize: 16,
          padding: 14,
          borderRadius: 12,
          marginBottom: 24,
        }}
      />

      <Text style={sectionLabel}>Icon</Text>
      <View style={{ marginBottom: 24 }}>
        <EmojiPicker selected={emoji} onSelect={setEmoji} />
      </View>

      <Text style={sectionLabel}>Color</Text>
      <View style={{ marginBottom: 32 }}>
        <ColorPicker selected={color} onSelect={setColor} />
      </View>

      <Text style={sectionLabel}>Preview</Text>
      <View
        style={{
          backgroundColor: "#1a1a2a",
          borderRadius: 16,
          padding: 16,
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 32,
        }}
      >
        <Text style={{ fontSize: 26, marginRight: 10 }}>{emoji}</Text>
        <Text style={{ color: "#ffffff", fontSize: 16, fontWeight: "600", flex: 1 }}>
          {name.trim() || "Your habit"}
        </Text>
        <View
          style={{
            width: 30,
            height: 30,
            borderRadius: 15,
            backgroundColor: color,
          }}
        />
      </View>

      <Pressable
        onPress={handleSave}
        disabled={saving}
        style={{
          backgroundColor: saving ? "#5a5670" : "#7F77DD",
          padding: 16,
          borderRadius: 12,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#ffffff", fontSize: 16, fontWeight: "700" }}>
          {saving ? "Saving…" : "Create habit"}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const sectionLabel = {
  color: "#9a9aac",
  fontSize: 13,
  fontWeight: "600" as const,
  textTransform: "uppercase" as const,
  letterSpacing: 0.8,
  marginBottom: 10,
};
