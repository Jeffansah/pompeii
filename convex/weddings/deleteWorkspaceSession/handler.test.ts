import { describe, expect, it } from "vitest";

import { api, internal } from "../../_generated/api";
import { extraSession, makeConvexTest, signIn } from "../../test.setup";

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

describe("weddings/deleteWorkspaceSession", () => {
  it("clears this session without touching another", async () => {
    const t = makeConvexTest();
    const asIpad = await signIn(t, "owner@example.com");
    await createOwnedWedding(asIpad);
    const asMac = await extraSession(t, "owner@example.com", "mac");
    await asMac.mutation(api.weddings.enter.handler.enter, {
      slug: "amara-tomi",
    });

    const ipadSessionId = await t.run(async (ctx) => {
      const rows = await ctx.db.query("workspaceSessions").collect();
      expect(rows).toHaveLength(2);
      return rows[0]?.sessionId;
    });
    if (ipadSessionId === undefined) {
      throw new Error("Expected a workspace session");
    }

    await t.mutation(
      internal.weddings.deleteWorkspaceSession.handler.deleteWorkspaceSession,
      { sessionId: ipadSessionId },
    );

    const ipadAfter = await asIpad.query(
      api.weddings.getHomeState.handler.getHomeState,
      {},
    );
    const macAfter = await asMac.query(
      api.weddings.getHomeState.handler.getHomeState,
      {},
    );

    const destinations = [ipadAfter.destination, macAfter.destination].sort();
    expect(destinations).toEqual(["picker", "workspace"]);
  });
});
