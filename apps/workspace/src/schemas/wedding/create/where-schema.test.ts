import { describe, expect, it } from "vitest";

import { AppErrorCode, getErrorMessage, PLACE_MAX_LENGTH } from "@pompeii/errors";

import { whereSchema } from "./where-schema";

const accra = {
  city: "Accra",
  country: "Ghana",
  lat: 5.6037,
  lng: -0.187,
  placeId: "ChIJc6e3soSQ3w8R0XwZ9o7pBAQ",
};

describe("whereSchema", () => {
  it("accepts a selected place", () => {
    expect(
      whereSchema.parse({
        city: "  Accra  ",
        country: "  Ghana  ",
        lat: accra.lat,
        lng: accra.lng,
        placeId: `  ${accra.placeId}  `,
      }),
    ).toEqual(accra);
  });

  it("rejects a missing place", () => {
    const parsed = whereSchema.safeParse({
      city: "",
      country: "",
      lat: 0,
      lng: 0,
      placeId: "",
    });
    expect(parsed.success).toBe(false);
    if (parsed.success) {
      return;
    }
    expect(parsed.error.issues[0]?.message).toBe(
      getErrorMessage(AppErrorCode.weddings.createWedding.PLACE_REQUIRED),
    );
  });

  it("rejects a city that is too long", () => {
    const parsed = whereSchema.safeParse({
      ...accra,
      city: "A".repeat(PLACE_MAX_LENGTH + 1),
    });
    expect(parsed.success).toBe(false);
    if (parsed.success) {
      return;
    }
    expect(parsed.error.issues[0]?.message).toBe(
      getErrorMessage(AppErrorCode.weddings.createWedding.CITY_TOO_LONG),
    );
  });

  it("rejects coordinates outside range", () => {
    const parsed = whereSchema.safeParse({
      ...accra,
      lat: 91,
    });
    expect(parsed.success).toBe(false);
    if (parsed.success) {
      return;
    }
    expect(parsed.error.issues[0]?.message).toBe(
      getErrorMessage(AppErrorCode.weddings.createWedding.COORDINATES_INVALID),
    );
  });
});
