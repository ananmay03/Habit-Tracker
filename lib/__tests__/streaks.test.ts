// lib/__tests__/streaks.test.ts
import {
  calculateStreak,
  calculateMonthlyCompletionRate,
  totalCompletions,
} from "../streaks";

describe("calculateStreak", () => {
  const TODAY = "2026-05-10";

  test("returns 0 for empty completion list", () => {
    expect(calculateStreak([], TODAY)).toBe(0);
  });

  test("returns 1 when only today is done", () => {
    expect(calculateStreak(["2026-05-10"], TODAY)).toBe(1);
  });

  test("returns full streak ending today", () => {
    expect(
      calculateStreak(["2026-05-08", "2026-05-09", "2026-05-10"], TODAY)
    ).toBe(3);
  });

  test("returns full streak ending yesterday (grace period)", () => {
    expect(
      calculateStreak(["2026-05-07", "2026-05-08", "2026-05-09"], TODAY)
    ).toBe(3);
  });

  test("returns 0 when most recent completion is older than yesterday", () => {
    expect(
      calculateStreak(["2026-05-06", "2026-05-07", "2026-05-08"], TODAY)
    ).toBe(0);
  });

  test("only counts the trailing run, not earlier runs", () => {
    expect(
      calculateStreak(
        ["2026-05-01", "2026-05-02", "2026-05-09", "2026-05-10"],
        TODAY
      )
    ).toBe(2);
  });

  test("handles unsorted dates", () => {
    expect(
      calculateStreak(["2026-05-10", "2026-05-08", "2026-05-09"], TODAY)
    ).toBe(3);
  });

  test("handles duplicate dates gracefully", () => {
    expect(
      calculateStreak(["2026-05-10", "2026-05-10", "2026-05-09"], TODAY)
    ).toBe(2);
  });
});

describe("calculateMonthlyCompletionRate", () => {
  const TODAY = "2026-05-10";

  test("returns 0 for empty list", () => {
    expect(calculateMonthlyCompletionRate([], TODAY)).toBe(0);
  });

  test("ignores dates outside the 30-day window", () => {
    expect(
      calculateMonthlyCompletionRate(["2025-01-01", "2026-05-10"], TODAY)
    ).toBe(Math.round((1 / 30) * 100));
  });
});

describe("totalCompletions", () => {
  test("counts unique days only", () => {
    expect(totalCompletions(["2026-05-01", "2026-05-01", "2026-05-02"])).toBe(2);
  });
});
