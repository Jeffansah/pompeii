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

const accraPrediction = {
  suggestions: [
    {
      placePrediction: {
        placeId: "ChIJc6e3soSQ3w8R0XwZ9o7pBAQ",
        text: { text: "Accra, Ghana" },
        structuredFormat: {
          mainText: { text: "Accra" },
          secondaryText: { text: "Ghana" },
        },
      },
    },
  ],
};

describe("places/autocomplete", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("refuses an unauthenticated caller", async () => {
    const t = makeConvexTest();
    await expectAppError(
      t.action(api.places.autocomplete.handler.autocomplete, {
        input: "Accra",
        sessionToken: "session",
      }),
      "UNAUTHENTICATED",
    );
  });

  it("returns mapped city suggestions", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => accraPrediction,
    });
    vi.stubGlobal("fetch", fetchMock);
    const t = makeConvexTest();
    const asOwner = await signIn(t, "owner@example.com");

    await expect(
      asOwner.action(api.places.autocomplete.handler.autocomplete, {
        input: "Accra",
        sessionToken: "session",
      }),
    ).resolves.toEqual({
      suggestions: [
        {
          placeId: "ChIJc6e3soSQ3w8R0XwZ9o7pBAQ",
          label: "Accra, Ghana",
          mainText: "Accra",
          secondaryText: "Ghana",
        },
      ],
    });
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it("returns an empty list for a short query without calling Google", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const t = makeConvexTest();
    const asOwner = await signIn(t, "owner@example.com");

    await expect(
      asOwner.action(api.places.autocomplete.handler.autocomplete, {
        input: "A",
        sessionToken: "session",
      }),
    ).resolves.toEqual({ suggestions: [] });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rate limits repeated lookups", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => accraPrediction,
    });
    vi.stubGlobal("fetch", fetchMock);
    const t = makeConvexTest();
    const asOwner = await signIn(t, "owner@example.com");

    for (let index = 0; index < 5; index += 1) {
      await asOwner.action(api.places.autocomplete.handler.autocomplete, {
        input: "Accra",
        sessionToken: "session",
      });
    }

    await expectAppError(
      asOwner.action(api.places.autocomplete.handler.autocomplete, {
        input: "Accra",
        sessionToken: "session",
      }),
      "PLACES_RATE_LIMITED",
    );
  });
});
