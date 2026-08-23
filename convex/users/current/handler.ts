import { v } from "convex/values";

import { authenticatedQuery } from "../../lib/customFunctions/authenticatedQuery";

export const current = authenticatedQuery({
  args: {},
  returns: v.object({
    _id: v.id("users"),
    _creationTime: v.number(),
    userId: v.string(),
  }),
  handler: async (ctx) => ctx.user,
});
