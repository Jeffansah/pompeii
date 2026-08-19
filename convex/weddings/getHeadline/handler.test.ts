import { describe, expect, it } from "vitest";

import { parseClientError } from "@pompeii/errors";
import { api } from "../../_generated/api";
import { extraSession, makeConvexTest, signIn } from "../../test.setup";

async function expectAppError(promise: Promise<unknown>, code: string) {
  const error = await promise.then(
    () => {
      throw new Error(`Expected ${code}`);
    },
    (caught: unknown) => caught,
  );
  expect(parseClientError(error)?.code).toBe(code);
}

async function createOwnedWedding(asUser: Awaited<ReturnType<typeof signIn>>) {
  await asUser.mutation(api.weddings.saveDraft.handler.saveDraft, {
    step: 1,
    name: "Amara & Tomi",
  });
  await asUser.mutation(api.weddings.saveDraft.handler.saveDraft, {
    step: 2,
    coupleA: "Amara",
    coupleB: "Tomi",
  });
  return await asUser.mutation(api.weddings.create.handler.create, {});
}

describe("weddings/getHeadline", () => {
  it("refuses an unauthenticated caller", async () => {
    const t = makeConvexTest();
    await expectAppError(
      t.query(api.weddings.getHeadline.handler.getHeadline, {
        slug: "amara-tomi",
      }),
      "UNAUTHENTICATED",
    );
  });

  it("returns welcome copy for a couple member", async () => {
    const t = makeConvexTest();
    const asOwner = await signIn(t, "owner@example.com");
    await createOwnedWedding(asOwner);

    await expect(
      asOwner.query(api.weddings.getHeadline.handler.getHeadline, {
        slug: "amara-tomi",
      }),
    ).resolves.toEqual({
      status: "active",
      kind: "welcome",
      foretitle: "Welcome to",
      title: "Amara & Tomi",
    });
  });

  it("returns inactive when this session has no workspace pointer", async () => {
    const t = makeConvexTest();
    const asIpad = await signIn(t, "owner@example.com");
    await createOwnedWedding(asIpad);
    const asMac = await extraSession(t, "owner@example.com", "mac");

    await expect(
      asMac.query(api.weddings.getHeadline.handler.getHeadline, {
        slug: "amara-tomi",
      }),
    ).resolves.toEqual({ status: "inactive" });
  });

  it("returns null for a missing slug", async () => {
    const t = makeConvexTest();
    const asOwner = await signIn(t, "owner@example.com");
    await expect(
      asOwner.query(api.weddings.getHeadline.handler.getHeadline, {
        slug: "missing",
      }),
    ).resolves.toBeNull();
  });

  it("returns null when the caller is not in the couple", async () => {
    const t = makeConvexTest();
    const asOwner = await signIn(t, "owner@example.com");
    const asOther = await signIn(t, "other@example.com");
    await createOwnedWedding(asOwner);

    await expect(
      asOther.query(api.weddings.getHeadline.handler.getHeadline, {
        slug: "amara-tomi",
      }),
    ).resolves.toBeNull();
  });
});
