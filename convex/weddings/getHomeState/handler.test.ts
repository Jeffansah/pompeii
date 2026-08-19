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

describe("weddings/getHomeState", () => {
  it("refuses an unauthenticated caller", async () => {
    const t = makeConvexTest();
    await expectAppError(
      t.query(api.weddings.getHomeState.handler.getHomeState, {}),
      "UNAUTHENTICATED",
    );
  });

  it("sends a new account to create", async () => {
    const t = makeConvexTest();
    const asOwner = await signIn(t, "owner@example.com");
    await expect(
      asOwner.query(api.weddings.getHomeState.handler.getHomeState, {}),
    ).resolves.toEqual({ destination: "create" });
  });

  it("sends the creating session to the workspace", async () => {
    const t = makeConvexTest();
    const asOwner = await signIn(t, "owner@example.com");
    await createOwnedWedding(asOwner);

    await expect(
      asOwner.query(api.weddings.getHomeState.handler.getHomeState, {}),
    ).resolves.toEqual({
      destination: "workspace",
      slug: "amara-tomi",
    });
  });

  it("does not share the current wedding across sessions", async () => {
    const t = makeConvexTest();
    const asIpad = await signIn(t, "owner@example.com");
    await createOwnedWedding(asIpad);
    const asMac = await extraSession(t, "owner@example.com", "mac");

    await expect(
      asIpad.query(api.weddings.getHomeState.handler.getHomeState, {}),
    ).resolves.toEqual({
      destination: "workspace",
      slug: "amara-tomi",
    });
    await expect(
      asMac.query(api.weddings.getHomeState.handler.getHomeState, {}),
    ).resolves.toEqual({
      destination: "picker",
      weddings: [{ name: "Amara & Tomi", slug: "amara-tomi" }],
    });
  });

  it("does not send another user to the wedding", async () => {
    const t = makeConvexTest();
    const asOwner = await signIn(t, "owner@example.com");
    const asOther = await signIn(t, "other@example.com");
    await createOwnedWedding(asOwner);

    await expect(
      asOther.query(api.weddings.getHomeState.handler.getHomeState, {}),
    ).resolves.toEqual({ destination: "create" });
  });
});
