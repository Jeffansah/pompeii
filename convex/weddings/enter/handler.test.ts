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

describe("weddings/enter", () => {
  it("refuses an unauthenticated caller", async () => {
    const t = makeConvexTest();
    await expectAppError(
      t.mutation(api.weddings.enter.handler.enter, { slug: "amara-tomi" }),
      "UNAUTHENTICATED",
    );
  });

  it("sets the current wedding on this session only", async () => {
    const t = makeConvexTest();
    const asIpad = await signIn(t, "owner@example.com");
    await createOwnedWedding(asIpad);
    const asMac = await extraSession(t, "owner@example.com", "mac");

    await expect(
      asMac.mutation(api.weddings.enter.handler.enter, { slug: "amara-tomi" }),
    ).resolves.toEqual({ slug: "amara-tomi" });

    await expect(
      asMac.query(api.weddings.getHomeState.handler.getHomeState, {}),
    ).resolves.toEqual({
      destination: "workspace",
      slug: "amara-tomi",
    });
    await expect(
      asIpad.query(api.weddings.getHomeState.handler.getHomeState, {}),
    ).resolves.toEqual({
      destination: "workspace",
      slug: "amara-tomi",
    });
  });

  it("returns not found when the caller is not a member", async () => {
    const t = makeConvexTest();
    const asOwner = await signIn(t, "owner@example.com");
    const asOther = await signIn(t, "other@example.com");
    await createOwnedWedding(asOwner);

    await expectAppError(
      asOther.mutation(api.weddings.enter.handler.enter, {
        slug: "amara-tomi",
      }),
      "WEDDINGS_ENTER_NOT_FOUND",
    );
    await expect(
      asOther.query(api.weddings.getHomeState.handler.getHomeState, {}),
    ).resolves.toEqual({ destination: "create" });
  });
});
