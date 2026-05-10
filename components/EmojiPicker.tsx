// components/EmojiPicker.tsx
// Curated emoji grid. Building our own avoids brittle third-party pickers
// and keeps the picker focused on common habit-relevant emojis.
import React from "react";
import { View, Pressable, Text } from "react-native";

const HABIT_EMOJIS = [
  "💪", "🏋️", "🏃", "🚴", "🧘", "⛹️", "🤸", "🥋",
  "📚", "📖", "✍️", "🎓", "💻", "🎨", "🎵", "🎸",
  "💧", "🥗", "🍎", "☕", "🚭", "💊", "😴", "🛌",
  "🧹", "🧺", "🌱", "🌳", "🐕", "🐈", "❤️", "💖",
  "🙏", "🧠", "💡", "🎯", "✅", "⭐", "🔥", "✨",
  "📵", "💬", "💰", "💼", "🌅", "🌙", "🦷", "🚿",
];

interface EmojiPickerProps {
  selected: string;
  onSelect: (emoji: string) => void;
}

export function EmojiPicker({ selected, onSelect }: EmojiPickerProps) {
  return (
    <View
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
      }}
    >
      {HABIT_EMOJIS.map((emoji) => {
        const isSelected = emoji === selected;
        return (
          <Pressable
            key={emoji}
            onPress={() => onSelect(emoji)}
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              backgroundColor: isSelected ? "#2a2a3d" : "#1a1a2a",
              borderWidth: isSelected ? 2 : 0,
              borderColor: "#7F77DD",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontSize: 22 }}>{emoji}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
