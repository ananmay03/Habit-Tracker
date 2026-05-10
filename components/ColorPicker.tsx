// components/ColorPicker.tsx
// Curated set of habit colors. Chosen to look good on the dark background
// and to be visually distinguishable on the small 9dp widget tiles.
import React from "react";
import { View, Pressable } from "react-native";

export const HABIT_COLORS = [
  "#7F77DD", // soft purple (default)
  "#56C271", // green
  "#E66B6B", // red/coral
  "#F2A33A", // orange
  "#3FB7E5", // sky blue
  "#E55BC8", // magenta
  "#F2D43A", // yellow
  "#5BD6BC", // teal
  "#A571E5", // violet
  "#FF8B5C", // peach
  "#6B82E5", // indigo
  "#9CCB5C", // lime
];

interface ColorPickerProps {
  selected: string;
  onSelect: (color: string) => void;
}

export function ColorPicker({ selected, onSelect }: ColorPickerProps) {
  return (
    <View
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
      }}
    >
      {HABIT_COLORS.map((color) => {
        const isSelected = color === selected;
        return (
          <Pressable
            key={color}
            onPress={() => onSelect(color)}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: color,
              borderWidth: isSelected ? 3 : 0,
              borderColor: "#ffffff",
            }}
          />
        );
      })}
    </View>
  );
}
