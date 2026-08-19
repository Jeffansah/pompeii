import { describe, expect, it } from "vitest";

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

describe("weddings/getDraft", () => {
  it("refuses an unauthenticated caller", async () => {
    const t = makeConvexTest();
    await expectAppError(
      t.query(api.weddings.getDraft.handler.getDraft, {}),
      "UNAUTHENTICATED",
    );
  });

  it("refuses a JWT with no Better Auth session", async () => {
    const t = makeConvexTest();
    await expectAppError(
      t
        .withIdentity({
          subject: "ba_1",
          sessionId: "missing-session",
          issuer: "https://auth.example",
          tokenIdentifier: "https://auth.example|ba_1",
        })
        .query(api.weddings.getDraft.handler.getDraft, {}),
      "UNAUTHENTICATED",
    );
  });

  it("returns null when the caller has no draft", async () => {
    const t = makeConvexTest();
    const asOwner = await signIn(t, "owner@example.com");
    await expect(
      asOwner.query(api.weddings.getDraft.handler.getDraft, {}),
    ).resolves.toBeNull();
  });

  it("does not return another user's draft", async () => {
    const t = makeConvexTest();
    const asOwner = await signIn(t, "owner@example.com");
    const asOther = await signIn(t, "other@example.com");
    await asOwner.mutation(api.weddings.saveDraft.handler.saveDraft, {
      step: 1,
      name: "Amara & Tomi",
    });

    await expect(
      asOther.query(api.weddings.getDraft.handler.getDraft, {}),
    ).resolves.toBeNull();
  });

  it("returns one draft when extras exist for the caller", async () => {
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
      asOwner.query(api.weddings.getDraft.handler.getDraft, {}),
    ).resolves.toEqual({
      step: 1,
      name: "Amara & Tomi",
      slug: "amara-tomi",
    });
  });
});
