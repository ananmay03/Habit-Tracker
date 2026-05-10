// lib/__tests__/dates.test.ts
import {
  addDays,
  subtractDays,
  daysBetween,
  toISODate,
  fromISODate,
} from "../dates";

describe("addDays", () => {
  test("adds days within a month", () => {
    expect(addDays("2026-05-10", 3)).toBe("2026-05-13");
  });

  test("crosses month boundary forward", () => {
    expect(addDays("2026-05-30", 3)).toBe("2026-06-02");
  });

  test("crosses year boundary forward", () => {
    expect(addDays("2026-12-30", 3)).toBe("2027-01-02");
  });

  test("handles negative days as subtraction", () => {
    expect(addDays("2026-05-10", -3)).toBe("2026-05-07");
  });

  test("handles leap year February correctly", () => {
    expect(addDays("2024-02-28", 1)).toBe("2024-02-29");
    expect(addDays("2024-02-29", 1)).toBe("2024-03-01");
  });

  test("non-leap year February has 28 days", () => {
    expect(addDays("2026-02-28", 1)).toBe("2026-03-01");
  });
});

describe("subtractDays", () => {
  test("subtracts within a month", () => {
    expect(subtractDays("2026-05-10", 3)).toBe("2026-05-07");
  });

  test("crosses month boundary backward", () => {
    expect(subtractDays("2026-05-02", 3)).toBe("2026-04-29");
  });
});

describe("daysBetween", () => {
  test("positive for forward direction", () => {
    expect(daysBetween("2026-05-01", "2026-05-10")).toBe(9);
  });

  test("negative for backward direction", () => {
    expect(daysBetween("2026-05-10", "2026-05-01")).toBe(-9);
  });

  test("zero for same date", () => {
    expect(daysBetween("2026-05-10", "2026-05-10")).toBe(0);
  });
});

describe("toISODate / fromISODate", () => {
  test("roundtrips a known date", () => {
    expect(toISODate(fromISODate("2026-05-10"))).toBe("2026-05-10");
  });
});
