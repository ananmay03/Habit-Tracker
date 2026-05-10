// components/HeatmapGrid.tsx
// Reusable heatmap grid: shows the last N days as colored tiles.
// Used in two places:
//   1. Dashboard — small 28-tile preview per habit
//   2. Habit Detail — full 365-tile year view with tap-to-toggle past dates
import React from "react";
import { View, Pressable } from "react-native";
import { generateDatedYearTiles, generateTiles } from "@/lib/tiles";

interface HeatmapGridProps {
  /** Habit completion dates */
  completedDates: string[];
  /** The habit's color (used for filled tiles) */
  color: string;
  /** Number of tiles to show. 28 = 4 weeks, 365 = year */
  tileCount?: number;
  /** Tile dimensions (square) */
  tileSize?: number;
  /** Gap between tiles */
  tileGap?: number;
  /** Tiles per row when wrapped (year view). If omitted, no wrapping. */
  columns?: number;
  /** If provided, tiles become tappable and call this with the tile's date */
  onTilePress?: (date: string) => void;
  /** "today" override for tests */
  today?: string;
}

const EMPTY_TILE_COLOR = "#252535";

export function HeatmapGrid({
  completedDates,
  color,
  tileCount = 28,
  tileSize = 9,
  tileGap = 2,
  columns,
  onTilePress,
  today,
}: HeatmapGridProps) {
  // For year view we need date metadata so taps know which day they hit.
  // For 28-tile view we can use the lighter boolean-only function.
  if (onTilePress || (columns && tileCount > 28)) {
    const datedTiles = generateDatedYearTiles(completedDates, today).slice(
      -tileCount
    );
    return (
      <View
        style={{
          flexDirection: "row",
          flexWrap: columns ? "wrap" : "nowrap",
          width: columns
            ? columns * (tileSize + tileGap)
            : tileCount * (tileSize + tileGap),
          gap: tileGap,
        }}
      >
        {datedTiles.map((tile) => (
          <Pressable
            key={tile.date}
            onPress={onTilePress ? () => onTilePress(tile.date) : undefined}
            style={{
              width: tileSize,
              height: tileSize,
              borderRadius: 2,
              backgroundColor: tile.done ? color : EMPTY_TILE_COLOR,
            }}
          />
        ))}
      </View>
    );
  }

  // Lightweight non-interactive path
  const tiles = generateTiles(completedDates, today, tileCount);
  return (
    <View style={{ flexDirection: "row", gap: tileGap }}>
      {tiles.map((done, i) => (
        <View
          key={i}
          style={{
            width: tileSize,
            height: tileSize,
            borderRadius: 2,
            backgroundColor: done ? color : EMPTY_TILE_COLOR,
          }}
        />
      ))}
    </View>
  );
}
