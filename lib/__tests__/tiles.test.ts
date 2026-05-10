// lib/__tests__/tiles.test.ts
import {
  generateTiles,
  generateYearTiles,
  generateDatedYearTiles,
  TILE_COUNT,
} from "../tiles";

describe("generateTiles", () => {
  const TODAY = "2026-05-10";

  test("default length is 28", () => {
    expect(generateTiles([], TODAY)).toHaveLength(TILE_COUNT);
  });

  test("all false when no completions", () => {
    const tiles = generateTiles([], TODAY);
    expect(tiles.every((t) => t === false)).toBe(true);
  });

  test("last tile represents today", () => {
    const tiles = generateTiles(["2026-05-10"], TODAY);
    expect(tiles[tiles.length - 1]).toBe(true);
    expect(tiles.slice(0, -1).every((t) => t === false)).toBe(true);
  });

  test("first tile represents (today - 27)", () => {
    // 28 tiles, last is today (2026-05-10), so first is 2026-04-13.
    const tiles = generateTiles(["2026-04-13"], TODAY);
    expect(tiles[0]).toBe(true);
    expect(tiles.slice(1).every((t) => t === false)).toBe(true);
  });

  test("middle tile aligns correctly", () => {
    // Tile index 14 = 13 days before today's tile.
    // today (2026-05-10) - 13 days = 2026-04-27.
    const tiles = generateTiles(["2026-04-27"], TODAY);
    expect(tiles[14]).toBe(true);
    expect(tiles.filter((t) => t).length).toBe(1);
  });

  test("custom length supported", () => {
    expect(generateTiles([], TODAY, 10)).toHaveLength(10);
    expect(generateTiles([], TODAY, 1)).toHaveLength(1);
  });

  test("ignores dates outside the window", () => {
    expect(
      generateTiles(["2020-01-01", "1999-12-31"], TODAY).every(
        (t) => t === false
      )
    ).toBe(true);
  });
});

describe("generateYearTiles", () => {
  test("returns 365 tiles", () => {
    expect(generateYearTiles([], "2026-05-10")).toHaveLength(365);
  });
});

describe("generateDatedYearTiles", () => {
  test("returns 365 entries", () => {
    expect(generateDatedYearTiles([], "2026-05-10")).toHaveLength(365);
  });

  test("last entry is today", () => {
    const tiles = generateDatedYearTiles(["2026-05-10"], "2026-05-10");
    const last = tiles[tiles.length - 1];
    expect(last?.date).toBe("2026-05-10");
    expect(last?.done).toBe(true);
  });
});
