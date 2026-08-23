import { describe, expect, it } from "vitest";

import { dayGreeting, daysToGo, daysToGoLabel, displayCoupleNames } from "./headline";

describe("displayCoupleNames", () => {
  it("joins the two names with an ampersand", () => {
    expect(displayCoupleNames("June", "Alex")).toBe("June & Alex");
  });

  it("trims each name", () => {
    expect(displayCoupleNames("  Amara  ", " Tomi")).toBe("Amara & Tomi");
  });
});

describe("dayGreeting", () => {
  it("says morning before noon", () => {
    expect(dayGreeting(new Date(2026, 7, 20, 8, 0, 0))).toBe("Good morning");
  });

  it("says afternoon from noon until 5", () => {
    expect(dayGreeting(new Date(2026, 7, 20, 14, 0, 0))).toBe(
      "Good afternoon",
    );
  });

  it("says evening from 5", () => {
    expect(dayGreeting(new Date(2026, 7, 20, 19, 0, 0))).toBe("Good evening");
  });
});

describe("daysToGo", () => {
  const now = new Date(2026, 7, 20, 15, 0, 0);

  it("counts calendar days from today to the wedding date", () => {
    expect(daysToGo("2026-08-30", now)).toBe(10);
  });

  it("is zero on the wedding day", () => {
    expect(daysToGo("2026-08-20", now)).toBe(0);
  });

  it("returns null for a malformed date", () => {
    expect(daysToGo("16/08/2026", now)).toBeNull();
  });
});

describe("daysToGoLabel", () => {
  it("singularizes one day", () => {
    expect(daysToGoLabel(1)).toBe("day to go");
  });

  it("keeps the plural otherwise", () => {
    expect(daysToGoLabel(0)).toBe("days to go");
    expect(daysToGoLabel(12)).toBe("days to go");
  });
});
