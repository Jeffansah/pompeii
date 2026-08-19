import { v } from "convex/values";

import { authenticatedQuery } from "../../lib/customFunctions/authenticatedQuery";
import { memberFor, weddingsForUser } from "../lib/members";
import { workspaceSessionFor } from "../lib/workspaceSession";

const weddingSummary = v.object({
  name: v.string(),
  slug: v.string(),
});

export const getHomeState = authenticatedQuery({
  args: {},
  returns: v.union(
    v.object({
      destination: v.literal("workspace"),
      slug: v.string(),
    }),
    v.object({
      destination: v.literal("picker"),
      weddings: v.array(weddingSummary),
    }),
    v.object({
      destination: v.literal("create"),
    }),
  ),
  handler: async (ctx) => {
    const pointer = await workspaceSessionFor(ctx, ctx.sessionId);
    if (pointer !== null && pointer.weddingId !== null) {
      const wedding = await ctx.db.get(pointer.weddingId);
      const member =
        wedding === null
          ? null
          : await memberFor(ctx, ctx.user._id, wedding._id);
      if (wedding !== null && member !== null) {
        return { destination: "workspace" as const, slug: wedding.slug };
      }
    }

    const weddings = await weddingsForUser(ctx, ctx.user._id);
    if (weddings.length > 0) {
      return { destination: "picker" as const, weddings };
    }

    return { destination: "create" as const };
  },
});
