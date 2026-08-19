import { v } from "convex/values";

import { authenticatedQuery } from "../../lib/customFunctions/authenticatedQuery";
import { draftsForUser, draftValidator, toDraft } from "../lib/draft";

export const getDraft = authenticatedQuery({
  args: {},
  returns: v.union(v.null(), draftValidator),
  handler: async (ctx) => {
    const draft = (await draftsForUser(ctx, ctx.user._id))[0];
    if (draft === undefined) {
      return null;
    }
    return toDraft(draft);
  },
});
