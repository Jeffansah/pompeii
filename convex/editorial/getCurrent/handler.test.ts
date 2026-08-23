import { describe, expect, it } from "vitest";

import { parseClientError } from "@pompeii/errors";
import { api } from "../../_generated/api";
import { extraSession, makeConvexTest, signIn } from "../../test.setup";

async function createWedding(asUser: Awaited<ReturnType<typeof signIn>>) {
  await asUser.mutation(api.weddings.saveDraft.handler.saveDraft, {
    step: 1,
    name: "Amara & Tomi",
  });
  await asUser.mutation(api.weddings.saveDraft.handler.saveDraft, {
    step: 2,
    coupleA: "Amara",
    coupleB: "Tomi",
  });
  await asUser.mutation(api.weddings.create.handler.create, {});
}

async function expectAppError(promise: Promise<unknown>, code: string) {
  const error = await promise.then(
    () => {
      throw new Error(`Expected ${code}`);
    },
    (caught: unknown) => caught,
  );
  expect(parseClientError(error)?.code).toBe(code);
}

describe("editorial/getCurrent", () => {
  it("refuses an unauthenticated caller", async () => {
    const t = makeConvexTest();
    const weddingId = await t.run((ctx) =>
      ctx.db.insert("weddings", {
        name: "Amara & Tomi",
        slug: "amara-tomi",
        couple: [
          { id: null, name: "Amara" },
          { id: null, name: "Tomi" },
        ],
      }),
    );
    await expectAppError(
      t.query(api.editorial.getCurrent.handler.getCurrent, {
        weddingId,
        day: "2026-08-21",
      }),
      "UNAUTHENTICATED",
    );
  });

  it("returns a paired card for a workspace member", async () => {
    const t = makeConvexTest();
    const asOwner = await signIn(t, "owner@example.com");
    await createWedding(asOwner);
    await t.run((ctx) =>
      ctx.db.insert("overviewPosterCards", {
        stableKey: "test-card",
        active: true,
        sortOrder: 1,
        imageKey: "overview/test-card.jpg",
        imageSourceUrl: "https://example.com/test-card.jpg",
        imageAlt: "A test wedding scene",
        imageCreator: "Test creator",
        imageLicense: "Test license",
        caption: "A test scene",
        locationCity: "Bath",
        locationCountry: "United Kingdom",
        quote: "A test quote.",
        author: "Test author",
        sourceTitle: "Test source",
        sourceUrl: "https://example.com/test-source",
      }),
    );
    const weddingId = await t.run(
      async (ctx) => (await ctx.db.query("weddings").unique())!._id,
    );

    await expect(
      asOwner.query(api.editorial.getCurrent.handler.getCurrent, {
        weddingId,
        day: "2026-08-21",
      }),
    ).resolves.toMatchObject({
      stableKey: expect.any(String),
      imageUrl: expect.stringContaining("/overview/"),
      quote: expect.any(String),
      author: expect.any(String),
    });
  });

  it("returns null for a non-member", async () => {
    const t = makeConvexTest();
    const asOwner = await signIn(t, "owner@example.com");
    const asOther = await signIn(t, "other@example.com");
    await createWedding(asOwner);
    await t.run((ctx) =>
      ctx.db.insert("overviewPosterCards", {
        stableKey: "test-card",
        active: true,
        sortOrder: 1,
        imageKey: "overview/test-card.jpg",
        imageSourceUrl: "https://example.com/test-card.jpg",
        imageAlt: "A test wedding scene",
        imageCreator: "Test creator",
        imageLicense: "Test license",
        caption: "A test scene",
        quote: "A test quote.",
        author: "Test author",
        sourceTitle: "Test source",
        sourceUrl: "https://example.com/test-source",
      }),
    );
    const weddingId = await t.run(
      async (ctx) => (await ctx.db.query("weddings").unique())!._id,
    );

    await expect(
      asOther.query(api.editorial.getCurrent.handler.getCurrent, {
        weddingId,
        day: "2026-08-21",
      }),
    ).resolves.toBeNull();
  });

  it("returns null when this workspace session does not point at the wedding", async () => {
    const t = makeConvexTest();
    const asOwner = await signIn(t, "owner@example.com");
    const asOtherDevice = await extraSession(t, "owner@example.com", "mac");
    await createWedding(asOwner);
    await t.run((ctx) =>
      ctx.db.insert("overviewPosterCards", {
        stableKey: "test-card",
        active: true,
        sortOrder: 1,
        imageKey: "overview/test-card.jpg",
        imageSourceUrl: "https://example.com/test-card.jpg",
        imageAlt: "A test wedding scene",
        imageCreator: "Test creator",
        imageLicense: "Test license",
        caption: "A test scene",
        quote: "A test quote.",
        author: "Test author",
        sourceTitle: "Test source",
        sourceUrl: "https://example.com/test-source",
      }),
    );
    const weddingId = await t.run(
      async (ctx) => (await ctx.db.query("weddings").unique())!._id,
    );

    await expect(
      asOtherDevice.query(api.editorial.getCurrent.handler.getCurrent, {
        weddingId,
        day: "2026-08-21",
      }),
    ).resolves.toBeNull();
  });

  it("returns null when the catalog is empty", async () => {
    const t = makeConvexTest();
    const asOwner = await signIn(t, "owner@example.com");
    await createWedding(asOwner);
    const weddingId = await t.run(
      async (ctx) => (await ctx.db.query("weddings").unique())!._id,
    );

    await expect(
      asOwner.query(api.editorial.getCurrent.handler.getCurrent, {
        weddingId,
        day: "2026-08-21",
      }),
    ).resolves.toBeNull();
  });
});
