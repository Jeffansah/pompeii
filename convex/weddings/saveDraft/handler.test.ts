import { describe, expect, it } from "vitest";

import {
  COUPLE_NAME_MAX_LENGTH,
  parseClientError,
  PLACE_MAX_LENGTH,
  WEDDING_NAME_MAX_LENGTH,
} from "@pompeii/errors";
import { api, components } from "../../_generated/api";
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

describe("weddings/saveDraft", () => {
  it("refuses an unauthenticated caller", async () => {
    const t = makeConvexTest();
    await expectAppError(
      t.mutation(api.weddings.saveDraft.handler.saveDraft, {
        step: 1,
        name: "Amara & Tomi",
      }),
      "UNAUTHENTICATED",
    );
  });

  it("upserts the caller's draft and slugifies the name", async () => {
    const t = makeConvexTest();
    const asOwner = await signIn(t, "owner@example.com");

    await expect(
      asOwner.mutation(api.weddings.saveDraft.handler.saveDraft, {
        step: 1,
        name: "Amara & Tomi",
        slug: "hacked",
      }),
    ).resolves.toEqual({
      step: 1,
      name: "Amara & Tomi",
      slug: "amara-tomi",
    });

    await expect(
      asOwner.mutation(api.weddings.saveDraft.handler.saveDraft, {
        step: 2,
        coupleA: "Amara",
        coupleB: "Tomi",
      }),
    ).resolves.toEqual({
      step: 2,
      name: "Amara & Tomi",
      slug: "amara-tomi",
      coupleA: "Amara",
      coupleB: "Tomi",
    });

    await t.run(async (ctx) => {
      const drafts = await ctx.db.query("draftWeddings").take(2);
      expect(drafts).toHaveLength(1);
    });
  });

  it("does not insert a second draft when one already exists", async () => {
    const t = makeConvexTest();
    const asOwner = await signIn(t, "owner@example.com");
    await asOwner.mutation(api.weddings.saveDraft.handler.saveDraft, {
      step: 1,
      name: "Amara & Tomi",
    });

    await t.run(async (ctx) => {
      const existing = await ctx.db.query("draftWeddings").take(1);
      const draft = existing[0];
      if (draft === undefined) {
        throw new Error("Expected a draft");
      }
      await ctx.db.insert("draftWeddings", {
        userId: draft.userId,
        step: 1,
        name: "Second Draft",
      });
    });

    await expect(
      asOwner.mutation(api.weddings.saveDraft.handler.saveDraft, {
        step: 2,
        coupleA: "Amara",
        coupleB: "Tomi",
      }),
    ).resolves.toMatchObject({
      coupleA: "Amara",
      coupleB: "Tomi",
    });

    await t.run(async (ctx) => {
      const drafts = await ctx.db.query("draftWeddings").take(2);
      expect(drafts).toHaveLength(1);
      expect(drafts[0]?.coupleA).toBe("Amara");
    });
  });

  it("does not let another user write the owner's draft", async () => {
    const t = makeConvexTest();
    const asOwner = await signIn(t, "owner@example.com");
    const asOther = await signIn(t, "other@example.com");

    await asOwner.mutation(api.weddings.saveDraft.handler.saveDraft, {
      step: 1,
      name: "Amara & Tomi",
    });
    await asOther.mutation(api.weddings.saveDraft.handler.saveDraft, {
      step: 1,
      name: "Other Wedding",
    });

    await expect(
      asOwner.query(api.weddings.getDraft.handler.getDraft, {}),
    ).resolves.toEqual({
      step: 1,
      name: "Amara & Tomi",
      slug: "amara-tomi",
    });
    await expect(
      asOther.query(api.weddings.getDraft.handler.getDraft, {}),
    ).resolves.toEqual({
      step: 1,
      name: "Other Wedding",
      slug: "other-wedding",
    });
  });

  it("creates the app user if the auth trigger has not run yet", async () => {
    const t = makeConvexTest();
    const now = Date.now();
    const authUser = (await t.run(async (ctx) => {
      return await ctx.runMutation(components.betterAuth.adapter.create, {
        input: {
          model: "user",
          data: {
            createdAt: now,
            updatedAt: now,
            email: "late@example.com",
            emailVerified: true,
            name: "late@example.com",
          },
        },
      });
    })) as { _id: string };
    const session = (await t.run(async (ctx) => {
      return await ctx.runMutation(components.betterAuth.adapter.create, {
        input: {
          model: "session",
          data: {
            createdAt: now,
            updatedAt: now,
            expiresAt: now + 60 * 60 * 1000,
            token: "token-late@example.com",
            userId: authUser._id,
          },
        },
      });
    })) as { _id: string };

    await expect(
      t
        .withIdentity({
          subject: authUser._id,
          sessionId: session._id,
          issuer: "https://auth.example",
          tokenIdentifier: `https://auth.example|${authUser._id}`,
        })
        .mutation(api.weddings.saveDraft.handler.saveDraft, {
          step: 1,
          name: "Late Trigger",
        }),
    ).resolves.toMatchObject({
      step: 1,
      name: "Late Trigger",
      slug: "late-trigger",
    });
  });

  it("rejects an empty wedding name", async () => {
    const t = makeConvexTest();
    const asOwner = await signIn(t, "owner@example.com");
    await expectAppError(
      asOwner.mutation(api.weddings.saveDraft.handler.saveDraft, {
        step: 1,
        name: "   ",
      }),
      "WEDDINGS_CREATE_WEDDING_NAME_REQUIRED",
    );
  });

  it("rejects a wedding name that is too long", async () => {
    const t = makeConvexTest();
    const asOwner = await signIn(t, "owner@example.com");
    await expectAppError(
      asOwner.mutation(api.weddings.saveDraft.handler.saveDraft, {
        step: 1,
        name: "A".repeat(WEDDING_NAME_MAX_LENGTH + 1),
      }),
      "WEDDINGS_CREATE_WEDDING_NAME_TOO_LONG",
    );
  });

  it("rejects an empty first couple name", async () => {
    const t = makeConvexTest();
    const asOwner = await signIn(t, "owner@example.com");
    await expectAppError(
      asOwner.mutation(api.weddings.saveDraft.handler.saveDraft, {
        step: 2,
        coupleA: "   ",
        coupleB: "Tomi",
      }),
      "WEDDINGS_CREATE_WEDDING_COUPLE_A_REQUIRED",
    );
  });

  it("rejects an empty second couple name", async () => {
    const t = makeConvexTest();
    const asOwner = await signIn(t, "owner@example.com");
    await expectAppError(
      asOwner.mutation(api.weddings.saveDraft.handler.saveDraft, {
        step: 2,
        coupleA: "Amara",
        coupleB: "   ",
      }),
      "WEDDINGS_CREATE_WEDDING_COUPLE_B_REQUIRED",
    );
  });

  it("rejects a couple name that is too long", async () => {
    const t = makeConvexTest();
    const asOwner = await signIn(t, "owner@example.com");
    await expectAppError(
      asOwner.mutation(api.weddings.saveDraft.handler.saveDraft, {
        step: 2,
        coupleA: "A".repeat(COUPLE_NAME_MAX_LENGTH + 1),
        coupleB: "Tomi",
      }),
      "WEDDINGS_CREATE_WEDDING_COUPLE_NAME_TOO_LONG",
    );
  });

  it("rejects a malformed date", async () => {
    const t = makeConvexTest();
    const asOwner = await signIn(t, "owner@example.com");
    await expectAppError(
      asOwner.mutation(api.weddings.saveDraft.handler.saveDraft, {
        step: 3,
        date: "16/08/2026",
      }),
      "WEDDINGS_CREATE_WEDDING_DATE_INVALID",
    );
  });

  it("rejects a date in the past", async () => {
    const t = makeConvexTest();
    const asOwner = await signIn(t, "owner@example.com");
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const month = String(yesterday.getMonth() + 1).padStart(2, "0");
    const day = String(yesterday.getDate()).padStart(2, "0");
    await expectAppError(
      asOwner.mutation(api.weddings.saveDraft.handler.saveDraft, {
        step: 3,
        date: `${yesterday.getFullYear()}-${month}-${day}`,
      }),
      "WEDDINGS_CREATE_WEDDING_DATE_IN_PAST",
    );
  });

  it("rejects a city without a selected place", async () => {
    const t = makeConvexTest();
    const asOwner = await signIn(t, "owner@example.com");
    await expectAppError(
      asOwner.mutation(api.weddings.saveDraft.handler.saveDraft, {
        step: 4,
        city: "Accra",
      }),
      "WEDDINGS_CREATE_WEDDING_PLACE_REQUIRED",
    );
  });

  it("saves a selected place", async () => {
    const t = makeConvexTest();
    const asOwner = await signIn(t, "owner@example.com");
    await expect(
      asOwner.mutation(api.weddings.saveDraft.handler.saveDraft, {
        step: 4,
        city: "Accra",
        country: "Ghana",
        lat: 5.6037,
        lng: -0.187,
        placeId: "ChIJc6e3soSQ3w8R0XwZ9o7pBAQ",
      }),
    ).resolves.toMatchObject({
      step: 4,
      city: "Accra",
      country: "Ghana",
      lat: 5.6037,
      lng: -0.187,
      placeId: "ChIJc6e3soSQ3w8R0XwZ9o7pBAQ",
    });
  });

  it("rejects a city that is too long", async () => {
    const t = makeConvexTest();
    const asOwner = await signIn(t, "owner@example.com");
    await expectAppError(
      asOwner.mutation(api.weddings.saveDraft.handler.saveDraft, {
        step: 4,
        city: "A".repeat(PLACE_MAX_LENGTH + 1),
        country: "Ghana",
        lat: 5.6037,
        lng: -0.187,
        placeId: "ChIJc6e3soSQ3w8R0XwZ9o7pBAQ",
      }),
      "WEDDINGS_CREATE_WEDDING_CITY_TOO_LONG",
    );
  });

  it("rejects an invalid invite email", async () => {
    const t = makeConvexTest();
    const asOwner = await signIn(t, "owner@example.com");
    await expectAppError(
      asOwner.mutation(api.weddings.saveDraft.handler.saveDraft, {
        step: 5,
        inviteEmail: "not-an-email",
      }),
      "WEDDINGS_CREATE_WEDDING_INVITE_EMAIL_INVALID",
    );
  });
});
