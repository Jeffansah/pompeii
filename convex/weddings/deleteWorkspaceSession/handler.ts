import { v } from "convex/values";

import { internalMutation } from "../../_generated/server";
import { deleteWorkspaceSession as removeWorkspaceSession } from "../lib/workspaceSession";

export const deleteWorkspaceSession = internalMutation({
  args: { sessionId: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    await removeWorkspaceSession(ctx, args.sessionId);
    return null;
  },
});
