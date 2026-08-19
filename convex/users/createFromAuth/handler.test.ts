import { describe, expect, it } from "vitest";

import { internal } from "../../_generated/api";
import { makeConvexTest } from "../../test.setup";

describe("users/createFromAuth", () => {
  it("inserts a user keyed by the Better Auth id", async () => {
    const t = makeConvexTest();
    await t.mutation(internal.users.createFromAuth.handler.createFromAuth, {
      userId: "ba_1",
    });
    const users = await t.run(async (ctx) => {
      return await ctx.db.query("users").collect();
    });
    expect(users).toHaveLength(1);
    expect(users[0]?.userId).toBe("ba_1");
  });

  it("is a no-op when the Better Auth id already exists", async () => {
    const t = makeConvexTest();
    await t.mutation(internal.users.createFromAuth.handler.createFromAuth, {
      userId: "ba_1",
    });
    await t.mutation(internal.users.createFromAuth.handler.createFromAuth, {
      userId: "ba_1",
    });
    const users = await t.run(async (ctx) => {
      return await ctx.db.query("users").collect();
    });
    expect(users).toHaveLength(1);
  });

  it("creates a row per Better Auth id", async () => {
    const t = makeConvexTest();
    await t.mutation(internal.users.createFromAuth.handler.createFromAuth, {
      userId: "ba_1",
    });
    await t.mutation(internal.users.createFromAuth.handler.createFromAuth, {
      userId: "ba_2",
    });
    const users = await t.run(async (ctx) => {
      return await ctx.db.query("users").collect();
    });
    expect(users).toHaveLength(2);
  });
});
