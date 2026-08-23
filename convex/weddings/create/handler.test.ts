import { afterEach, describe, expect, it, vi } from "vitest";

import { parseClientError } from "@pompeii/errors";
import { api } from "../../_generated/api";
import { makeConvexTest, signIn } from "../../test.setup";
import { invites } from "../lib/invites";

async function expectAppError(promise: Promise<unknown>, code: string) {
  const error = await promise.then(
    () => {
      throw new Error(`Expected ${code}`);
    },
    (caught: unknown) => caught,
  );
  expect(parseClientError(error)?.code).toBe(code);
}

async function saveReadyDraft(
  asUser: Awaited<ReturnType<typeof signIn>>,
  extra: {
    date?: string;
    city?: string;
    country?: string;
    lat?: number;
    lng?: number;
    placeId?: string;
    inviteEmail?: string;
  } = {},
) {
  await asUser.mutation(api.weddings.saveDraft.handler.saveDraft, {
    step: 1,
    name: "Amara & Tomi",
  });
  await asUser.mutation(api.weddings.saveDraft.handler.saveDraft, {
    step: 2,
    coupleA: "Amara",
    coupleB: "Tomi",
  });
  if (extra.date !== undefined) {
    await asUser.mutation(api.weddings.saveDraft.handler.saveDraft, {
      step: 3,
      date: extra.date,
    });
  }
  if (
    extra.city !== undefined &&
    extra.country !== undefined &&
    extra.lat !== undefined &&
    extra.lng !== undefined &&
    extra.placeId !== undefined
  ) {
    await asUser.mutation(api.weddings.saveDraft.handler.saveDraft, {
      step: 4,
      city: extra.city,
      country: extra.country,
      lat: extra.lat,
      lng: extra.lng,
      placeId: extra.placeId,
    });
  }
  if (extra.inviteEmail !== undefined) {
    await asUser.mutation(api.weddings.saveDraft.handler.saveDraft, {
      step: 5,
      inviteEmail: extra.inviteEmail,
    });
  }
}

describe("weddings/create", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("refuses an unauthenticated caller", async () => {
    const t = makeConvexTest();
    await expectAppError(
      t.mutation(api.weddings.create.handler.create, {}),
      "UNAUTHENTICATED",
    );
  });

  it("creates the wedding from the draft and deletes the draft", async () => {
    const t = makeConvexTest();
    const asOwner = await signIn(t, "owner@example.com");
    await saveReadyDraft(asOwner, {
      date: "2026-12-24",
      city: "Accra",
      country: "Ghana",
      lat: 5.6037,
      lng: -0.187,
      placeId: "ChIJc6e3soSQ3w8R0XwZ9o7pBAQ",
    });

    await expect(
      asOwner.mutation(api.weddings.create.handler.create, {}),
    ).resolves.toEqual({ slug: "amara-tomi" });

    await expect(
      asOwner.query(api.weddings.getDraft.handler.getDraft, {}),
    ).resolves.toBeNull();

    await t.run(async (ctx) => {
      const wedding = await ctx.db
        .query("weddings")
        .withIndex("by_slug", (q) => q.eq("slug", "amara-tomi"))
        .unique();
      expect(wedding).toMatchObject({
        name: "Amara & Tomi",
        slug: "amara-tomi",
        date: "2026-12-24",
        location: {
          city: "Accra",
          country: "Ghana",
          lat: 5.6037,
          lng: -0.187,
          placeId: "ChIJc6e3soSQ3w8R0XwZ9o7pBAQ",
        },
      });
      expect(wedding?.couple[0]?.id).not.toBeNull();
      expect(wedding?.couple[0]?.name).toBe("Amara");
      expect(wedding?.couple[1]?.id).toBeNull();
      expect(wedding?.couple[1]?.name).toBe("Tomi");
      if (wedding === null) {
        throw new Error("Expected a wedding");
      }

      const members = await ctx.db
        .query("weddingMembers")
        .withIndex("by_weddingId", (q) => q.eq("weddingId", wedding._id))
        .collect();
      expect(members).toHaveLength(1);
      expect(members[0]?.userId).toBe(wedding.couple[0]?.id);
      expect(members[0]?.role).toBe("couple");
      expect(members[0]?.displayName).toBe("Amara");
    });

    await expect(
      asOwner.query(api.weddings.getHomeState.handler.getHomeState, {}),
    ).resolves.toEqual({
      destination: "workspace",
      slug: "amara-tomi",
    });
  });

  it("omits location when the draft skipped where", async () => {
    const t = makeConvexTest();
    const asOwner = await signIn(t, "owner@example.com");
    await saveReadyDraft(asOwner);

    await asOwner.mutation(api.weddings.create.handler.create, {});

    await t.run(async (ctx) => {
      const wedding = await ctx.db
        .query("weddings")
        .withIndex("by_slug", (q) => q.eq("slug", "amara-tomi"))
        .unique();
      expect(wedding?.location).toBeUndefined();
      expect(wedding?.date).toBeUndefined();
    });
  });

  it("suffixes a colliding slug", async () => {
    const t = makeConvexTest();
    const asOwner = await signIn(t, "owner@example.com");
    const asOther = await signIn(t, "other@example.com");
    await saveReadyDraft(asOwner);
    await saveReadyDraft(asOther);

    await expect(
      asOwner.mutation(api.weddings.create.handler.create, {}),
    ).resolves.toEqual({ slug: "amara-tomi" });
    await expect(
      asOther.mutation(api.weddings.create.handler.create, {}),
    ).resolves.toEqual({ slug: "amara-tomi-2" });
  });

  it("does not issue an invite when the draft skipped invite", async () => {
    const t = makeConvexTest();
    const asOwner = await signIn(t, "owner@example.com");
    await saveReadyDraft(asOwner);

    await asOwner.mutation(api.weddings.create.handler.create, {});

    await t.run(async (ctx) => {
      const wedding = await ctx.db
        .query("weddings")
        .withIndex("by_slug", (q) => q.eq("slug", "amara-tomi"))
        .unique();
      if (wedding === null) {
        throw new Error("Expected a wedding");
      }
      const pending = await invites.listPending(ctx, wedding._id, {
        numItems: 10,
        cursor: null,
      });
      expect(pending.page).toHaveLength(0);
    });
  });

  it("issues a couple invite and logs the delivery URL", async () => {
    const t = makeConvexTest();
    const asOwner = await signIn(t, "owner@example.com");
    const info = vi.spyOn(console, "info").mockImplementation(() => {});
    await saveReadyDraft(asOwner, { inviteEmail: "partner@example.com" });

    await asOwner.mutation(api.weddings.create.handler.create, {});
    vi.useFakeTimers();
    try {
      await t.finishAllScheduledFunctions(vi.runAllTimers);
    } finally {
      vi.useRealTimers();
    }

    await t.run(async (ctx) => {
      const wedding = await ctx.db
        .query("weddings")
        .withIndex("by_slug", (q) => q.eq("slug", "amara-tomi"))
        .unique();
      if (wedding === null) {
        throw new Error("Expected a wedding");
      }
      const pending = await invites.listPending(ctx, wedding._id, {
        numItems: 10,
        cursor: null,
      });
      expect(pending.page).toHaveLength(1);
      expect(pending.page[0]?.role).toBe("couple");
      expect(pending.page[0]?.payload).toEqual({
        email: "partner@example.com",
      });
    });

    expect(
      info.mock.calls.some(
        (call) =>
          String(call[0]).includes("partner@example.com") &&
          String(call[0]).includes("/amara-tomi/invite/"),
      ),
    ).toBe(true);
  });

  it("rejects a draft that is missing the couple names", async () => {
    const t = makeConvexTest();
    const asOwner = await signIn(t, "owner@example.com");
    await asOwner.mutation(api.weddings.saveDraft.handler.saveDraft, {
      step: 1,
      name: "Amara & Tomi",
    });
    await expectAppError(
      asOwner.mutation(api.weddings.create.handler.create, {}),
      "WEDDINGS_CREATE_WEDDING_COUPLE_A_REQUIRED",
    );
  });
});
