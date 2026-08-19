import { afterEach, describe, expect, it, vi } from "vitest";

import { parseClientError } from "@pompeii/errors";
import { api } from "../../_generated/api";
import { makeConvexTest, signIn } from "../../test.setup";

async function expectAppError(promise: Promise<unknown>, code: string) {
  const error = await promise.then(
    () => {
      throw new Error(`Expected ${code}`);
    },
    (caught: unknown) => caught,
  );
  expect(parseClientError(error)?.code).toBe(code);
}

const accraDetails = {
  id: "ChIJc6e3soSQ3w8R0XwZ9o7pBAQ",
  location: { latitude: 5.6037, longitude: -0.187 },
  addressComponents: [
    { longText: "Accra", types: ["locality", "political"] },
    { longText: "Ghana", shortText: "GH", types: ["country", "political"] },
  ],
};

describe("places/details", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("refuses an unauthenticated caller", async () => {
    const t = makeConvexTest();
    await expectAppError(
      t.action(api.places.details.handler.details, {
        placeId: "ChIJc6e3soSQ3w8R0XwZ9o7pBAQ",
        sessionToken: "session",
      }),
      "UNAUTHENTICATED",
    );
  });

  it("returns city, country, and coordinates", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => accraDetails,
      }),
    );
    const t = makeConvexTest();
    const asOwner = await signIn(t, "owner@example.com");

    await expect(
      asOwner.action(api.places.details.handler.details, {
        placeId: "ChIJc6e3soSQ3w8R0XwZ9o7pBAQ",
        sessionToken: "session",
      }),
    ).resolves.toEqual({
      placeId: "ChIJc6e3soSQ3w8R0XwZ9o7pBAQ",
      city: "Accra",
      country: "Ghana",
      lat: 5.6037,
      lng: -0.187,
    });
  });
});
